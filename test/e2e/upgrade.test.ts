import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { join } from 'path';
import { tmpdir } from 'os';
import { mkdir, rm, writeFile, chmod } from 'fs/promises';
import { spawn } from 'bun';

describe('BVM Upgrade E2E', () => {
  const testDir = join(tmpdir(), `bvm-upgrade-e2e-${Date.now()}`);
  const sandboxHome = join(testDir, 'home');
  const bvmDir = join(sandboxHome, '.bvm');
  const serverPort = 9999;
  const mockCdnUrl = `http://localhost:${serverPort}/gh/EricLLLLLL/bvm`;

  let server: any;

  beforeAll(async () => {
    await mkdir(sandboxHome, { recursive: true });
    
    server = Bun.serve({
      port: serverPort,
      async fetch(req) {
        const url = new URL(req.url);
        if (url.pathname.includes('/package.json')) {
          return Response.json({
            version: '9.9.9',
            bvm_fingerprints: {
              cli: 'cli-new-md5',
              shim_win: 'shim-win-md5',
              shim_unix: 'shim-unix-md5'
            }
          });
        }
        if (url.pathname.includes('/dist/')) {
          const content = `// Mock content for ${url.pathname}\nconsole.log("Upgraded!");`;
          return new Response(content, {
              headers: { 'Content-Length': content.length.toString() }
          });
        }
        return new Response('Not Found', { status: 404 });
      },
    });
  });

  afterAll(async () => {
    server.stop();
    await rm(testDir, { recursive: true, force: true });
  });

  const runBvmAsync = async (args: string[]) => {
    const proc = spawn({
      cmd: ['bun', 'run', join(process.cwd(), 'src/index.ts'), ...args],
      env: {
        ...process.env,
        HOME: sandboxHome,
        USERPROFILE: sandboxHome,
        BVM_DIR: bvmDir,
        BVM_CDN_URL: mockCdnUrl,
        BVM_TEST_MODE: 'true',
        BVM_TEST_LATEST_VERSION: 'v9.9.9',
        BVM_TEST_REAL_UPGRADE: 'true',
        NO_COLOR: '1'
      },
      stdout: 'pipe',
      stderr: 'pipe'
    });

    const stdout = await new Response(proc.stdout).text();
    const stderr = await new Response(proc.stderr).text();
    const exitCode = await proc.exited;

    return { exitCode, stdout, stderr };
  };

  it('should perform a full smart upgrade', async () => {
    await mkdir(join(bvmDir, 'src'), { recursive: true });
    await writeFile(join(bvmDir, 'src', 'index.js'), '// old code');

    const { exitCode, stdout } = await runBvmAsync(['upgrade']);
    expect(exitCode).toBe(0);
    expect(stdout).toContain('BVM updated to v9.9.9 successfully');

    const newCode = await Bun.file(join(bvmDir, 'src', 'index.js')).text();
    expect(newCode).toContain('Upgraded!');

    const fingerprints = await Bun.file(join(bvmDir, 'fingerprints.json')).json();
    expect(fingerprints.cli).toBe('cli-new-md5');
  });

  it('should skip download if fingerprints match', async () => {
      const { exitCode, stdout } = await runBvmAsync(['upgrade']);
      expect(exitCode).toBe(0);
      expect(stdout).toContain('already at the latest fingerprints');
  });
});
