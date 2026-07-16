import { afterEach, describe, expect, test } from 'bun:test';
import { mkdtemp, rm } from 'fs/promises';
import { readFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import { triggerUpdateCheck } from '../src/utils/update-checker';

const testDirs: string[] = [];

afterEach(async () => {
  await Promise.all(testDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe('update checker backoff', () => {
  test('CLI limits background checks to commands that display update notices', () => {
    const appSource = readFileSync(join(process.cwd(), 'src', 'cli', 'app.ts'), 'utf8');

    expect(appSource).toContain("const updateAwareCommands = new Set(['ls', 'current', 'doctor', 'default'])");
    expect(appSource).toContain('if (updateAwareCommands.has(commandName))');
  });

  test('records failed attempts so consecutive CLI commands do not retry the network', async () => {
    const root = await mkdtemp(join(tmpdir(), 'bvm-update-check-'));
    testDirs.push(root);
    let attempts = 0;
    const cacheFile = join(root, 'update-check.json');
    const fetchLatest = async () => {
      attempts += 1;
      return null;
    };

    await triggerUpdateCheck({ cacheFile, fetchLatest, force: true });
    await triggerUpdateCheck({ cacheFile, fetchLatest, force: true });

    expect(attempts).toBe(1);
  });
});
