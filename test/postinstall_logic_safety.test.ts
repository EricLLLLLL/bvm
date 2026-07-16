import { afterEach, describe, expect, test } from 'bun:test';
import { mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

const postinstall = require('../scripts/postinstall.js') as {
  isUsablePrivateRuntime?: (bvmDir: string, version: string) => boolean;
};

const testDirs: string[] = [];

afterEach(async () => {
  await Promise.all(testDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe('postinstall private runtime validation', () => {
  test('rejects a runtime without a physical Bun executable', async () => {
    const root = await mkdtemp(join(tmpdir(), 'bvm-postinstall-runtime-'));
    testDirs.push(root);

    expect(typeof postinstall.isUsablePrivateRuntime).toBe('function');
    expect(postinstall.isUsablePrivateRuntime!(root, 'v1.2.3')).toBe(false);
  });
});
