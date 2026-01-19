import { describe, it, expect, beforeEach, afterEach, mock, spyOn } from 'bun:test';
import { upgradeBvm } from '../src/commands/upgrade';
import * as os from 'os';
import { join } from 'path';
import { mkdir, writeFile, rm } from 'fs/promises';

describe('Upgrade Logic - NPM Check', () => {
    let tmpHome: string;
    
    beforeEach(async () => {
        tmpHome = join(os.tmpdir(), `bvm-test-upgrade-check-${Date.now()}`);
        await mkdir(tmpHome, { recursive: true });
        
        // Mock HOME
        process.env.HOME = tmpHome;
        process.env.BVM_DIR = join(tmpHome, '.bvm');
        process.env.BVM_TEST_MODE = 'true';
    });

    afterEach(async () => {
        await rm(tmpHome, { recursive: true, force: true });
        process.env.BVM_INSTALL_SOURCE = undefined;
    });

    it('should block upgrade if BVM_INSTALL_SOURCE is "npm"', async () => {
        // Mock environment variable set by npm/wrapper
        process.env.BVM_INSTALL_SOURCE = 'npm';
        
        let errorMsg = '';
        try {
            await upgradeBvm();
        } catch (e: any) {
             errorMsg = e.message;
        }

        expect(errorMsg).toContain('Please run "npm install -g bvm-core" to update');
    });
});
