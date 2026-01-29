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
function getPackageInfo(pkgName, version = 'latest') {
    const registries = [
        'https://registry.npmmirror.com', // High speed for China
        'https://registry.npmjs.org'      // Official reliability
    ];

    const target = version === 'latest' ? pkgName : `${pkgName}@${version}`;

    for (const registry of registries) {
        log(`Checking ${target} info from ${registry}...`);
        const res = run('npm', ['info', target, '--json', '--registry', registry]);
        if (res.status === 0 && res.stdout) {
            try {
                const info = JSON.parse(res.stdout);
                const data = Array.isArray(info) ? info[0] : info;
                if (data.dist && data.dist.tarball) {
                    return { url: data.dist.tarball.trim(), version: data.version };
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

function getNativeArch() {
    const arch = process.arch;
    if (process.platform === 'darwin' && arch === 'x64') {
        try {
            const check = spawnSync('sysctl', ['-n', 'sysctl.proc_translated'], { encoding: 'utf-8' });
            if (check.stdout.trim() === '1') {
                return 'arm64';
            }
        } catch (e) {}
    }
    return arch;
}

function hasAvx2() {
    if (process.platform === 'win32') return true;
    try {
        if (process.platform === 'darwin') {
            return spawnSync('sysctl', ['-a'], { encoding: 'utf-8' }).stdout.includes('AVX2');
        } else if (process.platform === 'linux') {
            return fs.readFileSync('/proc/cpuinfo', 'utf-8').includes('avx2');
        }
    } catch (e) {}
    return true;
}

/**
 * Detect the fastest registry by racing HEAD requests
 */
function getFastestRegistry() {
    const registries = [
        { name: 'npmmirror', url: 'https://registry.npmmirror.com' },
        { name: 'npmjs', url: 'https://registry.npmjs.org' }
    ];
    
    log('Racing registries for speed...');
    
    // Simple speed check using curl to time out quickly
    const results = registries.map(reg => {
        const start = Date.now();
        // Use a 2s timeout for racing
        const res = run('curl', ['-I', '-s', '--connect-timeout', '2', reg.url]);
        return { 
            ...reg, 
            time: res.status === 0 ? (Date.now() - start) : 9999 
        };
    });

    results.sort((a, b) => a.time - b.time);
    log(`Winner: ${results[0].name} (${results[0].time}ms)`);
    return results;
}

function downloadAndInstall() {
    const platform = process.platform === 'win32' ? 'windows' : process.platform;
    const nativeArch = getNativeArch();
    const arch = nativeArch === 'arm64' ? 'aarch64' : 'x64';
    const isBaseline = (arch === 'x64' && !hasAvx2());
    const pkgName = `@oven/bun-${platform}-${arch}${isBaseline ? '-baseline' : ''}`;
    
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
                log(`URL: ${url}`);

                const dl = run('curl', [
                    '-L', '--fail', 
                    '--connect-timeout', '15', 
                    '--retry', '1',
                    '-o', tempTgz, url
                ], { stdio: 'inherit' });
                
                if (dl.status === 0) {
                    log('Extracting runtime... ');
                    const extractDir = path.join(os.tmpdir(), `bvm-ext-${Date.now()}`);
                    if (!fs.existsSync(extractDir)) fs.mkdirSync(extractDir, { recursive: true });
                    const ex = run('tar', ['-xzf', tempTgz, '-C', extractDir]);
                    
                    if (ex.status === 0) {
                        const exeName = IS_WINDOWS ? 'bun.exe' : 'bun';
                        const foundBin = findBinary(extractDir, exeName);
                        if (foundBin) {
                            const verName = 'v' + version.replace(/^v/, '');
                            const verDir = path.join(BVM_DIR, 'versions', verName);
                            const binDir = path.join(verDir, 'bin');
                            if (!fs.existsSync(binDir)) fs.mkdirSync(binDir, { recursive: true });
                            fs.copyFileSync(foundBin, path.join(binDir, IS_WINDOWS ? 'bun.exe' : 'bun'));
                            setupRuntimeLink(verDir, verName);
                            log(`🎉 Successfully installed Bun ${verName} via ${reg.name}.`);
                            try { fs.unlinkSync(tempTgz); } catch(e) {}
                            return true;
                        }
                    }
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
    log(`Platform: ${process.platform}, Arch: ${process.arch}`);
    
    // Check if dist/index.js exists
    if (!fs.existsSync(path.join(DIST_DIR, 'index.js'))) {
        log('Development environment detected: dist/index.js missing.');
        return;
    }
    
    log('Preparing BVM directories and assets...');
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
    log(`Checking for existing Bun via "${whichCmd} bun"...`);
    const checkBun = run(whichCmd, ['bun']);

    if (checkBun.status === 0 && checkBun.stdout) {
        const binPath = checkBun.stdout.trim().split('\n')[0].trim();
        log(`System Bun detected at: ${binPath}. Running Smoke Test...`);
        
        const verRes = run(binPath, ['--version']);
        const verRaw = (verRes.stdout || '').trim();
        log(`System Bun version check output: "${verRaw}"`);
        const ver = 'v' + (verRaw || '1.3.6').replace(/^v/, '');
        const verDir = path.join(BVM_DIR, 'versions', ver);
        
        const sysArchRes = run(binPath, ['-e', 'console.log(process.arch)']);
        const sysArch = (sysArchRes.stdout || '').trim();
        const nativeArch = getNativeArch();
        log(`System Bun arch: ${sysArch}, Native arch: ${nativeArch}`);

        if (sysArch !== nativeArch && sysArch !== '' && nativeArch !== '') {
            log(`Architecture mismatch. Skipping reuse.`);
        } else {
            const binDir = path.join(verDir, 'bin');
            if (!fs.existsSync(binDir)) {
                fs.mkdirSync(binDir, { recursive: true });
                const destBin = path.join(binDir, IS_WINDOWS ? 'bun.exe' : 'bun');
                try {
                    if (path.resolve(binPath) !== path.resolve(destBin)) {
                        fs.copyFileSync(binPath, destBin);
                        log(`Linked system Bun to ${destBin}`);
                    }
                } catch (e) {
                    error(`Failed to copy system Bun: ${e.message}`);
                }
            }

            log('Running internal smoke test...');
            const test = run(binPath, [path.join(BVM_SRC_DIR, 'index.js'), '--version'], { env: { BVM_DIR } });
            if (test.status === 0) {
                log('Smoke test passed. Reusing system Bun.');
                setupRuntimeLink(verDir, ver);
                hasValidBun = true;
            } else {
                log(`Smoke test failed (Exit ${test.status}). System Bun is incompatible.`);
            }
        }
    }

    if (!hasValidBun) {
        log('No compatible system Bun found. Performing smart download...');
        hasValidBun = downloadAndInstall();
    }

    log('Creating BVM wrappers...');
    createWrappers();
    const bvmBin = path.join(BVM_BIN_DIR, IS_WINDOWS ? 'bvm.cmd' : 'bvm');
    
    log('Running final "bvm setup"...');
    const setupResult = run(bvmBin, ['setup', '--silent'], { 
        env: Object.assign({}, process.env, { BVM_DIR, BVM_INSTALL_RUNNING: '1' }) 
    });
    
    if (setupResult.status !== 0) {
        error(`bvm setup failed with exit code ${setupResult.status}`);
        if (setupResult.stderr) console.error(setupResult.stderr);
        process.exit(1);
    }
    log('🎉 BVM initialized successfully.');
}

try {
    main();
} catch (e) {
    error(e.message);
    process.exit(1);
}