import { afterEach, describe, expect, test } from 'bun:test';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

import * as setup from '../src/commands/setup';

const testDirs: string[] = [];

async function createTestDir(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), 'bvm-windows-migration-'));
  testDirs.push(dir);
  return dir;
}

afterEach(async () => {
  await Promise.all(testDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe('Windows version directory migration', () => {
  test('preserves both directories when the runtime destination contains data', async () => {
    const root = await createTestDir();
    const versionsPath = join(root, 'versions', 'v1.2.3');
    const runtimePath = join(root, 'runtime', 'v1.2.3');
    await mkdir(versionsPath, { recursive: true });
    await mkdir(runtimePath, { recursive: true });
    await writeFile(join(versionsPath, 'legacy.txt'), 'legacy');
    await writeFile(join(runtimePath, 'runtime.txt'), 'runtime');

    const migrateVersionDirectory = (setup as typeof setup & {
      migrateVersionDirectory?: (
        versionsPath: string,
        runtimePath: string,
        createJunction: (target: string, path: string) => Promise<void>,
      ) => Promise<void>;
    }).migrateVersionDirectory;

    expect(typeof migrateVersionDirectory).toBe('function');
    await expect(migrateVersionDirectory!(versionsPath, runtimePath, async () => {}))
      .rejects.toThrow('destination is not empty');
    expect(await readFile(join(versionsPath, 'legacy.txt'), 'utf8')).toBe('legacy');
    expect(await readFile(join(runtimePath, 'runtime.txt'), 'utf8')).toBe('runtime');
  });

  test('rolls back the directory move when junction creation fails', async () => {
    const root = await createTestDir();
    const versionsPath = join(root, 'versions', 'v1.2.3');
    const runtimePath = join(root, 'runtime', 'v1.2.3');
    await mkdir(versionsPath, { recursive: true });
    await writeFile(join(versionsPath, 'legacy.txt'), 'legacy');

    const migrateVersionDirectory = (setup as typeof setup & {
      migrateVersionDirectory: (
        versionsPath: string,
        runtimePath: string,
        createJunction: (target: string, path: string) => Promise<void>,
      ) => Promise<void>;
    }).migrateVersionDirectory;

    await expect(migrateVersionDirectory(versionsPath, runtimePath, async () => {
      throw new Error('junction failed');
    })).rejects.toThrow('junction failed');
    expect(await readFile(join(versionsPath, 'legacy.txt'), 'utf8')).toBe('legacy');
  });
});
