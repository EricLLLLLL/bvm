import { afterEach, describe, expect, test } from 'bun:test';
import { mkdtemp, mkdir, realpath, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

const postinstall = require('../scripts/postinstall.js') as {
  detectAvx2Support?: (
    platform: string,
    arch: string,
    run: (command: string, args: string[]) => { status: number; stdout: string },
  ) => boolean;
  requireSuccessfulCommand: (
    result: { status: number | null; stderr?: string | Buffer } | null,
    label: string,
  ) => void;
  replaceDirectoryLink?: (target: string, link: string) => void;
};
const { requireSuccessfulCommand } = postinstall;

const testDirs: string[] = [];

afterEach(async () => {
  await Promise.all(testDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe('postinstall command validation', () => {
  test('accepts a successful child process result', () => {
    expect(() => requireSuccessfulCommand({ status: 0 }, 'bvm setup')).not.toThrow();
  });

  test('reports the failed step and stderr', () => {
    expect(() => requireSuccessfulCommand({ status: 1, stderr: 'permission denied' }, 'bvm setup'))
      .toThrow('bvm setup failed: permission denied');
  });

  test('replaces an existing directory link and exposes failures', async () => {
    const root = await mkdtemp(join(tmpdir(), 'bvm-postinstall-link-'));
    testDirs.push(root);
    const target = join(root, 'target');
    const link = join(root, 'current');
    await mkdir(target);
    await mkdir(link);

    expect(typeof postinstall.replaceDirectoryLink).toBe('function');
    postinstall.replaceDirectoryLink!(target, link);
    expect(await realpath(link)).toBe(await realpath(target));
  });

  test('detects missing AVX2 on Windows through the processor feature probe', () => {
    const run = () => ({ status: 0, stdout: 'False\r\n' });

    expect(typeof postinstall.detectAvx2Support).toBe('function');
    expect(postinstall.detectAvx2Support!('win32', 'x64', run)).toBe(false);
  });
});
