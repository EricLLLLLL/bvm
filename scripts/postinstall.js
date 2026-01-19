#!/usr/bin/env node

/**
 * BVM Post-install Script
 * Standardized Installation Workflow:
 * 1. Init & Deploy Assets
 * 2. Detect System Bun
 * 3. Smoke Test System Bun
 * 4. Configure Runtime (Reuse or Download)
 * 5. Setup Shell Environment
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const os = require('os');

// --- Constants & Config ---
const ASCII_LOGO = `
\x1b[36m
__________              
\\______   \__  _______  
 |    |  _|  \/ /     \ 
 |    |   \\   /  Y Y  \ 
 |______  / \_/|__|_|  / 
        \/           \/ 
\x1b[0m`;

const HOME = process.env.HOME || os.homedir();
const BVM_DIR = process.env.BVM_DIR || path.join(HOME, '.bvm');
const BVM_SRC_DIR = path.join(BVM_DIR, 'src');
const BVM_BIN_DIR = path.join(BVM_DIR, 'bin');
const PKG_ROOT = path.resolve(__dirname, '..');
const DIST_DIR = path.join(PKG_ROOT, 'dist');
const LOG_FILE = '/tmp/bvm-install.log';

// --- Helpers ---
function log(msg) {
    const line = `[bvm] ${msg}`;
    console.log(line);
    try { fs.appendFileSync(LOG_FILE, line + '\n'); } catch(e) {}
}

function error(msg) {
    const line = `[bvm] ERROR: ${msg}`;
    console.error(`\x1b[31m${line}\x1b[0m`);
    try { fs.appendFileSync(LOG_FILE, line + '\n'); } catch(e) {}
}

function ensureDir(dir) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function ensureVersionPrefix(version) {
    return version.startsWith('v') ? version : `v${version}`;
}

// --- Core Logic ---

async function main() {
    console.log(ASCII_LOGO);
    log('Starting BVM post-install setup...');

    // 1. Conflict Detection
    const BVM_EXEC = path.join(BVM_BIN_DIR, 'bvm');
    if (fs.existsSync(BVM_EXEC) && !process.env.BVM_FORCE_INSTALL) {
        try {
            const content = fs.readFileSync(BVM_EXEC, 'utf-8');
            if (!content.includes('BVM_INSTALL_SOURCE="npm"')) {
                // Native install exists
                // We should probably warn but proceed if it's just an update
                log('Native BVM installation detected. Proceeding to update assets...');
            }
        } catch (e) {}
    }

    // 2. Deploy Assets
    log(`Deploying to ${BVM_DIR}...`);
    ensureDir(BVM_SRC_DIR);
    ensureDir(BVM_BIN_DIR);

    const filesToCopy = [
        { src: 'index.js', destDir: BVM_SRC_DIR, name: 'index.js' },
        { src: 'bvm-shim.sh', destDir: BVM_BIN_DIR, name: 'bvm-shim.sh', mode: 0o755 },
        { src: 'bvm-shim.js', destDir: BVM_BIN_DIR, name: 'bvm-shim.js' }
    ];

    for (const file of filesToCopy) {
        const srcPath = path.join(DIST_DIR, file.src);
        const destPath = path.join(file.destDir, file.name);

        if (fs.existsSync(srcPath)) {
            fs.copyFileSync(srcPath, destPath);
            if (file.mode) fs.chmodSync(destPath, file.mode);
        } else {
            error(`Source file not found: ${srcPath}`);
        }
    }

    // 3. Detect & Configure Runtime
    let activeRuntimePath = null;
    let activeVersion = null;

    // A. Check for System Bun
    const systemBun = detectSystemBun();
    let systemBunCompatible = false;

    if (systemBun) {
        log(`Found system Bun at ${systemBun.path} (v${systemBun.version})`);
        // B. Smoke Test
        if (runSmokeTest(systemBun.path)) {
            log('Smoke Test passed: System Bun is compatible.');
            systemBunCompatible = true;
            activeVersion = ensureVersionPrefix(systemBun.version);
            
            // Register System Bun as a version
            const versionDir = path.join(BVM_DIR, 'versions', activeVersion);
            registerBunVersion(systemBun.path, versionDir);
            
            // Set as Active Runtime
            activeRuntimePath = versionDir;
        } else {
            log('Smoke Test failed: System Bun cannot run BVM core.');
            // Still register it, but don't use it as runtime
            const versionDir = path.join(BVM_DIR, 'versions', ensureVersionPrefix(systemBun.version));
            registerBunVersion(systemBun.path, versionDir);
        }
    } else {
        log('No system Bun detected.');
    }

    // C. Download Fallback if needed
    if (!systemBunCompatible) {
        log('Downloading compatible Bun runtime...');
        try {
            const installedVersion = downloadAndInstallRuntime(BVM_DIR);
            if (installedVersion) {
                activeVersion = installedVersion;
                activeRuntimePath = path.join(BVM_DIR, 'versions', activeVersion);
            } else {
                throw new Error('Download failed');
            }
        } catch (e) {
            error(`Failed to download runtime: ${e.message}`);
            // Fallback: If we have a system bun (even if smoke test failed), use it as a last resort?
            // No, better to fail loud or guide user.
        }
    }

    // 4. Link Runtime & Default Alias
    if (activeRuntimePath && activeVersion) {
        const legacyCurrentLink = path.join(BVM_DIR, 'current'); // For users & shims
        const privateRuntimeLink = path.join(BVM_DIR, 'runtime', 'current'); // For BVM itself
        ensureDir(path.join(BVM_DIR, 'runtime'));

        // A. Link private runtime
        try { if (fs.existsSync(privateRuntimeLink)) fs.unlinkSync(privateRuntimeLink); } catch(e) {}
        try { fs.symlinkSync(activeRuntimePath, privateRuntimeLink, 'dir'); } catch(e) {}

        // B. Link user active version (Initial)
        try { if (fs.existsSync(legacyCurrentLink)) fs.unlinkSync(legacyCurrentLink); } catch(e) {}
        try { fs.symlinkSync(activeRuntimePath, legacyCurrentLink, 'dir'); } catch(e) {}

        // Set Default Alias
        const aliasDir = path.join(BVM_DIR, 'aliases');
        ensureDir(aliasDir);
        fs.writeFileSync(path.join(aliasDir, 'default'), activeVersion);
        
        log(`Active runtime set to ${activeVersion}`);
    }

    // 5. Create BVM Wrapper
    createBvmWrapper();

    // 6. Configure Shell (bvm setup)
    log('Configuring shell environment...');
    const setupResult = spawnSync(path.join(BVM_BIN_DIR, 'bvm'), ['setup', '--silent'], {
        stdio: 'inherit',
        env: Object.assign({}, process.env, { BVM_DIR })
    });

    // 7. Final Success Message
    printSuccessMessage(!!systemBun);
}

// --- Implementation Details ---

function detectSystemBun() {
    // 1. Try PATH
    const which = spawnSync('which', ['bun'], { encoding: 'utf-8' });
    if (which.status === 0 && which.stdout) {
        const binPath = which.stdout.trim();
        const ver = getBunVersion(binPath);
        if (ver) return { path: binPath, version: ver };
    }
    return null;
}

function getBunVersion(binPath) {
    try {
        const proc = spawnSync(binPath, ['--version'], { encoding: 'utf-8' });
        if (proc.status === 0) return proc.stdout.trim().replace(/^v/, '');
    } catch (e) {}
    return null;
}

function runSmokeTest(binPath) {
    try {
        const indexJs = path.join(BVM_SRC_DIR, 'index.js');
        const proc = spawnSync(binPath, [indexJs, '--version'], { 
            encoding: 'utf-8',
            env: Object.assign({}, process.env, { BVM_DIR })
        });
        return proc.status === 0;
    } catch (e) {
        return false;
    }
}

function registerBunVersion(sourceBin, targetDir) {
    const targetBinDir = path.join(targetDir, 'bin');
    ensureDir(targetBinDir);
    const targetBin = path.join(targetBinDir, 'bun');
    if (!fs.existsSync(targetBin)) {
        fs.copyFileSync(sourceBin, targetBin);
        fs.chmodSync(targetBin, 0o755);
    }
}

function downloadAndInstallRuntime(bvmDir) {
    const platform = process.platform;
    const arch = process.arch;
    
    let pkgPlatform = '';
    if (platform === 'darwin') pkgPlatform = 'darwin';
    else if (platform === 'linux') pkgPlatform = 'linux';
    else if (platform === 'win32') pkgPlatform = 'windows';
    else return null;

    const pkgArch = arch === 'arm64' ? 'aarch64' : 'x64';
    // Hardcoded fallback version if download fails calculation?
    // Ideally we fetch latest, but for postinstall simplicity we use a known good one or fetch
    const bunVer = '1.1.13'; 
    const vBunVer = ensureVersionPrefix(bunVer);

    // Using npmmirror for speed in CN, but ideally should be dynamic. 
    // For now hardcode mirror for reliability in this script context.
    const registry = 'https://registry.npmmirror.com'; 
    const pkgName = `@oven/bun-${pkgPlatform}-${pkgArch}`;
    const url = `${registry}/${pkgName}/-/${pkgName.split('/').pop()}-${bunVer}.tgz`;

    const tempTgz = path.join(os.tmpdir(), `bun-${Date.now()}.tgz`);
    const extractDir = path.join(os.tmpdir(), `bun-ext-${Date.now()}`);

    try {
        log(`Downloading Bun ${bunVer}...`);
        spawnSync('curl', ['-L', '-s', '-o', tempTgz, url]);
        
        ensureDir(extractDir);
        spawnSync('tar', ['-xzf', tempTgz, '-C', extractDir]);

        const exeName = platform === 'win32' ? 'bun.exe' : 'bun';
        const foundBinProc = spawnSync('find', [extractDir, '-name', exeName], { encoding: 'utf-8' });
        const binPath = foundBinProc.stdout ? foundBinProc.stdout.trim().split('\n')[0] : null;

        if (binPath && fs.existsSync(binPath)) {
            const versionDir = path.join(bvmDir, 'versions', vBunVer);
            registerBunVersion(binPath, versionDir);
            return vBunVer;
        }
    } catch (e) {
        error(`Download failed: ${e.message}`);
    } finally {
        try { 
            if (fs.existsSync(tempTgz)) fs.unlinkSync(tempTgz);
            if (fs.existsSync(extractDir)) fs.rmSync(extractDir, { recursive: true });
        } catch(e) {}
    }
    return null;
}

function createBvmWrapper() {
    const wrapperContent = `#!/bin/bash
export BVM_DIR="${BVM_DIR}"
export BVM_INSTALL_SOURCE="npm"

# 1. Try BVM Managed Runtime (The one we just configured)
if [ -x "\${BVM_DIR}/runtime/current/bin/bun" ]; then
  exec "\${BVM_DIR}/runtime/current/bin/bun" "\${BVM_DIR}/src/index.js" "$@"
# 2. Try System Bun (Fallback)
elif command -v bun >/dev/null 2>&1; then
  exec bun "\${BVM_DIR}/src/index.js" "$@"
else
  echo "Error: BVM requires Bun. Please ensure setup completed correctly."
  exit 1
fi
`;
    const bvmExec = path.join(BVM_BIN_DIR, 'bvm');
    fs.writeFileSync(bvmExec, wrapperContent);
    fs.chmodSync(bvmExec, 0o755);
}

function printSuccessMessage(hasSystemBun) {
    const shell = process.env.SHELL || '';
    let configFile = '~/.zshrc';
    if (shell.includes('bash')) configFile = '~/.bashrc';
    else if (shell.includes('fish')) configFile = '~/.config/fish/config.fish';

    console.log('\n\x1b[32m\x1b[1m🎉 BVM (Bun Version Manager) installed successfully!\x1b[0m');
    
    if (hasSystemBun) {
        console.log('\x1b[33mBVM has been added to the END of your PATH configuration to ensure priority.\x1b[0m');
        console.log('\x1b[33mYour existing Bun installations were NOT deleted and will coexist.\x1b[0m');
    } else {
        console.log('\x1b[33mBVM has installed a compatible Bun runtime for you.\x1b[0m');
    }

    console.log('\n\x1b[1mTo finalize the setup, please restart your terminal or run:\x1b[0m');
    console.log(`\x1b[36m  source ${configFile}\x1b[0m\n`);
}

// Execute
main().catch(e => error(e.message));
