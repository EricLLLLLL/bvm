
import { join, resolve } from 'path';
import { mkdirSync, existsSync, rmSync, mkdtempSync } from 'fs';
import { tmpdir } from 'os';

/**
 * E2E NPM Verification Script
 * This script simulates a full 'npm install -g' lifecycle in an isolated sandbox.
 */

const LOG_PREFIX = '[E2E-NPM]';
const PKG_ROOT = process.cwd();

import { spawnSync } from 'child_process';

// --- Utils ---
function log(msg: string) { console.log(`${colors.cyan(LOG_PREFIX)} ${msg}`); }
function error(msg: string) { console.error(`${colors.red(LOG_PREFIX)} ERROR: ${msg}`); process.exit(1); }
function success(msg: string) { console.log(`${colors.green(LOG_PREFIX)} SUCCESS: ${msg}`); }

const colors = {
  cyan: (s: string) => `\x1b[36m${s}\x1b[0m`,
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
};

// --- Foundation Class ---
export class E2ESandbox {
    public readonly root: string;
    public readonly home: string;
    public readonly bvmDir: string;
    public readonly npmGlobal: string;
    
    constructor() {
        this.root = mkdtempSync(join(tmpdir(), 'bvm-e2e-npm-'));
        this.home = join(this.root, 'home');
        this.bvmDir = join(this.home, '.bvm');
        this.npmGlobal = join(this.root, 'npm-global');
        
        this.setup();
    }
    
    private setup() {
        log(`Creating sandbox at ${this.root}`);
        mkdirSync(this.home, { recursive: true });
        mkdirSync(this.npmGlobal, { recursive: true });
    }
    
    public getEnv() {
        // Isolate environment
        const env = { ...process.env };
        env.HOME = this.home;
        env.BVM_DIR = this.bvmDir;
        env.NPM_CONFIG_PREFIX = this.npmGlobal; // Force npm to use sandbox prefix
        
        // Remove BVM related env vars from host
        delete env.BVM_INSTALL_SOURCE;
        delete env.BVM_FORCE_INSTALL;
        
        return env;
    }
    
    public installLocal() {
        log('Executing: npm install -g .');
        // We use 'npm' from PATH. 
        // Note: ensure we are in PKG_ROOT
        
        const result = spawnSync('npm', ['install', '-g', '.'], {
            cwd: PKG_ROOT,
            env: this.getEnv(),
            stdio: 'inherit'
        });
        
        if (result.status !== 0) {
            throw new Error(`npm install failed with code ${result.status}`);
        }
        
        this.verifyInstall();
    }
    
    private verifyInstall() {
        log('Verifying installation structure...');
        const bvmBin = join(this.bvmDir, 'bin', 'bvm');
        const bvmSrc = join(this.bvmDir, 'src', 'index.js');
        const bvmShimSh = join(this.bvmDir, 'bin', 'bvm-shim.sh');

        if (!existsSync(bvmBin)) throw new Error('Missing shim binary: ' + bvmBin);
        if (!existsSync(bvmSrc)) throw new Error('Missing source index: ' + bvmSrc);
        if (!existsSync(bvmShimSh)) throw new Error('Missing shim script: ' + bvmShimSh);
        
        success('Installation structure verified.');
    }
    
    public cleanup() {
        log(`Cleaning up sandbox...`);
        try {
            rmSync(this.root, { recursive: true, force: true });
        } catch (e) {
            console.warn(`Failed to cleanup: ${e}`);
        }
    }
}

// --- Main Execution ---
if (import.meta.main) {
    const sandbox = new E2ESandbox();
    
    try {
        log('Foundation Check: Sandbox created successfully.');
        log(`HOME: ${sandbox.home}`);
        
        // Phase 1: Local Install
        sandbox.installLocal();
        
        success('Phase 1 (Foundation & Install) passed.');
    } catch (e: any) {
        error(e.message);
    } finally {
        sandbox.cleanup();
    }
}
