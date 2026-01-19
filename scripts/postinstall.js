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
    
    // Improved Bun detection
    const isBun = (process.env.npm_config_user_agent && process.env.npm_config_user_agent.includes('bun/')) || 
                  (process.versions && process.versions.bun) ||
                  process.isBun;

    log(`Environment: TTY=${!!isTTY}, CI=${isCI}, isBun=${!!isBun}`);
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
    let forceInstall = process.env.BVM_FORCE_INSTALL === 'true';

    if (fs.existsSync(BVM_EXEC)) {
        // Check if existing installation is from npm
        let isNpmInstall = false;
        try {
            const content = fs.readFileSync(BVM_EXEC, 'utf-8');
            if (content.includes('export BVM_INSTALL_SOURCE="npm"')) {
                isNpmInstall = true;
            }
        } catch (e) {}

        if (isNpmInstall) {
            log('Detected existing npm installation. Proceeding with update...');
            forceInstall = true;
        } else if (!forceInstall) {
            error(`Conflict detected: ${BVM_EXEC} already exists (Native installation).`);
            error('Please run "bvm upgrade" to update your native BVM installation.');
            error('To force overwrite, run with BVM_FORCE_INSTALL=true');
            process.exit(1);
        } else {
            log('BVM_FORCE_INSTALL set. Overwriting existing installation.');
        }
    }

    // --- 2. Prepare Directories ---
    log(`Deploying to ${BVM_DIR}...`);
    fs.mkdirSync(BVM_SRC_DIR, { recursive: true });
    fs.mkdirSync(BVM_BIN_DIR, { recursive: true });

    // --- 3. Copy Files ---
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
        }
    }
    
    // --- 4. Runtime Bootstrapping (Scenario 2) ---
    const currentRuntime = path.join(BVM_DIR, 'current');
    
    const wrapperContent = `#!/bin/bash
export BVM_DIR="${BVM_DIR}"
export BVM_INSTALL_SOURCE="npm"
# 1. Try internal runtime
if [ -x "\${BVM_DIR}/current/bin/bun" ]; then
  exec "\${BVM_DIR}/current/bin/bun" "\${BVM_DIR}/src/index.js" "$@"
# 2. Try global/system bun
elif command -v bun >/dev/null 2>&1; then
  exec bun "\${BVM_DIR}/src/index.js" "$@"
else
  echo "Error: BVM requires Bun. Please install Bun or ensure it is in your PATH."
  exit 1
fi
`;

    if (!fs.existsSync(currentRuntime)) {
        log('Current runtime missing. Attempting to bootstrap...');
        try {
            // A. Find a Bun binary to use for bootstrapping
            let sysBun = null;
            let hostVer = null;
            
            // Check if current process is Bun
            if (process.versions && process.versions.bun) {
                sysBun = process.execPath;
                hostVer = process.versions.bun;
            } else {
                // Try PATH
                const whichBun = spawnSync('which', ['bun'], { encoding: 'utf-8' });
                if (whichBun.status === 0 && whichBun.stdout) {
                    sysBun = whichBun.stdout.trim();
                    const verOut = spawnSync(sysBun, ['--version'], { encoding: 'utf-8' });
                    if (verOut.status === 0) {
                        hostVer = verOut.stdout.trim().replace(/^v/, '');
                    }
                }
            }

            if (sysBun && fs.existsSync(sysBun)) {
                log(`Bootstrapping using system Bun v${hostVer}...`);
                const hostVerDir = path.join(BVM_DIR, 'versions', hostVer);
                const hostVerBinDir = path.join(hostVerDir, 'bin');
                
                if (!fs.existsSync(hostVerBinDir)) {
                    fs.mkdirSync(hostVerBinDir, { recursive: true });
                    fs.copyFileSync(sysBun, path.join(hostVerBinDir, 'bun'));
                    fs.chmodSync(path.join(hostVerBinDir, 'bun'), 0o755);
                }

                // Always set as fallback first
                try { fs.unlinkSync(currentRuntime); } catch(e) {}
                fs.symlinkSync(hostVerDir, currentRuntime, 'dir');

                // B. Try to Setup Latest (Upgrading to newest)
                log('Attempting to install latest Bun version for BVM...');
                const installCmd = spawnSync(sysBun, [path.join(BVM_SRC_DIR, 'index.js'), 'install', 'latest'], {
                    env: Object.assign({}, process.env, { BVM_DIR }),
                    stdio: 'inherit'
                });

                if (installCmd.status === 0) {
                    const useCmd = spawnSync(sysBun, [path.join(BVM_SRC_DIR, 'index.js'), 'use', 'latest', '--silent'], {
                        env: Object.assign({}, process.env, { BVM_DIR })
                    });
                    
                    if (useCmd.status === 0) {
                        const target = fs.readlinkSync(currentRuntime);
                        const usedVersion = path.basename(target);
                        log(`Setup complete. Using Bun v${usedVersion} as default.`);
                    }
                } else {
                    log(`Warning: Failed to install latest. Stayed with Bun v${hostVer}.`);
                }
            } else {
                log('Warning: Skipping bootstrap - No system Bun found.');
            }
        } catch (e) {
            log(`Warning: Bootstrap failed: \${e.message}`);
        }
    }

    // --- 5. Create Wrapper ---
    fs.writeFileSync(BVM_EXEC, wrapperContent);
    try { fs.chmodSync(BVM_EXEC, 0o755); } catch (e) {}

    // --- 6. Trigger Setup ---
    log('Configuring environment...');
    const setupResult = spawnSync(BVM_EXEC, ['setup', '--silent'], {
        stdio: 'inherit',
        env: Object.assign({}, process.env, { BVM_DIR })
    });

    if (setupResult.status !== 0) {
        log('Warning: "bvm setup" failed.');
    } else {
        log('BVM installed successfully.');
    }
}

main().catch(err => {
    error(err.message);
    process.exit(1);
});