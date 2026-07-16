import { afterEach, describe, expect, test } from 'bun:test';
import { createHash } from 'crypto';
import { join } from 'path';
import { rm } from 'fs/promises';

import { parseSri, verifyFileIntegrity } from '../src/utils/integrity';

const fixturePath = join(import.meta.dir, '.tmp-integrity-fixture');

afterEach(async () => {
  await rm(fixturePath, { force: true });
});

describe('npm SRI verification', () => {
  test('parses a sha512 integrity value', () => {
    const digest = Buffer.alloc(64, 7).toString('base64');
    expect(parseSri(`sha512-${digest}`)).toEqual({ algorithm: 'sha512', digest });
  });

  test.each(['', 'sha256-abc', 'sha512-', 'not-sri'])(
    'rejects unsupported or malformed integrity %p',
    (integrity) => {
      expect(() => parseSri(integrity)).toThrow('SHA-512 integrity');
    },
  );

  test('accepts a file matching its SHA-512 digest', async () => {
    const bytes = 'trusted artifact';
    await Bun.write(fixturePath, bytes);
    const digest = createHash('sha512').update(bytes).digest('base64');
    await expect(verifyFileIntegrity(fixturePath, `sha512-${digest}`)).resolves.toBeUndefined();
  });

  test('rejects a file with a mismatched digest', async () => {
    await Bun.write(fixturePath, 'tampered artifact');
    const digest = createHash('sha512').update('trusted artifact').digest('base64');
    await expect(verifyFileIntegrity(fixturePath, `sha512-${digest}`)).rejects.toThrow('Integrity check failed');
  });
});
