#!/usr/bin/env node

/**
 * BVM Post-install Script (Smart Edition)
 * Optimized for Speed: Priority given to npmmirror (China) and npmjs (Official).
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
    return spawnSync(cmd, args, Object.assign({ encoding: 'utf-8', shell: IS_WINDOWS }, opts));
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

/**
 * Prioritized registry sniffing for speed and reliability
 */
function getPackageInfo(pkgName) {
    const registries = [
        'https://registry.npmmirror.com', // High speed for China
        'https://registry.npmjs.org'      // Official reliability
    ];

    for (const registry of registries) {
        log(`Checking ${pkgName} info from ${registry}...`);
        const res = run('npm', ['info', pkgName, '--json', '--registry', registry]);
        if (res.status === 0 && res.stdout) {
            try {
                const info = JSON.parse(res.stdout);
                if (info.dist && info.dist.tarball) {
                    return { url: info.dist.tarball, version: info.version };
                }
            } catch (e) {}
        }
    }
    return null;
}

function setupRuntimeLink(verDir, ver) {
    const runtimeDir = path.join(BVM_DIR, 'runtime');
    if (!fs.existsSync(runtimeDir)) fs.mkdirSync(runtimeDir, { recursive: true });
    const currentLink = path.join(runtimeDir, 'current');
    const userCurrentLink = path.join(BVM_DIR, 'current');
    const linkType = IS_WINDOWS ? 'junction' : 'dir';

    [currentLink, userCurrentLink].forEach(link => {
        try { if (fs.existsSync(link)) fs.unlinkSync(link); } catch(e) {}
        try { fs.symlinkSync(verDir, link, linkType); } catch(e) {}
    });
    
    const aliasDir = path.join(BVM_DIR, 'aliases');
    if (!fs.existsSync(aliasDir)) fs.mkdirSync(aliasDir, { recursive: true });
    fs.writeFileSync(path.join(aliasDir, 'default'), ver);
}

function downloadAndInstall() {
    const platform = process.platform === 'win32' ? 'windows' : process.platform;
    const arch = process.arch === 'arm64' ? 'aarch64' : 'x64';
    const pkgName = `@oven/bun-${platform}-${arch}`;
    
    const info = getPackageInfo(pkgName);
    if (!info) {
        error(`Failed to locate ${pkgName} on both npmmirror and npmjs.`);
        return false;
    }

    const { url, version } = info;
    const tempTgz = path.join(os.tmpdir(), `bvm-bun-${Date.now()}.tgz`);
    log(`Downloading Bun v${version} from: ${url}`);
    
    const dl = run('curl', ['-L', '-s', '-o', tempTgz, url]);
    if (dl.status !== 0) {
        error('Download failed. Please check your internet connection.');
        return false;
    }
    
    const extractDir = path.join(os.tmpdir(), `bvm-ext-${Date.now()}`);
    fs.mkdirSync(extractDir, { recursive: true });
    const ex = run('tar', ['-xzf', tempTgz, '-C', extractDir]);
    if (ex.status !== 0) { error('Extraction failed.'); return false; }
    
    const exeName = IS_WINDOWS ? 'bun.exe' : 'bun';
    const foundBin = findBinary(extractDir, exeName);
    
    if (foundBin) {
        const verName = 'v' + version.replace(/^v/, '');
        const verDir = path.join(BVM_DIR, 'versions', verName);
        const binDir = path.join(verDir, 'bin');
        if (!fs.existsSync(binDir)) fs.mkdirSync(binDir, { recursive: true });
        fs.copyFileSync(foundBin, path.join(binDir, IS_WINDOWS ? 'bun.exe' : 'bun'));
        setupRuntimeLink(verDir, verName);
        log(`Successfully installed Bun ${verName} as BVM runtime.`);
        return true;
    }
    return false;
}

function createWrappers() {
    const bvmBin = path.join(BVM_BIN_DIR, IS_WINDOWS ? 'bvm.cmd' : 'bvm');
    const bvmDirWin = BVM_DIR.replace(/\//g, '\\');
    const entryPath = path.join(PKG_ROOT, 'bin', 'bvm-npm.js');
    
    if (IS_WINDOWS) {
        const content = `@echo off\r\nset "BVM_DIR=${bvmDirWin}"\r\nnode "${entryPath}" %*`;
        fs.writeFileSync(bvmBin, content);
        fs.writeFileSync(path.join(BVM_BIN_DIR, 'bvm'), '# BVM Windows Shim\n');
    } else {
        const content = `#!/bin/bash\nexport BVM_DIR="${BVM_DIR}"\nnode "${entryPath}" "$@"`;
        fs.writeFileSync(bvmBin, content);
        fs.chmodSync(bvmBin, 0o755);
    }
}

function main() {
    log('Starting BVM post-install setup...');
    
    [BVM_SRC_DIR, BVM_BIN_DIR].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });
    const assets = [
        { src: 'index.js', dest: path.join(BVM_SRC_DIR, 'index.js') },
        { src: 'bvm-shim.sh', dest: path.join(BVM_BIN_DIR, 'bvm-shim.sh') },
        { src: 'bvm-shim.js', dest: path.join(BVM_BIN_DIR, 'bvm-shim.js') }
    ];
    assets.forEach(a => {
        const srcPath = path.join(DIST_DIR, a.src);
        if (fs.existsSync(srcPath)) {
            fs.copyFileSync(srcPath, a.dest);
            if (!a.dest.endsWith('.js')) fs.chmodSync(a.dest, 0o755);
        }
    });

    let hasValidBun = false;
    const whichCmd = IS_WINDOWS ? 'where' : 'which';
    const checkBun = run(whichCmd, ['bun']);

    if (checkBun.status === 0 && checkBun.stdout) {
        const binPath = checkBun.stdout.trim().split('\n')[0].trim();
        log(`System Bun detected at: ${binPath}. Running Smoke Test...`);
        
        const verRes = run(binPath, ['--version']);
        const ver = 'v' + (verRes.stdout || '1.3.6').trim().replace(/^v/, '');
        const verDir = path.join(BVM_DIR, 'versions', ver);
        
        // Register anyway to preserve user's version
        if (!fs.existsSync(path.join(verDir, 'bin'))) {
            fs.mkdirSync(path.join(verDir, 'bin'), { recursive: true });
            fs.copyFileSync(binPath, path.join(verDir, 'bin', IS_WINDOWS ? 'bun.exe' : 'bun'));
        }

        const test = run(binPath, [path.join(BVM_SRC_DIR, 'index.js'), '--version'], { env: { BVM_DIR } });
        if (test.status === 0) {
            log('Smoke test passed. Reusing system Bun.');
            setupRuntimeLink(verDir, ver);
            hasValidBun = true;
        } else {
            log('Smoke test failed. System Bun is incompatible with BVM core.');
        }
    }

    if (!hasValidBun) {
        log('No compatible system Bun found. Performing smart download...');
        hasValidBun = downloadAndInstall();
    }

    createWrappers();
    const bvmBin = path.join(BVM_BIN_DIR, IS_WINDOWS ? 'bvm.cmd' : 'bvm');
    run(bvmBin, ['setup', '--silent'], { env: { BVM_DIR } });
    log('🎉 BVM initialized successfully.');
}

try {
    main();
} catch (e) {
    error(e.message);
    process.exit(1);
}