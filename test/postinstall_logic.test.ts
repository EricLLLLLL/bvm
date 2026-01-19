import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { mkdir, writeFile, rm, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';

describe('Postinstall Logic', () => {
  let tmpBase: string;
  let homeDir: string;
  let packageDir: string;

  beforeEach(async () => {
    // Create a sandbox environment
    tmpBase = join(tmpdir(), `bvm-postinstall-test-${Date.now()}`);
    homeDir = join(tmpBase, 'home');
    packageDir = join(tmpBase, 'package');

    await mkdir(homeDir, { recursive: true });
    await mkdir(join(packageDir, 'scripts'), { recursive: true });
    await mkdir(join(packageDir, 'dist'), { recursive: true });

    // Mock Package Files
    await writeFile(join(packageDir, 'dist', 'index.js'), 'console.log("mock bvm");');
    await writeFile(join(packageDir, 'dist', 'bvm-shim.sh'), '#!/bin/sh\necho shim');
    await writeFile(join(packageDir, 'dist', 'bvm-shim.js'), 'console.log("shim js");');
    
    // Copy the actual postinstall script to the mock package
    const realPostinstallPath = join(process.cwd(), 'scripts', 'postinstall.js');
    const scriptContent = await Bun.file(realPostinstallPath).text();
    await writeFile(join(packageDir, 'scripts', 'postinstall.js'), scriptContent);
  });

  afterEach(async () => {
    await rm(tmpBase, { recursive: true, force: true });
  });

  it('should copy distribution files to BVM_HOME', async () => {
    // Execute postinstall.js
    const result = spawnSync('node', ['scripts/postinstall.js'], {
      cwd: packageDir,
      env: {
        ...process.env,
        HOME: homeDir,
        // Ensure we don't accidentally rely on real BVM vars if set
        BVM_DIR: undefined 
      },
      encoding: 'utf-8'
    });

    if (result.status !== 0) {
      console.error('Postinstall stderr:', result.stderr);
      console.log('Postinstall stdout:', result.stdout);
    }

    expect(result.status).toBe(0);

    // Verify ~/.bvm/src/index.js
    const srcIndex = join(homeDir, '.bvm', 'src', 'index.js');
    expect(await exists(srcIndex)).toBe(true);
    
    // Verify ~/.bvm/bin/bvm-shim.sh
    const shimSh = join(homeDir, '.bvm', 'bin', 'bvm-shim.sh');
    expect(await exists(shimSh)).toBe(true);

    // Verify ~/.bvm/bin/bvm-shim.js
    const shimJs = join(homeDir, '.bvm', 'bin', 'bvm-shim.js');
    expect(await exists(shimJs)).toBe(true);
  });

  it('should abort if BVM already exists in non-interactive mode', async () => {
    // Simulate existing install
    const bvmBin = join(homeDir, '.bvm', 'bin', 'bvm');
    await mkdir(join(homeDir, '.bvm', 'bin'), { recursive: true });
    await writeFile(bvmBin, '#!/bin/bash\necho "existing"');

    // Execute postinstall.js
    const result = spawnSync('node', ['scripts/postinstall.js'], {
      cwd: packageDir,
      env: {
        ...process.env,
        HOME: homeDir,
        BVM_DIR: undefined,
        CI: 'true' // Enforce non-interactive
      },
      encoding: 'utf-8'
    });

    // Should fail or warn
    expect(result.stdout + result.stderr).toContain('Conflict detected');
    // If it aborts to protect environment, it might exit 1 or 0 with message
    // Spec says "terminate installation".
  });

  it('should overwrite if BVM_FORCE_INSTALL is set', async () => {
    // Simulate existing install
    const bvmBin = join(homeDir, '.bvm', 'bin', 'bvm');
    await mkdir(join(homeDir, '.bvm', 'bin'), { recursive: true });
    await writeFile(bvmBin, 'old content');

    // Execute postinstall.js
    const result = spawnSync('node', ['scripts/postinstall.js'], {
      cwd: packageDir,
      env: {
        ...process.env,
        HOME: homeDir,
        BVM_DIR: undefined,
        CI: 'true',
        BVM_FORCE_INSTALL: 'true'
      },
      encoding: 'utf-8'
    });

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('Overwriting existing installation');
    
    // Check if files are copied (e.g. index.js)
    const srcIndex = join(homeDir, '.bvm', 'src', 'index.js');
    expect(await exists(srcIndex)).toBe(true);
  });

  it('should create bvm wrapper and trigger setup', async () => {
     // Mock bun in PATH
     const binDir = join(tmpBase, 'bin');
     await mkdir(binDir, { recursive: true });
     const mockBun = join(binDir, 'bun');
     await writeFile(mockBun, '#!/bin/sh\necho "bun runtime"');
     await chmod(mockBun, 0o755);

     const result = spawnSync('node', ['scripts/postinstall.js'], {
       cwd: packageDir,
       env: {
         ...process.env,
         HOME: homeDir,
         BVM_DIR: undefined,
         PATH: `${binDir}:${process.env.PATH}`,
         CI: 'true'
       },
       encoding: 'utf-8'
     });

     expect(result.status).toBe(0);
     
     const bvmExec = join(homeDir, '.bvm', 'bin', 'bvm');
     expect(await exists(bvmExec)).toBe(true);
     
     const content = await Bun.file(bvmExec).text();
     expect(content).toContain('exec bun');
     expect(content).toContain('BVM_DIR');
  });
});

import { chmod } from 'node:fs/promises';

async function exists(path: string) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}
