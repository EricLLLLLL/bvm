import { afterEach, describe, it, expect } from 'bun:test';
import { mkdtemp, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { fetchWithTimeout, getFastestRegistry } from '../src/utils/network-utils';
import { selectRegistries } from '../src/utils/registry-selector';

const testDirs: string[] = [];

afterEach(async () => {
  await Promise.all(testDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe('NetworkUtils', () => {
  describe('registry selection', () => {
    it('orders recent successful sources without probing the network', async () => {
      const root = await mkdtemp(join(tmpdir(), 'bvm-registry-v2-cache-'));
      testDirs.push(root);
      const cacheFile = join(root, 'registry-cache.json');
      await writeFile(cacheFile, JSON.stringify({
        version: 2,
        updatedAt: 1_500,
        registries: {
          npmmirror: { latencyMs: 80, lastSuccess: 1_500, lastFailure: null, consecutiveFailures: 0 },
          npmjs: { latencyMs: 250, lastSuccess: 1_400, lastFailure: null, consecutiveFailures: 0 },
        },
      }));

      const selection = await selectRegistries({
        cacheFile,
        now: () => 2_000,
        probe: async () => { throw new Error('network probe must not run'); },
      });

      expect(selection.mode).toBe('automatic');
      expect(selection.candidates.map((item) => item.id).slice(0, 2)).toEqual(['npmmirror', 'npmjs']);
      expect(selection.cacheExpiresAt).toBe(1_500 + 24 * 60 * 60 * 1000);
    });

    it('uses only a normalized explicit registry', async () => {
      const selection = await selectRegistries({
        explicitRegistry: 'https://mirror.example/',
        probe: async () => { throw new Error('public registry probe must not run'); },
      });

      expect(selection.mode).toBe('explicit');
      expect(selection.candidates).toEqual([
        { id: 'custom', url: 'https://mirror.example', priority: 0 },
      ]);
      expect(selection.health).toEqual([]);
    });

    it('probes only the explicit registry when refresh is forced', async () => {
      const probed: string[] = [];
      const selection = await selectRegistries({
        explicitRegistry: 'https://mirror.example/',
        forceRefresh: true,
        probe: async (candidate) => {
          probed.push(candidate.url);
          return {
            id: candidate.id,
            url: candidate.url,
            reachable: true,
            latencyMs: 12,
            checkedAt: 2_000,
          };
        },
      });

      expect(probed).toEqual(['https://mirror.example']);
      expect(selection.health[0]?.reachable).toBe(true);
    });

    it('migrates a valid legacy winner cache without probing', async () => {
      const root = await mkdtemp(join(tmpdir(), 'bvm-registry-legacy-cache-'));
      testDirs.push(root);
      const cacheFile = join(root, 'registry-cache.json');
      await writeFile(cacheFile, JSON.stringify({
        registry: 'https://registry.npmmirror.com',
        timestamp: 1_500,
      }));

      const selection = await selectRegistries({
        cacheFile,
        now: () => 2_000,
        probe: async () => { throw new Error('network probe must not run'); },
      });

      expect(selection.candidates[0].id).toBe('npmmirror');
      expect(selection.cacheExpiresAt).toBe(1_500 + 24 * 60 * 60 * 1000);
    });
  });

  describe('fetchWithTimeout', () => {
    it('should fetch successfully within timeout', async () => {
      const res = await fetchWithTimeout('https://example.com', { timeout: 5000, method: 'HEAD' });
      expect(res.ok).toBe(true);
    });

    it('should throw timeout error if request takes too long', async () => {
      try {
        await fetchWithTimeout('https://example.com', { timeout: 1, method: 'HEAD' });
        throw new Error('Should have timed out');
      } catch (e: any) {
        expect(e.message).toContain('timed out');
      }
    });
  });

  describe('getFastestRegistry', () => {
      it('reuses the v2 health cache without probing the network', async () => {
          const root = await mkdtemp(join(tmpdir(), 'bvm-registry-v2-wrapper-cache-'));
          testDirs.push(root);
          const cacheFile = join(root, 'registry-cache.json');
          await writeFile(cacheFile, JSON.stringify({
              version: 2,
              updatedAt: Date.now(),
              registries: {
                  tencent: {
                      latencyMs: 20,
                      lastSuccess: Date.now(),
                      lastFailure: null,
                      consecutiveFailures: 0,
                  },
              },
          }));

          const registry = await getFastestRegistry({ cacheFile });

          expect(registry).toBe('https://mirrors.cloud.tencent.com/npm');
      });

      it('should return a valid registry URL', async () => {
          const registry = await getFastestRegistry();
          expect(registry).toMatch(/^https:\/\//);
          expect([
              'https://registry.npmjs.org',
              'https://registry.npmmirror.com',
              'https://mirrors.cloud.tencent.com/npm/'
          ]).toContain(registry);
      });
  });
});
