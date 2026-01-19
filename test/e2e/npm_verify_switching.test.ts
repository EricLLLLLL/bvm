
import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { join } from 'path';
import { existsSync, readlinkSync } from 'fs';
import { E2ESandbox } from '../../scripts/verify-e2e-npm';

describe('E2E NPM Verification - Switching', () => {
  let sandbox: E2ESandbox;

  beforeEach(() => {
    sandbox = new E2ESandbox();
    sandbox.installLocal();
  }, 30000); // Higher timeout for npm install

  afterEach(() => {
    sandbox.cleanup();
  });

  it('should be able to install and use a specific version', () => {
    const targetVer = '1.1.0';
    
    // Install
    const installRes = sandbox.runBvmCommand(['install', targetVer]);
    expect(installRes.status).toBe(0);
    
    // Use
    const useRes = sandbox.runBvmCommand(['use', targetVer]);
    expect(useRes.status).toBe(0);
    
    // Verify Link
    const currentLink = join(sandbox.bvmDir, 'current');
    const target = readlinkSync(currentLink);
    
    console.log(`Current Link Target: ${target}`);
    expect(target).toContain(targetVer);
  }, 60000); // Higher timeout for downloading Bun
});
