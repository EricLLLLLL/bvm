import { afterEach, describe, expect, test, vi } from 'bun:test';

import { findBunDownloadUrl } from '../src/api';
import * as networkUtils from '../src/utils/network-utils';

const validIntegrity = `sha512-${Buffer.alloc(64, 3).toString('base64')}`;

describe('Bun distribution metadata', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  test('uses registry metadata tarball and SHA-512 integrity', async () => {
    vi.spyOn(networkUtils, 'getFastestRegistry').mockResolvedValue('https://registry.npmjs.org');
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        dist: {
          tarball: 'https://registry.npmjs.org/@oven/bun-test/-/bun-test-1.3.11.tgz',
          integrity: validIntegrity,
        },
      }),
    }) as typeof fetch;

    const result = await findBunDownloadUrl('1.3.11');

    expect(result?.url).toContain('bun-test-1.3.11.tgz');
    expect(result?.integrity).toBe(validIntegrity);
  });

  test('rejects metadata without integrity', async () => {
    vi.spyOn(networkUtils, 'getFastestRegistry').mockResolvedValue('https://registry.npmjs.org');
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ dist: { tarball: 'https://example.com/bun.tgz' } }),
    }) as typeof fetch;

    await expect(findBunDownloadUrl('1.3.11')).rejects.toThrow('integrity');
  });
});
