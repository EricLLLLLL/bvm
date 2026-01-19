import { describe, it, expect, beforeEach, afterEach, mock, spyOn } from 'bun:test';
import * as os from 'os';
import { join } from 'path';
import { mkdir, rm } from 'fs/promises';

// Mock dependencies BEFORE importing the module under test
const mockRunCommand = mock(() => Promise.resolve(0));
mock.module('../src/helpers/process', () => ({
    runCommand: mockRunCommand
}));

const mockGetFastestRegistry = mock(() => Promise.resolve('https://registry.mock'));
mock.module('../src/utils/network-utils', () => ({
    getFastestRegistry: mockGetFastestRegistry,
    fetchWithTimeout: mock(() => Promise.resolve({ ok: true }))
}));

// Now import module under test
import { upgradeBvm } from '../src/commands/upgrade';

describe('Upgrade Logic - NPM Auto Upgrade', () => {
    let tmpHome: string;
    
    beforeEach(async () => {
        tmpHome = join(os.tmpdir(), `bvm-test-upgrade-auto-${Date.now()}`);
        await mkdir(tmpHome, { recursive: true });
        
        process.env.HOME = tmpHome;
        process.env.BVM_DIR = join(tmpHome, '.bvm');
        process.env.BVM_TEST_MODE = 'true';
        
        mockRunCommand.mockClear();
    });

    afterEach(async () => {
        await rm(tmpHome, { recursive: true, force: true });
        process.env.BVM_INSTALL_SOURCE = undefined;
    });

    it('should trigger npm install when BVM_INSTALL_SOURCE is "npm"', async () => {
        process.env.BVM_INSTALL_SOURCE = 'npm';
        
        await upgradeBvm();

        // Verify runCommand was called with npm install
        expect(mockRunCommand).toHaveBeenCalled();
        const callArgs = mockRunCommand.mock.calls[0][0] as string[];
        expect(callArgs[0]).toBe('npm');
        expect(callArgs[1]).toBe('install');
        expect(callArgs).toContain('bvm-core');
        expect(callArgs).toContain('https://registry.mock');
    });
});
