import { afterEach, describe, expect, test } from 'bun:test';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

import { extractArchive } from '../src/utils/archive';

describe('archive extraction', () => {
  let sandbox = '';

  afterEach(async () => {
    if (sandbox) await rm(sandbox, { recursive: true, force: true });
  });

  test('creates a missing destination directory before extracting tarballs', async () => {
    sandbox = await mkdtemp(join(tmpdir(), 'bvm-archive-'));
    const sourceDir = join(sandbox, 'source');
    const archivePath = join(sandbox, 'fixture.tgz');
    const destinationDir = join(sandbox, 'missing-destination');
    await mkdir(sourceDir);
    await writeFile(join(sourceDir, 'bun'), 'fixture');

    const archive = Bun.spawnSync(['tar', '-czf', archivePath, '-C', sourceDir, '.']);
    expect(archive.exitCode).toBe(0);

    await extractArchive(archivePath, destinationDir);

    expect(await readFile(join(destinationDir, 'bun'), 'utf8')).toBe('fixture');
  });
});
