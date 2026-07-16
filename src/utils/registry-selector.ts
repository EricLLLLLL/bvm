import { homedir } from 'os';
import { dirname, join } from 'path';
import { mkdir, readFile, rename, rm, writeFile } from 'fs/promises';

import { fetchWithTimeout } from './http';

export type RegistryId = 'npmmirror' | 'tencent' | 'npmjs' | 'custom';

export interface RegistryCandidate {
  id: RegistryId;
  url: string;
  priority: number;
}

export interface RegistryHealth {
  id: RegistryId;
  url: string;
  reachable: boolean;
  latencyMs: number | null;
  checkedAt: number;
  error?: string;
}

export interface RegistryHealthState {
  latencyMs: number | null;
  lastSuccess: number | null;
  lastFailure: number | null;
  consecutiveFailures: number;
}

export interface RegistryHealthCache {
  version: 2;
  updatedAt: number;
  registries: Partial<Record<RegistryId, RegistryHealthState>>;
}

export interface RegistrySelection {
  mode: 'automatic' | 'explicit';
  candidates: RegistryCandidate[];
  health: RegistryHealth[];
  cacheExpiresAt: number | null;
  staleHealth?: RegistryHealth[];
}

export interface SelectRegistriesOptions {
  cacheFile?: string;
  forceRefresh?: boolean;
  explicitRegistry?: string | null;
  now?: () => number;
  probe?: (candidate: RegistryCandidate) => Promise<RegistryHealth>;
}

export interface TestRegistriesOptions extends SelectRegistriesOptions {
  candidates?: RegistryCandidate[];
}

export const REGISTRY_CACHE_TTL = 24 * 60 * 60 * 1000;
export const REGISTRY_CANDIDATES: RegistryCandidate[] = [
  { id: 'npmmirror', url: 'https://registry.npmmirror.com', priority: 0 },
  { id: 'tencent', url: 'https://mirrors.cloud.tencent.com/npm', priority: 1 },
  { id: 'npmjs', url: 'https://registry.npmjs.org', priority: 2 },
];

const DEFAULT_CACHE_FILE = join(
  process.env.BVM_DIR || join(process.env.HOME || homedir(), '.bvm'),
  'cache',
  'registry-cache.json',
);

function normalizeRegistryUrl(value: string): string {
  const normalized = value.trim().replace(/\/+$/, '');
  const parsed = new URL(normalized);
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    throw new Error(`Unsupported registry protocol: ${parsed.protocol}`);
  }
  return normalized;
}

function orderedCatalog(): RegistryCandidate[] {
  return REGISTRY_CANDIDATES.map((candidate, priority) => ({ ...candidate, priority }));
}

async function loadCache(cacheFile: string): Promise<RegistryHealthCache | null> {
  try {
    const parsed = JSON.parse(await readFile(cacheFile, 'utf8'));
    if (parsed?.version === 2 && typeof parsed.updatedAt === 'number' && parsed.registries) {
      return parsed as RegistryHealthCache;
    }
    if (typeof parsed?.registry === 'string' && typeof parsed.timestamp === 'number') {
      const legacyUrl = normalizeRegistryUrl(parsed.registry);
      const candidate = REGISTRY_CANDIDATES.find((item) => item.url === legacyUrl);
      if (!candidate) return null;
      return {
        version: 2,
        updatedAt: parsed.timestamp,
        registries: {
          [candidate.id]: {
            latencyMs: null,
            lastSuccess: parsed.timestamp,
            lastFailure: null,
            consecutiveFailures: 0,
          },
        },
      };
    }
    return null;
  } catch {
    return null;
  }
}

async function saveCache(cacheFile: string, cache: RegistryHealthCache): Promise<void> {
  const tempFile = `${cacheFile}.${process.pid}.tmp`;
  try {
    await mkdir(dirname(cacheFile), { recursive: true });
    await writeFile(tempFile, JSON.stringify(cache));
    await rename(tempFile, cacheFile);
  } catch {
    await rm(tempFile, { force: true }).catch(() => {});
  }
}

function cacheToHealth(
  cache: RegistryHealthCache,
  catalog: RegistryCandidate[],
): RegistryHealth[] {
  return catalog.flatMap((candidate) => {
    const state = cache.registries[candidate.id];
    if (!state) return [];
    const reachable = state.lastSuccess !== null
      && (state.lastFailure === null || state.lastSuccess >= state.lastFailure);
    return [{
      id: candidate.id,
      url: candidate.url,
      reachable,
      latencyMs: state.latencyMs,
      checkedAt: Math.max(state.lastSuccess || 0, state.lastFailure || 0, cache.updatedAt),
      ...(!reachable ? { error: 'last check failed' } : {}),
    }];
  });
}

function rankCandidates(
  catalog: RegistryCandidate[],
  cache: RegistryHealthCache | null,
): RegistryCandidate[] {
  return [...catalog].sort((left, right) => {
    const leftState = cache?.registries[left.id];
    const rightState = cache?.registries[right.id];
    const leftSuccessful = leftState?.lastSuccess != null
      && (leftState.lastFailure == null || leftState.lastSuccess >= leftState.lastFailure);
    const rightSuccessful = rightState?.lastSuccess != null
      && (rightState.lastFailure == null || rightState.lastSuccess >= rightState.lastFailure);
    if (leftSuccessful !== rightSuccessful) return leftSuccessful ? -1 : 1;
    const failureDiff = (leftState?.consecutiveFailures || 0) - (rightState?.consecutiveFailures || 0);
    if (failureDiff !== 0) return failureDiff;
    const latencyDiff = (leftState?.latencyMs ?? Number.MAX_SAFE_INTEGER)
      - (rightState?.latencyMs ?? Number.MAX_SAFE_INTEGER);
    return latencyDiff || left.priority - right.priority;
  }).map((candidate, priority) => ({ ...candidate, priority }));
}

async function defaultProbe(
  candidate: RegistryCandidate,
  now: () => number,
): Promise<RegistryHealth> {
  const startedAt = now();
  try {
    const response = await fetchWithTimeout(`${candidate.url}/-/ping`, {
      method: 'GET',
      timeout: 2000,
    });
    if (!response.ok) throw new Error(`status ${response.status}`);
    return {
      id: candidate.id,
      url: candidate.url,
      reachable: true,
      latencyMs: Math.max(0, now() - startedAt),
      checkedAt: now(),
    };
  } catch (error: any) {
    return {
      id: candidate.id,
      url: candidate.url,
      reachable: false,
      latencyMs: null,
      checkedAt: now(),
      error: error.message,
    };
  }
}

export async function testRegistries(
  options: TestRegistriesOptions = {},
): Promise<RegistryHealth[]> {
  const now = options.now || Date.now;
  const candidates = options.candidates || orderedCatalog();
  const probe = options.probe || ((candidate) => defaultProbe(candidate, now));
  return Promise.all(candidates.map(probe));
}

export async function selectRegistries(
  options: SelectRegistriesOptions = {},
): Promise<RegistrySelection> {
  const explicitValue = options.explicitRegistry
    ?? process.env.BVM_REGISTRY
    ?? process.env.BVM_DOWNLOAD_MIRROR;
  if (explicitValue) {
    const candidate: RegistryCandidate = {
      id: 'custom',
      url: normalizeRegistryUrl(explicitValue),
      priority: 0,
    };
    const health = options.forceRefresh
      ? await testRegistries({ ...options, candidates: [candidate] })
      : [];
    return {
      mode: 'explicit',
      candidates: [candidate],
      health,
      cacheExpiresAt: null,
    };
  }

  const now = options.now || Date.now;
  const cacheFile = options.cacheFile || DEFAULT_CACHE_FILE;
  const cache = await loadCache(cacheFile);
  const catalog = orderedCatalog();
  const cacheIsFresh = cache && now() - cache.updatedAt < REGISTRY_CACHE_TTL;
  if (cacheIsFresh && !options.forceRefresh) {
    return {
      mode: 'automatic',
      candidates: rankCandidates(catalog, cache),
      health: cacheToHealth(cache, catalog),
      cacheExpiresAt: cache.updatedAt + REGISTRY_CACHE_TTL,
    };
  }

  const staleHealth = cache ? cacheToHealth(cache, catalog) : [];
  const health = await testRegistries({ ...options, candidates: catalog });
  const updatedAt = now();
  const registries: RegistryHealthCache['registries'] = {};
  for (const result of health) {
    const previous = cache?.registries[result.id];
    registries[result.id] = {
      latencyMs: result.latencyMs ?? previous?.latencyMs ?? null,
      lastSuccess: result.reachable ? result.checkedAt : previous?.lastSuccess ?? null,
      lastFailure: result.reachable ? previous?.lastFailure ?? null : result.checkedAt,
      consecutiveFailures: result.reachable ? 0 : (previous?.consecutiveFailures || 0) + 1,
    };
  }
  const nextCache: RegistryHealthCache = { version: 2, updatedAt, registries };
  await saveCache(cacheFile, nextCache);

  return {
    mode: 'automatic',
    candidates: rankCandidates(catalog, nextCache),
    health,
    cacheExpiresAt: updatedAt + REGISTRY_CACHE_TTL,
    ...(staleHealth.length ? { staleHealth } : {}),
  };
}
