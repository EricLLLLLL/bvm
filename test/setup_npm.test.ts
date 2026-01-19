import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { join } from 'path';
import { mkdir, rm, writeFile, chmod } from 'fs/promises';
import { tmpdir } from 'os';
import { spawnSync } from 'child_process';

describe('Setup Logic - NPM Installation Preservation (Integration)', () => {
    let tmpHome: string;
    let bvmBinDir: string;
    
    beforeEach(async () => {
        tmpHome = join(tmpdir(), `bvm-test-setup-npm-${Date.now()}`);
        bvmBinDir = join(tmpHome, '.bvm', 'bin');
        await mkdir(bvmBinDir, { recursive: true });
    });

    afterEach(async () => {
        await rm(tmpHome, { recursive: true, force: true });
    });

    it('should preserve npm wrapper during setup', async () => {
        // Run bvm setup via CLI using BVM_INSTALL_SOURCE env
        const result = spawnSync('bun', ['run', 'src/index.ts', 'setup', '--silent'], {
            env: {
                ...process.env,
                HOME: tmpHome,
                BVM_DIR: join(tmpHome, '.bvm'),
                BVM_INSTALL_SOURCE: 'npm',
                BVM_TEST_MODE: 'false' // We need real logic, not test mode mocks
            },
            encoding: 'utf-8'
        });

        if (result.status !== 0) {
            console.error(result.stderr);
        }
        expect(result.status).toBe(0);
        
        const bvmWrapperPath = join(bvmBinDir, 'bvm');
        const content = await (await Bun.file(bvmWrapperPath)).text();
        
        // Should contain the npm-aware logic
        expect(content).toContain('export BVM_INSTALL_SOURCE="npm"');
        expect(content).toContain('command -v bun'); 
    });
});
