
import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { join } from 'path';
import { existsSync, readlinkSync } from 'fs';
import { E2ESandbox } from '../../scripts/verify-e2e-npm';

describe('E2E NPM Verification - Runtime Bootstrap', () => {
  let sandbox: E2ESandbox;

  beforeEach(() => {
    sandbox = new E2ESandbox();
  });

  afterEach(() => {
    sandbox.cleanup();
  });

  it('should have a current runtime link after install', () => {
    sandbox.installLocal();
    const currentLink = join(sandbox.bvmDir, 'current');
    expect(existsSync(currentLink)).toBe(true);
    
    // Check if it points to a valid version directory
    const target = readlinkSync(currentLink);
    expect(target).toContain('versions');
  });
});
