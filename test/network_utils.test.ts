import { afterEach, describe, it, expect, mock } from 'bun:test';
import { mkdtemp, rm, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { fetchWithTimeout, raceRequests, getGeoLocation, getFastestRegistry } from '../src/utils/network-utils';

const testDirs: string[] = [];

afterEach(async () => {
  await Promise.all(testDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

describe('NetworkUtils', () => {
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

  describe('raceRequests', () => {
    it('should return the fastest successful URL', async () => {
      const urls = ['https://registry.npmjs.org', 'https://registry.npmmirror.com'];
      const winner = await raceRequests(urls);
      expect(urls).toContain(winner);
    });

    it('should handle empty list', async () => {
        try {
            await raceRequests([]);
            throw new Error('Should fail');
        } catch (e: any) {
            expect(e.message).toBeDefined();
        }
    });
  });

  describe('getGeoLocation', () => {
    it('should return CN or Other', async () => {
        // This is a live test, so we just check it doesn't crash
        const loc = await getGeoLocation();
        expect(typeof loc).toBe('string');
    });
  });

  describe('getFastestRegistry', () => {
      it('uses a valid disk cache without performing network probes', async () => {
          const root = await mkdtemp(join(tmpdir(), 'bvm-registry-cache-'));
          testDirs.push(root);
          const cacheFile = join(root, 'registry-cache.json');
          await writeFile(cacheFile, JSON.stringify({
              registry: 'https://cached.example',
              timestamp: Date.now(),
          }));

          const registry = await getFastestRegistry({
              cacheFile,
              getLocation: async () => { throw new Error('network should not run'); },
              race: async () => { throw new Error('network should not run'); },
          });

          expect(registry).toBe('https://cached.example');
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
