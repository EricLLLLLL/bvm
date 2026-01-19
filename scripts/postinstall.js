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
\______   \__  _______  
 |    |  _|  \/ /     \ 
 |    |   \\   /  Y Y  \ 
 |______  / \_/|__|_|  / 
        \/           \/ 
\x1b[0m`;

const IS_WINDOWS = process.platform === 'win32';
const HOME = process.env.HOME || os.homedir();
const BVM_DIR = process.env.BVM_DIR || path.join(HOME, '.bvm');
const BVM_SRC_DIR = path.join(BVM_DIR, 'src');
const BVM_BIN_DIR = path.join(BVM_DIR, 'bin');
const PKG_ROOT = path.resolve(__dirname, '..');
const DIST_DIR = path.join(PKG_ROOT, 'dist');
const LOG_FILE = path.join(os.tmpdir(), 'bvm-install.log');

// --- Helpers ---
function log(msg) {
    const line = `[bvm] ${msg}`;
    process.stdout.write(line + '\n');
    try { fs.appendFileSync(LOG_FILE, line + '\n'); } catch(e) {}
}

function error(msg) {
    const line = `[bvm] ERROR: ${msg}`;
    process.stderr.write(`\x1b[31m${line}\x1b[0m\n`);
    try { fs.appendFileSync(LOG_FILE, line + '\n'); } catch(e) {}
}

function ensureDir(dir) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function ensureVersionPrefix(version) {
    if (!version) return 'v0.0.0';
    return version.startsWith('v') ? version : `v${version}`;
}

function findFileSync(dir, name) {
    try {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                const found = findFileSync(fullPath, name);
                if (found) return found;
            } else if (file.toLowerCase() === name.toLowerCase() || file.toLowerCase() === (name + '.exe').toLowerCase()) {
                return fullPath;
            }
        }
    } catch(e) {}
    return null;
}

// --- Core Logic ---

function main() {
    process.stdout.write('\n' + ASCII_LOGO + '\n');
    log('Starting BVM post-install setup...');

    // 1. Deploy Assets
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
        } else if (!IS_WINDOWS || !file.name.endsWith('.sh')) {
            error(`Source asset missing: ${srcPath}`);
        }
    }

    // 2. Detect & Configure Runtime
    let activeRuntimePath = null;
    let activeVersion = null;

    const systemBun = detectSystemBun();
    let systemBunCompatible = false;

    if (systemBun) {
        log(`Found system Bun at ${systemBun.path} (v${systemBun.version}). Running Smoke Test...`);
        if (runSmokeTest(systemBun.path)) {
            log('Smoke Test passed: System Bun is compatible.');
            systemBunCompatible = true;
            activeVersion = ensureVersionPrefix(systemBun.version);
            const versionDir = path.join(BVM_DIR, 'versions', activeVersion);
            registerBunVersion(systemBun.path, versionDir);
            activeRuntimePath = versionDir;
        } else {
            log('Smoke Test failed: System Bun cannot run BVM core.');
            const versionDir = path.join(BVM_DIR, 'versions', ensureVersionPrefix(systemBun.version));
            registerBunVersion(systemBun.path, versionDir);
        }
    } else {
        log('No system Bun detected.');
    }

    if (!systemBunCompatible) {
        log('Downloading compatible Bun runtime...');
        try {
            const installedVersion = downloadAndInstallRuntime(BVM_DIR);
            if (installedVersion) {
                activeVersion = installedVersion;
                activeRuntimePath = path.join(BVM_DIR, 'versions', activeVersion);
            } else {
                throw new Error('Download or installation failed');
            }
        } catch (e) {
            error(`Failed to download runtime: ${e.message}`);
        }
    }

    // 3. Link Runtime & Default Alias
    if (activeRuntimePath && activeVersion) {
        const legacyCurrentLink = path.join(BVM_DIR, 'current');
        const privateRuntimeLink = path.join(BVM_DIR, 'runtime', 'current');
        ensureDir(path.join(BVM_DIR, 'runtime'));

        const linkType = IS_WINDOWS ? 'junction' : 'dir';

        try { if (fs.existsSync(privateRuntimeLink)) fs.unlinkSync(privateRuntimeLink); } catch(e) {}
        try { fs.symlinkSync(activeRuntimePath, privateRuntimeLink, linkType); } catch(e) {}

        try { if (fs.existsSync(legacyCurrentLink)) fs.unlinkSync(legacyCurrentLink); } catch(e) {}
        try { fs.symlinkSync(activeRuntimePath, legacyCurrentLink, linkType); } catch(e) {}

        const aliasDir = path.join(BVM_DIR, 'aliases');
        ensureDir(aliasDir);
        fs.writeFileSync(path.join(aliasDir, 'default'), activeVersion);
        log(`Active runtime set to ${activeVersion}`);
    }

    // 4. Create BVM Wrapper
    createBvmWrapper();

    // 5. Configure Shell (bvm setup)
    log('Configuring shell environment...');
    // CRITICAL: On Windows, use 'node <index.js> setup' directly to avoid wrapper popup/issues
    const bunPath = path.join(BVM_DIR, 'runtime', 'current', 'bin', IS_WINDOWS ? 'bun.exe' : 'bun');
    const indexJs = path.join(BVM_SRC_DIR, 'index.js');
    
    if (fs.existsSync(bunPath)) {
        spawnSync(bunPath, [indexJs, 'setup', '--silent'], {
            stdio: 'inherit',
            env: Object.assign({}, process.env, { BVM_DIR }),
            shell: IS_WINDOWS // Essential for Windows stability
        });
    }

    printSuccessMessage(!!systemBun);
}

// --- Implementation Details ---

function detectSystemBun() {
    const cmd = IS_WINDOWS ? 'where' : 'which';
    const which = spawnSync(cmd, ['bun'], { encoding: 'utf-8', shell: IS_WINDOWS });
    if (which.status === 0 && which.stdout) {
        const binPath = which.stdout.trim().split('\n')[0].trim();
        const ver = getBunVersion(binPath);
        if (ver) return { path: binPath, version: ver };
    }
    return null;
}

function getBunVersion(binPath) {
    try {
        const proc = spawnSync(binPath, ['--version'], { encoding: 'utf-8', shell: IS_WINDOWS });
        if (proc.status === 0) return proc.stdout.trim().replace(/^v/, '');
    } catch (e) {}
    return null;
}

function runSmokeTest(binPath) {
    try {
        const indexJs = path.join(BVM_SRC_DIR, 'index.js');
        const proc = spawnSync(binPath, [indexJs, '--version'], { 
            encoding: 'utf-8',
            env: Object.assign({}, process.env, { BVM_DIR }),
            shell: IS_WINDOWS
        });
        return proc.status === 0;
    } catch (e) {
        return false;
    }
}

function registerBunVersion(sourceBin, targetDir) {
    const exeName = IS_WINDOWS ? 'bun.exe' : 'bun';
    const targetBinDir = path.join(targetDir, 'bin');
    ensureDir(targetBinDir);
    const targetBin = path.join(targetBinDir, exeName);
    if (!fs.existsSync(targetBin)) {
        try {
            fs.copyFileSync(sourceBin, targetBin);
            fs.chmodSync(targetBin, 0o755);
        } catch(e) {
            error(`Failed to register version: ${e.message}`);
        }
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
    const bunVer = '1.1.13'; 
    const vBunVer = ensureVersionPrefix(bunVer);
    const registry = 'https://registry.npmmirror.com'; 
    const pkgName = `@oven/bun-${pkgPlatform}-${pkgArch}`;
    const url = `${registry}/${pkgName}/-/${pkgName.split('/').pop()}-${bunVer}.tgz`;

    const tempTgz = path.join(os.tmpdir(), `bun-rt-${Date.now()}.tgz`);
    const extractDir = path.join(os.tmpdir(), `bun-rt-ext-${Date.now()}`);

    try {
        log(`Downloading compatible Bun runtime v${bunVer}...`);
        const curl = IS_WINDOWS ? 'curl.exe' : 'curl';
        const dl = spawnSync(curl, ['-L', '-s', '-o', tempTgz, url], { shell: IS_WINDOWS });
        if (dl.status !== 0) throw new Error('Download failed');
        
        ensureDir(extractDir);
        const ex = spawnSync('tar', ['-xzf', tempTgz, '-C', extractDir], { shell: IS_WINDOWS });
        if (ex.status !== 0) throw new Error('Extraction failed');

        const exeName = IS_WINDOWS ? 'bun.exe' : 'bun';
        const binPath = findFileSync(extractDir, exeName);

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
    if (IS_WINDOWS) {
        const bvmDirWin = BVM_DIR.replace(/\//g, '\\');
        // Standard bvm.cmd
        const bvmCmd = `@echo off\r\nset "BVM_DIR=${bvmDirWin}"\r\nset "BVM_INSTALL_SOURCE=npm"\r\n"%BVM_DIR%\\runtime\\current\\bin\\bun.exe" "%BVM_DIR%\\src\\index.js" %*`;
        fs.writeFileSync(path.join(BVM_BIN_DIR, 'bvm.cmd'), bvmCmd);
        // extensionless 'bvm' for mingw/git-bash users
        const bvmUnix = `#!/bin/sh\nexport BVM_DIR="${BVM_DIR}"\nexec "${BVM_DIR}/runtime/current/bin/bun" "${BVM_DIR}/src/index.js" "$@"`;
        fs.writeFileSync(path.join(BVM_BIN_DIR, 'bvm'), bvmUnix);
    } else {
        const wrapperContent = `#!/bin/bash
export BVM_DIR="${BVM_DIR}"
export BVM_INSTALL_SOURCE="npm"
if [ -x "${BVM_DIR}/runtime/current/bin/bun" ]; then
  exec "${BVM_DIR}/runtime/current/bin/bun" "${BVM_DIR}/src/index.js" "\$@"
elif command -v bun >/dev/null 2>&1; then
  exec bun "${BVM_DIR}/src/index.js" "\$@"
else
  echo "Error: BVM requires Bun. Please ensure setup completed correctly."
  exit 1
fi
`;
        const bvmExec = path.join(BVM_BIN_DIR, 'bvm');
        fs.writeFileSync(bvmExec, wrapperContent);
        fs.chmodSync(bvmExec, 0o755);
    }
}

function printSuccessMessage(hasSystemBun) {
    if (IS_WINDOWS) {
        process.stdout.write('\n\x1b[32m\x1b[1m🎉 BVM (Bun Version Manager) installed successfully!\x1b[0m\n');
        process.stdout.write('\x1b[33mBVM has been added to your user PATH via Windows Environment.\x1b[0m\n');
        process.stdout.write('\n\x1b[1mPlease RESTART your terminal to start using BVM.\x1b[0m\n');
        return;
    }

    const shell = process.env.SHELL || '';
    let configFile = '~/.zshrc';
    if (shell.includes('bash')) configFile = '~/.bashrc';
    else if (shell.includes('fish')) configFile = '~/.config/fish/config.fish';

    process.stdout.write('\n\x1b[32m\x1b[1m🎉 BVM (Bun Version Manager) installed successfully!\x1b[0m\n');
    process.stdout.write('\n\x1b[1mTo finalize the setup, please restart your terminal or run:\x1b[0m\n');
    process.stdout.write(`  source ${configFile}\n\n`);
}

// Execute
try {
    main();
} catch (e) {
    error(e.message);
}
