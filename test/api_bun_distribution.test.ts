import { afterEach, describe, expect, test, vi } from 'bun:test';

import { checkBunVersionExists, fetchBunDistTags, findBunDownloadUrl } from '../src/api';
import * as networkUtils from '../src/utils/network-utils';

const validIntegrity = `sha512-${Buffer.alloc(64, 3).toString('base64')}`;

describe('Bun distribution metadata', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    delete process.env.BVM_REGISTRY;
    delete process.env.BVM_DOWNLOAD_MIRROR;
    vi.restoreAllMocks();
  });

  test('checks exact versions across the ordered public mirrors', async () => {
    vi.spyOn(networkUtils, 'getFastestRegistry').mockResolvedValue('https://registry.npmmirror.com');
    const requestedUrls: string[] = [];
    global.fetch = vi.fn((url: string | URL | Request) => {
      requestedUrls.push(String(url));
      return Promise.resolve({ ok: requestedUrls.length === 2 } as Response);
    }) as typeof fetch;

    expect(await checkBunVersionExists('1.3.11')).toBe(true);
    expect(requestedUrls[0]).toContain('registry.npmmirror.com/bun/1.3.11');
    expect(requestedUrls[1]).toContain('mirrors.cloud.tencent.com/npm/bun/1.3.11');
  });

  test('falls back across public mirrors for distribution tags', async () => {
    vi.spyOn(networkUtils, 'getFastestRegistry').mockResolvedValue('https://registry.npmmirror.com');
    const requestedUrls: string[] = [];
    global.fetch = vi.fn((url: string | URL | Request) => {
      requestedUrls.push(String(url));
      if (requestedUrls.length === 1) return Promise.resolve({ ok: false, status: 503 } as Response);
      return Promise.resolve({ ok: true, json: async () => ({ latest: '1.3.11' }) } as Response);
    }) as typeof fetch;

    expect(await fetchBunDistTags()).toEqual({ latest: '1.3.11' });
    expect(requestedUrls[1]).toContain('mirrors.cloud.tencent.com/npm');
  });

  test('does not fall back from an explicit registry', async () => {
    process.env.BVM_REGISTRY = 'https://private.example/';
    vi.spyOn(networkUtils, 'getFastestRegistry').mockImplementation(async () => {
      throw new Error('automatic selection must not run');
    });
    const requestedUrls: string[] = [];
    global.fetch = vi.fn((url: string | URL | Request) => {
      requestedUrls.push(String(url));
      return Promise.resolve({ ok: false, status: 503 } as Response);
    }) as typeof fetch;

    expect(await checkBunVersionExists('1.3.11')).toBe(false);
    expect(requestedUrls).toEqual(['https://private.example/bun/1.3.11']);
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
    expect(result?.urls[0]).toBe(result?.url);
    expect(result?.urls[1]).toContain('registry.npmmirror.com');
    expect(result?.urls[2]).toContain('mirrors.cloud.tencent.com/npm');
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

  test('falls back to the next registry when metadata lookup fails', async () => {
    vi.spyOn(networkUtils, 'getFastestRegistry').mockResolvedValue('https://registry.npmmirror.com');
    const requestedUrls: string[] = [];
    global.fetch = vi.fn((url: string | URL | Request) => {
      requestedUrls.push(String(url));
      if (requestedUrls.length === 1) {
        return Promise.resolve({ ok: false, status: 503 } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          dist: {
            tarball: 'https://mirrors.cloud.tencent.com/npm/@oven/bun-test.tgz',
            integrity: validIntegrity,
          },
        }),
      } as Response);
    }) as typeof fetch;

    const result = await findBunDownloadUrl('1.3.11');

    expect(requestedUrls[0]).toContain('registry.npmmirror.com');
    expect(requestedUrls[1]).toContain('mirrors.cloud.tencent.com/npm');
    expect(result?.integrity).toBe(validIntegrity);
  });

  test('requests the baseline npm package when AVX2 is unavailable', async () => {
    vi.spyOn(networkUtils, 'getFastestRegistry').mockResolvedValue('https://registry.npmjs.org');
    let requestedUrl = '';
    global.fetch = vi.fn((url: string | URL | Request) => {
      requestedUrl = String(url);
      return Promise.resolve({
        ok: true,
        json: async () => ({
          dist: {
            tarball: 'https://registry.npmjs.org/bun-baseline.tgz',
            integrity: validIntegrity,
          },
        }),
      } as Response);
    }) as typeof fetch;

    await findBunDownloadUrl('1.3.11', { platform: 'linux', arch: 'x64', hasAvx2: false });

    expect(requestedUrl).toContain('@oven/bun-linux-x64-baseline/1.3.11');
  });
});
