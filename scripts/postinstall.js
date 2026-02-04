#!/usr/bin/env node

/**
 * BVM Post-install Script (Smart Edition)
 * Bunker-First: Manages BVM private runtime in runtime/ bunker.
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const os = require('os');

const IS_WINDOWS = process.platform === 'win32';
const HOME = process.env.HOME || os.homedir();
const BVM_DIR = process.env.BVM_DIR || path.join(HOME, '.bvm');
const BVM_SRC_DIR = path.join(BVM_DIR, 'src');
const BVM_BIN_DIR = path.join(BVM_DIR, 'bin');
const PKG_ROOT = path.resolve(__dirname, '..');
const DIST_DIR = path.join(PKG_ROOT, 'dist');

function log(msg) { console.log(`[bvm] ${msg}`); }
function error(msg) { console.error(`\x1b[31m[bvm] ERROR: ${msg}\x1b[0m`); }

function run(cmd, args, opts = {}) {
    const options = Object.assign({ encoding: 'utf-8' }, opts);
    if (IS_WINDOWS) {
        // Avoid shell: true to prevent DEP0190, but handle .cmd manually
        if (cmd.endsWith('.cmd') || cmd.endsWith('.bat') || cmd === 'npm') {
             // npm might be npm.cmd or npm.ps1, safest is cmd /c
             return spawnSync('cmd', ['/d', '/s', '/c', cmd, ...args], { ...options, windowsVerbatimArguments: true });
        }
        // For executables like curl.exe, tar.exe, execute directly
        return spawnSync(cmd, args, options);
    }
    // Unix: avoid shell: true for raw commands to prevent DEP0190
    return spawnSync(cmd, args, options);
}

function findBinary(dir, name) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const full = path.join(dir, file);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
            const res = findBinary(full, name);
            if (res) return res;
        } else if (file === name || (IS_WINDOWS && file === name + '.exe')) {
            return full;
        }
    }
    return null;
}

function setupBunker(verDir, ver) {
    const runtimeRoot = path.join(BVM_DIR, 'runtime');
    if (!fs.existsSync(runtimeRoot)) fs.mkdirSync(runtimeRoot, { recursive: true });
    
    const bunkerDir = path.join(runtimeRoot, ver);
    if (verDir !== bunkerDir && fs.existsSync(verDir)) {
        if (!fs.existsSync(bunkerDir)) fs.renameSync(verDir, bunkerDir);
    } else if (!fs.existsSync(bunkerDir)) {
        fs.mkdirSync(bunkerDir, { recursive: true });
    }

    const currentLink = path.join(runtimeRoot, 'current');
    const userCurrentLink = path.join(BVM_DIR, 'current');
    const versionsDir = path.join(BVM_DIR, 'versions');
    if (!fs.existsSync(versionsDir)) fs.mkdirSync(versionsDir, { recursive: true });
    const versionLink = path.join(versionsDir, ver);

    const linkType = IS_WINDOWS ? 'junction' : 'dir';

    // 1. Link versions/vX.Y.Z -> runtime/vX.Y.Z (Crucial for bvm ls/use)
    try { if (fs.existsSync(versionLink)) fs.unlinkSync(versionLink); } catch(e) {
        if (IS_WINDOWS) run('cmd', ['/c', 'rmdir', versionLink]);
    }
    try { fs.symlinkSync(bunkerDir, versionLink, linkType); } catch(e) {}

    // 2. Link current -> versions/vX.Y.Z
    [currentLink, userCurrentLink].forEach(link => {
        try { if (fs.existsSync(link)) fs.unlinkSync(link); } catch(e) {
            if (IS_WINDOWS) run('cmd', ['/c', 'rmdir', link]);
        }
        // Current always points to the registry entry
        const target = link === currentLink ? bunkerDir : versionLink;
        try { fs.symlinkSync(target, link, linkType); } catch(e) {}
    });
    
    const aliasDir = path.join(BVM_DIR, 'aliases');
    if (!fs.existsSync(aliasDir)) fs.mkdirSync(aliasDir, { recursive: true });
    fs.writeFileSync(path.join(aliasDir, 'default'), ver);

    // 3. Generate bunfig.toml in bunker
    const binDir = path.join(bunkerDir, 'bin');
    const bunkerAbs = path.resolve(bunkerDir);
    const binAbs = path.resolve(binDir);
    const winBunker = bunkerAbs.replace(/\\/g, '\\\\');
    const winBin = binAbs.replace(/\\/g, '\\\\');
    const bunfigContent = `[install]\nglobalDir = "${winBunker}"\nglobalBinDir = "${winBin}"\n`;
    fs.writeFileSync(path.join(bunkerDir, 'bunfig.toml'), bunfigContent);
}

function getNativeArch() {
    const arch = process.arch;
    if (process.platform === 'darwin' && arch === 'x64') {
        try {
            const check = spawnSync('sysctl', ['-n', 'sysctl.proc_translated'], { encoding: 'utf-8' });
            if (check.stdout.trim() === '1') return 'arm64';
        } catch (e) {}
    }
    return arch;
}

function hasAvx2() {
    if (process.platform === 'win32') return true;
    try {
        if (process.platform === 'darwin') return spawnSync('sysctl', ['-a'], { encoding: 'utf-8' }).stdout.includes('AVX2');
        else if (process.platform === 'linux') return fs.readFileSync('/proc/cpuinfo', 'utf-8').includes('avx2');
    } catch (e) {}
    return true;
}

function getFastestRegistry() {
    const registries = [
        { name: 'npmmirror', url: 'https://registry.npmmirror.com' },
        { name: 'npmjs', url: 'https://registry.npmjs.org' }
    ];
    log('Racing registries for speed...');
    const results = registries.map(reg => {
        const start = Date.now();
        const res = run('curl', ['-I', '-s', '--connect-timeout', '2', reg.url]);
        return { ...reg, time: res.status === 0 ? (Date.now() - start) : 9999 };
    });
    results.sort((a, b) => a.time - b.time);
    log(`Winner: ${results[0].name} (${results[0].time}ms)`);
    return results;
}

function downloadAndInstall() {
    const platform = process.platform === 'win32' ? 'windows' : process.platform;
    const arch = getNativeArch() === 'arm64' ? 'aarch64' : 'x64';
    const pkgName = `@oven/bun-${platform}-${arch}${ (arch === 'x64' && !hasAvx2()) ? '-baseline' : ''}`;
    
    const sortedRegs = getFastestRegistry();
    const versionsToTry = ['latest', '1.3.6'];
    const tempTgz = path.join(os.tmpdir(), `bvm-bun-${Date.now()}.tgz`);

    for (const verReq of versionsToTry) {
        log(`\n--- Attempting Bun ${verReq} ---`);
        for (const reg of sortedRegs) {
            if (reg.time >= 9999) continue;
            const target = verReq === 'latest' ? pkgName : `${pkgName}@${verReq}`;
            log(`Checking ${target} from ${reg.name}...`);
            const infoRes = run('npm', ['info', target, '--json', '--registry', reg.url]);
            if (infoRes.status !== 0 || !infoRes.stdout) continue;
            try {
                const info = JSON.parse(infoRes.stdout);
                const data = Array.isArray(info) ? info[0] : info;
                if (!data.dist || !data.dist.tarball) continue;
                const url = data.dist.tarball.trim();
                const version = data.version;
                log(`Downloading Bun v${version} from ${reg.name}...`);
                // Use -C - to support resume, and increase timeout to 10 minutes (600s)
                const dl = run('curl', ['-L', '--fail', '-C', '-', '--connect-timeout', '20', '--max-time', '600', '--retry', '3', '-o', tempTgz, url], { stdio: 'inherit' });
                if (dl.status === 0) {
                    log('Extracting runtime... ');
                    const extractDir = path.join(os.tmpdir(), `bvm-ext-${Date.now()}`);
                    fs.mkdirSync(extractDir, { recursive: true });
                    const ex = run('tar', ['-xzf', tempTgz, '-C', extractDir]);
                    if (ex.status === 0) {
                        const foundBin = findBinary(extractDir, IS_WINDOWS ? 'bun.exe' : 'bun');
                        if (foundBin) {
                            const verName = 'v' + version.replace(/^v/, '');
                            const bunkerDir = path.join(BVM_DIR, 'runtime', verName);
                            const binDir = path.join(bunkerDir, 'bin');
                            if (!fs.existsSync(binDir)) fs.mkdirSync(binDir, { recursive: true });
                            fs.copyFileSync(foundBin, path.join(binDir, IS_WINDOWS ? 'bun.exe' : 'bun'));
                            setupBunker(bunkerDir, verName);
                            log(`🎉 Successfully installed Bun ${verName} via ${reg.name}.`);
                            try { fs.unlinkSync(tempTgz); } catch(e) {}
                            return true;
                        }
                    }
                } else {
                    // Cleanup partial file on complete failure of this URL attempt
                    try { if (fs.existsSync(tempTgz)) fs.unlinkSync(tempTgz); } catch(e) {}
                }
            } catch (e) {}
        }
    }
    return false;
}

function createWrappers() {
    const bvmBin = path.join(BVM_BIN_DIR, IS_WINDOWS ? 'bvm.cmd' : 'bvm');
    const bvmDirWin = BVM_DIR.replace(/\//g, '\\');
    const entryPath = path.join(PKG_ROOT, 'bin', 'bvm-npm.js');
    const bvmSrc = path.join(BVM_DIR, 'src', 'index.js');
    const bunkerBun = path.join(BVM_DIR, 'runtime', 'current', 'bin', IS_WINDOWS ? 'bun.exe' : 'bun');
    const bunkerBunWin = bunkerBun.replace(/\//g, '\\');
    const bvmSrcWin = bvmSrc.replace(/\//g, '\\');
    if (IS_WINDOWS) {
        const content = `@echo off\r\nset "BVM_DIR=${bvmDirWin}"\r\nif exist "${bunkerBunWin}" (\r\n  "${bunkerBunWin}" "${bvmSrcWin}" %*\r\n) else (\r\n  node "${entryPath}" %*\r\n)`;
        fs.writeFileSync(bvmBin, content);
        fs.writeFileSync(path.join(BVM_BIN_DIR, 'bvm'), '# BVM Windows Shim\n');
    } else {
        const content = `#!/bin/bash\nexport BVM_DIR="${BVM_DIR}"\nif [ -f "${bunkerBun}" ]; then\n  exec "${bunkerBun}" "${bvmSrc}" "$@"\nelse\n  node "${entryPath}" "$@"\nfi`;
        fs.writeFileSync(bvmBin, content);
        fs.chmodSync(bvmBin, 0o755);
    }
}

function main() {
    log('Starting BVM post-install setup...');
    if (!fs.existsSync(path.join(DIST_DIR, 'index.js'))) return;
    [BVM_SRC_DIR, BVM_BIN_DIR].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });
    
    // Windows-specific diagnostics
    if (IS_WINDOWS) {
        log('Windows detected. Checking PATH configuration...');
        const userPath = process.env.PATH || '';
        const bvmInPath = userPath.includes('.bvm\\shims') || userPath.includes('.bvm\\bin');
        if (!bvmInPath) {
            console.log('\x1b[33m[bvm] WARNING: BVM directories not found in PATH.\x1b[0m');
            console.log('\x1b[33m[bvm] After installation, please run: bvm setup\x1b[0m');
        }
    }
    const assets = [ { src: 'index.js', dest: path.join(BVM_SRC_DIR, 'index.js') }, { src: 'bvm-shim.sh', dest: path.join(BVM_BIN_DIR, 'bvm-shim.sh') }, { src: 'bvm-shim.js', dest: path.join(BVM_BIN_DIR, 'bvm-shim.js') } ];
    assets.forEach(a => { const srcPath = path.join(DIST_DIR, a.src); if (fs.existsSync(srcPath)) fs.copyFileSync(srcPath, a.dest); });

    function normalizeForCompare(p) {
        try { return path.resolve(p).replace(/\\/g, '/').toLowerCase(); } catch { return String(p).replace(/\\/g, '/').toLowerCase(); }
    }

    function isLikelyScript(p) {
        const lower = p.toLowerCase();
        if (IS_WINDOWS) {
            return lower.endsWith('.cmd') || lower.endsWith('.bat') || lower.endsWith('.ps1');
        }
        try {
            const buf = fs.readFileSync(p, { encoding: 'utf-8' });
            return buf.startsWith('#!');
        } catch {
            return false;
        }
    }

    let hasValidBun = false;
    const checkBun = run(IS_WINDOWS ? 'where' : 'which', ['bun']);
    if (checkBun.status === 0 && checkBun.stdout) {
        const candidates = checkBun.stdout.trim().split(/\r?\n/).map(p => p.trim()).filter(Boolean);
        const bvmDirNorm = normalizeForCompare(BVM_DIR) + '/';

        // Prefer a bun binary that is NOT under *this* BVM_DIR (fresh install),
        // but allow other bun installs (including other .bvm locations) to bootstrap.
        const binPath = candidates.find((p) => !normalizeForCompare(p).startsWith(bvmDirNorm)) || candidates[0];
        if (binPath) {
            log(`System Bun detected at: ${binPath}. Running Smoke Test...`);
            const verRes = run(binPath, ['--version']);
            const verRaw = (verRes.stdout || '').trim();
            if (verRes.status === 0 && verRaw && !verRaw.includes('BVM Error') && /^\d+\.\d+\.\d+/.test(verRaw.replace(/^v/, ''))) {
                const ver = 'v' + verRaw.replace(/^v/, '');
                const bunkerDir = path.join(BVM_DIR, 'runtime', ver);
                if (!fs.existsSync(path.join(bunkerDir, 'bin'))) {
                    fs.mkdirSync(path.join(bunkerDir, 'bin'), { recursive: true });
                    // Only copy real executables; avoid copying shims/scripts.
                    if (!isLikelyScript(binPath)) {
                        try { fs.copyFileSync(binPath, path.join(bunkerDir, 'bin', IS_WINDOWS ? 'bun.exe' : 'bun')); } catch (e) {}
                    }
                }
                const test = run(binPath, [path.join(BVM_SRC_DIR, 'index.js'), '--version'], { env: { BVM_DIR } });
                if (test.status === 0) {
                    setupBunker(bunkerDir, ver);
                    hasValidBun = true;
                }
            }
        }
    }
    if (!hasValidBun) hasValidBun = downloadAndInstall();
    createWrappers();
    const bvmEntry = path.join(BVM_BIN_DIR, IS_WINDOWS ? 'bvm.cmd' : 'bvm');
    const baseEnv = Object.assign({}, process.env, { BVM_DIR, BVM_INSTALL_RUNNING: '1' });
    run(bvmEntry, ['setup', '--silent'], { env: baseEnv });
    // Ensure user shims are updated to the latest template logic (critical for Windows isolation).
    run(bvmEntry, ['rehash', '--silent'], { env: baseEnv });
    log('🎉 BVM initialized successfully.');
    
    // Final Windows instructions
    if (IS_WINDOWS) {
        console.log('\n\x1b[36m[bvm] Next steps for Windows:\x1b[0m');
        console.log('  1. Close and reopen your terminal/PowerShell');
        console.log('  2. Run: bvm --version');
        console.log('  3. If command not found, run: bvm setup');
        console.log('  4. Add BVM to PATH manually if needed:');
        console.log(`     %USERPROFILE%\\.bvm\\shims`);
        console.log(`     %USERPROFILE%\\.bvm\\bin`);
    }
}

try { main(); } catch (e) { error(e.message); process.exit(1); }
