
import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { join } from 'path';
import { existsSync, writeFileSync, readFileSync } from 'fs';
import { E2ESandbox } from '../../scripts/verify-e2e-npm';

describe('E2E NPM Verification - Upgrade & Safety', () => {
  let sandbox: E2ESandbox;

  beforeEach(() => {
    sandbox = new E2ESandbox();
  });

  afterEach(() => {
    sandbox.cleanup();
  });

  it('should auto-upgrade when BVM_INSTALL_SOURCE is npm', () => {
    // 1. Initial install
    sandbox.installLocal();
    
    // 2. Mock an old version by tempering with the core file
    const bvmSrc = join(sandbox.bvmDir, 'src', 'index.js');
    writeFileSync(bvmSrc, '// old version mock');
    
    // 3. Re-install
    sandbox.installLocal();
    
    // 4. Verify file was overwritten by new content
    const content = readFileSync(bvmSrc, 'utf-8');
    expect(content).not.toBe('// old version mock');
    expect(content).toContain('import');
  }, 60000);

  it('should block install when native BVM is present', () => {
    // 1. Manually create a "native" BVM (no npm marker)
    const bvmBinDir = join(sandbox.bvmDir, 'bin');
    const bvmSrcDir = join(sandbox.bvmDir, 'src');
    const bvmBin = join(bvmBinDir, 'bvm');
    
    require('fs').mkdirSync(bvmBinDir, { recursive: true });
    require('fs').mkdirSync(bvmSrcDir, { recursive: true });
    
    // Wrapper WITHOUT BVM_INSTALL_SOURCE="npm"
    writeFileSync(bvmBin, '#!/bin/bash\necho native bvm');
    
    // 2. Try to install via NPM
    try {
        sandbox.installLocal();
        expect.unreachable('Should have thrown an error due to conflict');
    } catch (e: any) {
        expect(e.message).toContain('Conflict detected');
        expect(e.message).toContain('Native installation');
    }
  }, 60000);
});
