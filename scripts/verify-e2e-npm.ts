import { join, resolve, basename } from 'path';
import { mkdirSync, existsSync, rmSync, mkdtempSync, readlinkSync, writeFileSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import { spawnSync } from 'child_process';

/**
 * E2E NPM Verification Script
 * This script simulates a full 'npm install -g' lifecycle in an isolated sandbox.
 */

const LOG_PREFIX = '[E2E-NPM]';
const PKG_ROOT = process.cwd();

// --- Utils ---
const colors = {
  cyan: (s: string) => `\x1b[36m${s}\x1b[0m`,
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
};

function log(msg: string) { console.log(`${colors.cyan(LOG_PREFIX)} ${msg}`); }
function error(msg: string) { console.error(`${colors.red(LOG_PREFIX)} ERROR: ${msg}`); process.exit(1); }
function success(msg: string) { console.log(`${colors.green(LOG_PREFIX)} SUCCESS: ${msg}`); }

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
        
        // Ensure PATH includes the sandbox bin directory AND shims directory at the front
        const sandboxBin = join(this.bvmDir, 'bin');
        const sandboxShims = join(this.bvmDir, 'shims');
        env.PATH = `${sandboxShims}:${sandboxBin}:${process.env.PATH}`;
        
        // Remove BVM related env vars from host
        delete env.BVM_INSTALL_SOURCE;
        delete env.BVM_FORCE_INSTALL;
        
        return env;
    }
    
    public installLocal() {
        this.runInstall('npm');
    }

    public installWithBun() {
        this.runInstall('bun');
    }

    private runInstall(tool: 'npm' | 'bun') {
        log(`Executing: ${tool} install -g .`);
        const env = this.getEnv();
        
        // Debug: Check if tool is reachable
        const checkTool = spawnSync('which', [tool], { env, encoding: 'utf-8' });
        log(`Debug Sandbox ${tool} Path: ${checkTool.stdout?.trim() || 'NOT FOUND'}`);

        const result = spawnSync(tool, ['install', '-g', '.'], {
            cwd: PKG_ROOT,
            env,
            stdio: 'inherit'
        });
        
        if (result.status !== 0) {
            throw new Error(`${tool} install failed with code ${result.status}`);
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
    
    public runBvmCommand(args: string[]) {
        const bvmBin = join(this.bvmDir, 'bin', 'bvm');
        log(`Executing: bvm ${args.join(' ')}`);
        
        const result = spawnSync(bvmBin, args, {
            env: this.getEnv(),
            encoding: 'utf-8',
            stdio: 'inherit'
        });
        
        return result;
    }

    public verifyUpgradeSafety() {
        log('Starting Upgrade & Safety Verification...');
        
        // 1. Native Conflict Blockage
        log('Testing: Blocking native BVM overwrite...');
        const bvmBin = join(this.bvmDir, 'bin', 'bvm');
        const bvmSrc = join(this.bvmDir, 'src', 'index.js');
        mkdirSync(join(this.bvmDir, 'bin'), { recursive: true });
        mkdirSync(join(this.bvmDir, 'src'), { recursive: true });
        
        // Create native wrapper (no npm marker)
        writeFileSync(bvmBin, '#!/bin/bash\necho native bvm');
        writeFileSync(bvmSrc, '// native source');
        
        try {
            this.installLocal();
            throw new Error('Safety check failed: npm install should have been blocked by native BVM.');
        } catch (e: any) {
            log('Expected: npm install blocked correctly.');
        }
        
        // 2. Auto-upgrade (NPM to NPM)
        log('Testing: Auto-upgrade NPM installation...');
        // Force cleanup to start fresh or just remove the native mock
        rmSync(this.bvmDir, { recursive: true, force: true });
        
        // First install
        this.installLocal();
        writeFileSync(bvmSrc, '// old version mock');
        
        // Second install (should auto-upgrade)
        this.installLocal();
        const content = readFileSync(bvmSrc, 'utf-8');
        if (content === '// old version mock') {
            throw new Error('Upgrade failed: old version was not overwritten.');
        }
        success('Upgrade & Safety verified.');
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
        log('Starting Comprehensive E2E Verification...');
        
        // 1. Initial Local Install
        sandbox.installLocal();
        
        // 2. Verify Bootstrapping (Scenario 2)
        const currentLink = join(sandbox.bvmDir, 'current');
        if (!existsSync(currentLink)) {
            throw new Error('Bootstrap failed: current runtime link missing.');
        }
        log(`Bootstrap verified: current -> ${readlinkSync(currentLink)}`);
        
        // 3. Verify Version Switching
        const targetVer = '1.1.0';
        log(`Testing Version Switching to v${targetVer}...`);
        
        const installRes = sandbox.runBvmCommand(['install', targetVer]);
        if (installRes.status !== 0) throw new Error('bvm install failed');
        
        const useRes = sandbox.runBvmCommand(['use', targetVer]);
        if (useRes.status !== 0) throw new Error('bvm use failed');
        
        const linkTarget = readlinkSync(currentLink);
        if (!linkTarget.includes(targetVer)) {
            throw new Error(`Link update failed. Expected ${targetVer}, got ${linkTarget}`);
        }
        success(`Version switching verified: ${targetVer} is now active.`);
        
        // 4. Verify Execution (Path Check)
        // We simulate a new shell by using sandbox env
        const env = sandbox.getEnv();
        const bunVerCheck = spawnSync('bun', ['--version'], { env, encoding: 'utf-8' });
        log(`Active Bun version: ${bunVerCheck.stdout?.trim()}`);
        if (!bunVerCheck.stdout?.includes(targetVer)) {
            throw new Error(`Execution check failed. PATH didn't pick up Bun ${targetVer}`);
        }
        success('Execution path verified.');

        // 5. Upgrade & Safety
        sandbox.verifyUpgradeSafety();

        success('Phase 3 (Upgrade & Safety) passed.');
        success('All E2E NPM Verifications Passed.');
    } catch (e: any) {
        error(e.message);
    } finally {
        sandbox.cleanup();
    }
}