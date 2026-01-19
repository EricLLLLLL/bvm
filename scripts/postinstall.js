#!/usr/bin/env node

/**
 * BVM Post-install Script
 * This script handles persistence and environment setup after npm install -g.
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

function log(msg) {
    console.log(`[bvm] ${msg}`);
}

function error(msg) {
    console.error(`[bvm] ERROR: ${msg}`);
}

async function main() {
    log('Running post-install setup...');

    const isTTY = process.stdin.isTTY || process.stdout.isTTY;
    const isCI = process.env.CI === 'true';
    const isBun = process.env.npm_config_user_agent && process.env.npm_config_user_agent.includes('bun/');

    log(`Environment: TTY=${!!isTTY}, CI=${isCI}`);
    if (isBun) {
        log('Detected Bun installation. Optimizing setup...');
    }

    // --- Configuration ---
    const HOME = process.env.HOME || require('os').homedir();
    const BVM_DIR = process.env.BVM_DIR || path.join(HOME, '.bvm');
    const BVM_SRC_DIR = path.join(BVM_DIR, 'src');
    const BVM_BIN_DIR = path.join(BVM_DIR, 'bin');
    
    const PKG_ROOT = path.resolve(__dirname, '..');
    const DIST_DIR = path.join(PKG_ROOT, 'dist');
    const BVM_EXEC = path.join(BVM_BIN_DIR, 'bvm');

    // --- 1. Conflict Detection ---
    if (fs.existsSync(BVM_EXEC)) {
        if (!process.env.BVM_FORCE_INSTALL) {
            if (!isTTY) {
                error(`Conflict detected: ${BVM_EXEC} already exists.`);
                error('Run with BVM_FORCE_INSTALL=true to overwrite, or install interactively.');
                process.exit(1);
            }

            // Interactive TTY Check
            const readline = require('readline');
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });

            const answer = await new Promise(resolve => {
                rl.question('[bvm] Detected existing BVM installation. Overwrite? (y/N) ', resolve);
            });
            rl.close();

            if (!answer || !answer.trim().toLowerCase().startsWith('y')) {
                log('Installation cancelled by user.');
                process.exit(0);
            }
        } else {
            log('BVM_FORCE_INSTALL set. Overwriting existing installation.');
        }
    }

    // --- 2. Prepare Directories ---
    log(`Deploying to ${BVM_DIR}...`);
    fs.mkdirSync(BVM_SRC_DIR, { recursive: true });
    fs.mkdirSync(BVM_BIN_DIR, { recursive: true });

    // --- 2. Copy Files ---
    const filesToCopy = [
        { src: 'index.js', destDir: BVM_SRC_DIR, name: 'index.js' },
        { src: 'bvm-shim.sh', destDir: BVM_BIN_DIR, name: 'bvm-shim.sh', mode: 0o755 },
        { src: 'bvm-shim.js', destDir: BVM_BIN_DIR, name: 'bvm-shim.js' }
    ];

    for (const file of filesToCopy) {
        const srcPath = path.join(DIST_DIR, file.src);
        const destPath = path.join(file.destDir, file.name);

        if (fs.existsSync(srcPath)) {
            log(`Copying ${file.src} -> ${destPath}`);
            fs.copyFileSync(srcPath, destPath);
            if (file.mode) {
                fs.chmodSync(destPath, file.mode);
            }
        } else {
            error(`Source file not found: ${srcPath}`);
            // In dev/test, files might not exist if not built. Warn but don't fail hard?
            // Actually, for postinstall, we expect them.
        }
    }
    
    // --- 4. Runtime Bootstrapping (Scenario 2) ---
    const currentRuntime = path.join(BVM_DIR, 'runtime', 'current');
    
    if (isBun) {
        log('Fixing environment runtime...');
        try {
            // A. Migrate Host Bun (Preserve user's version)
            const sysBun = process.execPath;
            const hostVer = process.version.replace(/^v/, ''); 
            const hostVerDir = path.join(BVM_DIR, 'versions', hostVer);
            const hostVerBinDir = path.join(hostVerDir, 'bin');
            
            if (!fs.existsSync(hostVerBinDir)) {
                fs.mkdirSync(hostVerBinDir, { recursive: true });
                fs.copyFileSync(sysBun, path.join(hostVerBinDir, 'bun'));
                fs.chmodSync(path.join(hostVerBinDir, 'bun'), 0o755);
                log(`Migrated host Bun (v${hostVer}) to ${hostVerDir}`);
            }

            // B. Try to Setup Latest (Goal: Use new version)
            let setupSuccess = false;
            let usedVersion = hostVer;

            log('Attempting to install latest Bun version for BVM...');
            // We use the host bun to run our newly copied CLI to install latest
            const installCmd = spawnSync(sysBun, [path.join(BVM_SRC_DIR, 'index.js'), 'install', 'latest'], {
                env: { ...process.env, BVM_DIR },
                stdio: 'inherit'
            });

            if (installCmd.status === 0) {
                const useCmd = spawnSync(sysBun, [path.join(BVM_SRC_DIR, 'index.js'), 'use', 'latest', '--silent'], {
                    env: { ...process.env, BVM_DIR }
                });
                
                if (useCmd.status === 0) {
                    setupSuccess = true;
                    try {
                        const target = fs.readlinkSync(currentRuntime);
                        usedVersion = path.basename(target);
                    } catch(e) {}
                }
            }

            if (setupSuccess) {
                log(`Setup complete. Using Bun v${usedVersion} as default.`);
                if (usedVersion !== hostVer) {
                     log(`Your previous version (v${hostVer}) has been saved. Run "bvm use ${hostVer}" to restore it.`);
                }
            } else {
                log('Warning: Failed to auto-install latest Bun. Falling back to host version.');
                const runtimeDir = path.join(BVM_DIR, 'runtime');
                fs.mkdirSync(runtimeDir, { recursive: true });
                try { fs.unlinkSync(currentRuntime); } catch(e) {}
                fs.symlinkSync(hostVerDir, currentRuntime, 'dir');
                log(`Using Bun v${hostVer} as default.`);
            }

        } catch (e) {
            log(`Warning: Runtime fixup failed: ${e.message}`);
        }
    }

    // --- 5. Create Wrapper ---
    fs.writeFileSync(BVM_EXEC, wrapperContent);
    try { fs.chmodSync(BVM_EXEC, 0o755); } catch (e) {}

    // --- 4. Trigger Setup ---
    log('Configuring environment...');
    // We attempt to run 'bvm setup' using the wrapper we just created.
    // This relies on 'bun' being available in the environment (which it should be for npm install).
    const setupResult = spawnSync(BVM_EXEC, ['setup', '--silent'], {
        stdio: 'inherit',
        env: { ...process.env, BVM_DIR }
    });

    if (setupResult.status !== 0) {
        // Warning only, don't fail install if setup fails (e.g. read-only fs)
        log('Warning: "bvm setup" failed. You may need to run "bvm setup" manually.');
    } else {
        log('BVM installed successfully.');
    }
}

main().catch(err => {
    error(err.message);
    process.exit(1);
});
