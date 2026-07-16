import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { join } from 'path';
import { tmpdir } from 'os';
import { mkdir, rm, writeFile } from 'fs/promises';
import { spawn } from 'bun';

const describeOnWindows = process.platform === 'win32' ? describe : describe.skip;

describeOnWindows('BVM E2E: install.ps1 (via pwsh)', () => {
  const testDir = join(tmpdir(), `bvm-install-ps1-e2e-${Date.now()}`);
  const sandboxBvmDir = join(testDir, '.bvm');

  beforeAll(async () => {
    await mkdir(testDir, { recursive: true });
  });

  afterAll(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  it('should install to a custom BVM_DIR and generate correct optimized artifacts', async () => {
    const proc = spawn({
      cmd: [
        'pwsh', 
        '-NoProfile', 
        '-Command', 
        `\$env:BVM_DIR='${sandboxBvmDir}'; ./install.ps1`
      ],
      stdout: 'pipe',
      stderr: 'pipe'
    });

    const stdout = await new Response(proc.stdout).text();
    const stderr = await new Response(proc.stderr).text();
    const exitCode = await proc.exited;

    expect(exitCode).toBe(0);
    expect(stdout).toContain('BVM installed successfully');
    
    // 1. Verify bun.cmd always delegates through the isolation shim.
    const bunCmdContent = await Bun.file(join(sandboxBvmDir, 'shims', 'bun.cmd')).text();
    expect(bunCmdContent).toContain('runtime\\current\\bin\\bun.exe');
    expect(bunCmdContent).toContain('bvm-shim.js');
    
    // 2. Verify bvm.cmd (The CLI Wrapper)
    const bvmWrapperContent = await Bun.file(join(sandboxBvmDir, 'bin', 'bvm.cmd')).text();
    // Must call the CLI Core
    expect(bvmWrapperContent).toContain('index.js');
    
    // 3. Verify files were actually placed in sandbox
    expect(await Bun.file(join(sandboxBvmDir, 'src', 'index.js')).exists()).toBe(true);
    expect(await Bun.file(join(sandboxBvmDir, 'bin', 'bvm-shim.js')).exists()).toBe(true);
  }, { timeout: 60000 });
});
