import { colors } from './ui';
import { join } from 'path';
import { homedir } from 'os';
import { pathExists, ensureDir } from '../utils';

const BVM_DIR = process.env.BVM_DIR || join(homedir(), '.bvm');
const REGISTRY_CACHE_FILE = join(BVM_DIR, 'cache', 'registry-cache.json');
const REGISTRY_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Load cached registry from disk
 */
async function loadCachedRegistry(): Promise<{ registry: string; timestamp: number } | null> {
  try {
    if (!await pathExists(REGISTRY_CACHE_FILE)) return null;
    const content = await Bun.file(REGISTRY_CACHE_FILE).text();
    const data = JSON.parse(content);
    // Check if cache is still valid
    if (Date.now() - data.timestamp < REGISTRY_CACHE_TTL) {
      return data;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Save cached registry to disk
 */
async function saveCachedRegistry(registry: string): Promise<void> {
  try {
    await ensureDir(join(BVM_DIR, 'cache'));
    await Bun.write(REGISTRY_CACHE_FILE, JSON.stringify({
      registry,
      timestamp: Date.now()
    }));
  } catch {
    // Ignore cache write errors
  }
}

/**
 * Enhanced fetch with timeout support.
 */
export async function fetchWithTimeout(url: string, options: FetchRequestInit & { timeout?: number } = {}): Promise<Response> {
  const { timeout = 5000, ...fetchOptions } = options;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Request to ${url} timed out after ${timeout}ms`);
    }
    throw error;
  }
}

/**
 * Races multiple URLs (via HEAD request) and returns the fastest one.
 * Ignores failed requests.
 */
export async function raceRequests(urls: string[], timeout = 2000): Promise<string> {
  if (urls.length === 0) throw new Error('No URLs to race');
  if (urls.length === 1) return urls[0];

  return new Promise((resolve, reject) => {
    let failedCount = 0;
    let resolved = false;

    urls.forEach(url => {
      fetchWithTimeout(url, { method: 'HEAD', timeout })
        .then((res) => {
            if (res.ok && !resolved) {
                resolved = true;
                resolve(url);
            } else if (!resolved) {
                // If response is 404/500, count as failed
                failedCount++;
                if (failedCount === urls.length) reject(new Error('All requests failed'));
            }
        })
        .catch(() => {
            if (!resolved) {
                failedCount++;
                if (failedCount === urls.length) reject(new Error('All requests failed'));
            }
        });
    });
  });
}

/**
 * Detects user location using Cloudflare trace.
 * Returns 'CN' if in China, 'Other' otherwise, or null if detection fails/times out.
 */
export async function getGeoLocation(): Promise<string | null> {
    try {
        const res = await fetchWithTimeout('https://1.1.1.1/cdn-cgi/trace', { timeout: 500 });
        if (!res.ok) return null;
        const text = await res.text();
        const match = text.match(/loc=([A-Z]{2})/);
        return match ? match[1] : null;
    } catch (e) {
        return null;
    }
}

let cachedRegistry: string | null = null;

export const REGISTRIES = {
    NPM: 'https://registry.npmjs.org',
    TAOBAO: 'https://registry.npmmirror.com',
    TENCENT: 'https://mirrors.cloud.tencent.com/npm/',
};

/**
 * Determines the fastest registry based on location and race strategy.
 */
export async function getFastestRegistry(): Promise<string> {
    if (cachedRegistry) return cachedRegistry;

    const loc = await getGeoLocation();
    let candidates: string[] = [];

    if (loc === 'CN') {
        // In China: Prioritize mirrors
        candidates = [REGISTRIES.TAOBAO, REGISTRIES.TENCENT, REGISTRIES.NPM];
    } else {
        // Global: Prioritize official, but keep mirror as backup
        candidates = [REGISTRIES.NPM, REGISTRIES.TAOBAO];
    }

    try {
        // Race them!
        // We use a short timeout for the race to ensure we don't block startup too long.
        // But since we want to pick the fastest, we should wait for the first success.
        const winner = await raceRequests(candidates, 2000);
        cachedRegistry = winner;
        return winner;
    } catch (e) {
        // Fallback if race fails entirely (e.g. offline)
        // Return the first candidate (best guess)
        return candidates[0];
    }
}
