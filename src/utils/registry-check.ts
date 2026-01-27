import { fetchWithTimeout } from '../api'; // Reuse existing wrapper if available, or just fetch

export const REGISTRIES = {
  NPM: 'https://registry.npmjs.org',
  NPM_MIRROR: 'https://registry.npmmirror.com',
};

export class RegistrySpeedTester {
  private timeoutMs: number;

  constructor(timeoutMs = 3000) {
    this.timeoutMs = timeoutMs;
  }

  async getFastestRegistry(): Promise<string> {
    const check = async (url: string): Promise<string> => {
      const start = Date.now();
      try {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), this.timeoutMs);
        
        // We check a small JSON endpoint or just root
        // npmmirror root returns JSON, npmjs root returns JSON.
        // HEAD request is lighter.
        const res = await fetch(url, { 
          method: 'HEAD', 
          signal: controller.signal 
        });
        clearTimeout(id);
        
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return url;
      } catch (e) {
        throw e;
      }
    };

    try {
      // Race them
      const winner = await Promise.any([
        check(REGISTRIES.NPM).then(() => REGISTRIES.NPM),
        check(REGISTRIES.NPM_MIRROR).then(() => REGISTRIES.NPM_MIRROR),
      ]);
      return winner;
    } catch (e) {
      // If all fail (e.g. offline), default to NPM logic or throw
      // But usually we just return NPM as safe default if we can't decide
      return REGISTRIES.NPM;
    }
  }
}
