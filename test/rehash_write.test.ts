import { afterEach, describe, expect, test } from 'bun:test';
import { mkdtemp, readFile, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

import * as rehashModule from '../src/commands/rehash';

const testDirs: string[] = [];

afterEach(async () => {
  await Promise.all(testDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe('rehash proxy writes', () => {
  test('skips writing a proxy whose content is already current', async () => {
    const root = await mkdtemp(join(tmpdir(), 'bvm-rehash-write-'));
    testDirs.push(root);
    const proxyPath = join(root, 'bun');
    await writeFile(proxyPath, 'same');
    const writeTextIfChanged = (rehashModule as typeof rehashModule & {
      writeTextIfChanged?: (path: string, content: string) => Promise<boolean>;
    }).writeTextIfChanged;

    expect(typeof writeTextIfChanged).toBe('function');
    expect(await writeTextIfChanged!(proxyPath, 'same')).toBe(false);
    expect(await readFile(proxyPath, 'utf8')).toBe('same');
  });
});
