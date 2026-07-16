import { join } from 'path';
import { USER_AGENT, getBunAssetName, OS_PLATFORM, getCpuArch, hasAvx2Support, isTestMode, TEST_REMOTE_VERSIONS, BVM_CACHE_DIR } from './constants';
import { normalizeVersion } from './utils';
import { valid, rcompare, parse, compareParsed } from './utils/semver-lite';
import { colors } from './utils/ui';
import { getBunNpmPackage, getBunDownloadUrl } from './utils/npm-lookup';
import { getFastestRegistry, fetchWithTimeout } from './utils/network-utils';
import { REGISTRY_CANDIDATES } from './utils/registry-selector';

const VERSIONS_CACHE_FILE = 'bun-versions.json';
const VERSIONS_CACHE_TTL = 60 * 60 * 1000; // 1 hour

async function getOrderedRegistries(): Promise<string[]> {
  const explicitRegistry = process.env.BVM_REGISTRY || process.env.BVM_DOWNLOAD_MIRROR;
  const firstRegistry = explicitRegistry || await getFastestRegistry();
  return [
    firstRegistry,
    ...(explicitRegistry ? [] : REGISTRY_CANDIDATES.map((candidate) => candidate.url)),
  ].map((registry) => registry.replace(/\/+$/, ''))
    .filter((registry, index, all) => all.indexOf(registry) === index);
}

/**
 * Fetches available Bun versions from the NPM registry.
 * Uses the fastest available registry based on race strategy.
 */
export async function fetchBunVersionsFromNpm(): Promise<string[]> {
  if (isTestMode()) {
    return [...TEST_REMOTE_VERSIONS];
  }

  const cachePath = join(BVM_CACHE_DIR, VERSIONS_CACHE_FILE);
  try {
      if (await pathExists(cachePath)) {
          const content = await readTextFile(cachePath);
          const cache = JSON.parse(content);
          if (Date.now() - cache.timestamp < VERSIONS_CACHE_TTL && Array.isArray(cache.versions)) {
              return cache.versions;
          }
      }
  } catch (e) {}

  const registries = await getOrderedRegistries();

  let lastError: Error | null = null;

  for (const registry of registries) {
    // Append /bun to the registry URL for the package info
    const url = `${registry.replace(/\/$/, '')}/bun`;

    try {
      const response = await fetchWithTimeout(url, {
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'application/vnd.npm.install-v1+json'
        },
        timeout: 10000 // 10s timeout
      });

      if (!response.ok) {
        throw new Error(`Status ${response.status}`);
      }

      const data = await response.json();
      if (!data.versions) {
         throw new Error(`Invalid response (no versions)`);
      }

      const keys = Object.keys(data.versions);
      
      // Save to cache
      try {
          await ensureDir(BVM_CACHE_DIR);
          await writeTextFile(cachePath, JSON.stringify({
              timestamp: Date.now(),
              versions: keys
          }));
      } catch (e) {}

      return keys;
    } catch (error: any) {
      lastError = error;
      // Continue to next registry
    }
  }

  throw lastError || new Error('Failed to fetch versions from any registry.');
}

/**
 * Fetches available Bun versions using 'git ls-remote'.
 * Backup method: No API rate limits, no tokens required.
 */
export async function fetchBunVersionsFromGit(): Promise<string[]> {
  if (isTestMode()) {
    return [...TEST_REMOTE_VERSIONS];
  }

  const proc = Bun.spawn(['git', 'ls-remote', '--tags', 'https://github.com/oven-sh/bun.git'], {
    stdout: 'pipe',
    stderr: 'pipe',
  });

  const timeout = setTimeout(() => proc.kill(), 10000);
  const text = await new Response(proc.stdout).text();
  clearTimeout(timeout);

  const versions: string[] = [];
  for (const line of text.split('\n')) {
    const match = line.match(/refs\/tags\/bun-v?(\d+\.\d+\.\d+.*)$/);
    if (match) versions.push(match[1]);
  }
  return versions;
}

/**
 * Main function to get Bun versions. Tries NPM, then falls back to Git.
 */
export async function fetchBunVersions(): Promise<string[]> {
  if (isTestMode()) {
    return [...TEST_REMOTE_VERSIONS];
  }
  // Strategy 1: NPM
  try {
    const versions = await fetchBunVersionsFromNpm();
    
    // Optimization: Map-Sort-Map to avoid repeated parsing and GC issues
    const mapped = versions
        .filter(v => valid(v))
        .map(v => ({ v, parsed: parse(v) }));
        
    // Reverse sort (newest first)
    mapped.sort((a, b) => compareParsed(b.parsed, a.parsed));
    
    return mapped.map(m => m.v);
  } catch (npmError: any) {
    // Strategy 2: Git
    try {
          const versions = await fetchBunVersionsFromGit();
          if (versions.length > 0) {
              const uniqueAndSortedVersions = Array.from(new Set(versions.filter(v => valid(v))));
              return uniqueAndSortedVersions.sort(rcompare);
          }
          throw new Error('No versions found via Git');    } catch (gitError: any) {
      throw new Error(`Failed to fetch versions. NPM: ${npmError.message}. Git: ${gitError.message}`);
    }
  }
}

/**
 * Directly checks if a specific Bun version exists on the registry.
 * This avoids fetching the entire version list for exact version installs.
 */
export async function checkBunVersionExists(version: string): Promise<boolean> {
  if (isTestMode()) {
    return TEST_REMOTE_VERSIONS.includes(version) || version === 'latest';
  }

  const plainVersion = version.replace(/^v/, '');
  const registries = await getOrderedRegistries();
  for (const registry of registries) {
    try {
      const response = await fetchWithTimeout(`${registry}/bun/${plainVersion}`, {
        method: 'HEAD',
        headers: { 'User-Agent': USER_AGENT },
        timeout: 5000,
      });
      if (response.ok) return true;
    } catch {
      // Try the next configured public mirror.
    }
  }
  return false;
}

/**
 * Fetches distribution tags (latest, canary, etc.) from NPM.
 * Used to resolve 'latest' without fetching the full version list.
 */
export async function fetchBunDistTags(): Promise<Record<string, string>> {
  if (isTestMode()) return { latest: '1.1.20' };

  const registries = await getOrderedRegistries();
  for (const registry of registries) {
    try {
      const response = await fetchWithTimeout(`${registry}/-/package/bun/dist-tags`, {
        headers: { 'User-Agent': USER_AGENT },
        timeout: 5000,
      });
      if (!response.ok) continue;
      const tags = await response.json() as Record<string, string>;
      if (tags && typeof tags === 'object') {
        return tags;
      }
    } catch {
      // Try the next configured public mirror.
    }
  }
  return {};
}

/**
 * Finds the download URL for a specific Bun version and platform.
 * @param version The target Bun version (e.g., "1.0.0", "latest").
 * @returns The download URL and the exact version found.
 */
export interface BunDownloadInfo {
  url: string;
  urls: string[];
  foundVersion: string;
  integrity: string;
}

export async function findBunDownloadUrl(
    targetVersion: string,
    options: { platform?: string; arch?: string; hasAvx2?: boolean } = {},
): Promise<BunDownloadInfo | null> {
    const fullVersion = normalizeVersion(targetVersion); // Ensure 'v' prefix

    if (!valid(fullVersion)) {
        console.error(colors.red(`Invalid version provided to findBunDownloadUrl: ${targetVersion}`));
        return null;
    }
    if (isTestMode()) {
        return {
          url: `https://example.com/${getBunAssetName(fullVersion)}`,
          urls: [`https://example.com/${getBunAssetName(fullVersion)}`],
          foundVersion: fullVersion,
          integrity: `sha512-${Buffer.alloc(64).toString('base64')}`,
        };
    }

    // Determine platform/arch for NPM package lookup
    const detectedPlatform = options.platform || OS_PLATFORM;
    const detectedArch = options.arch || getCpuArch();
    const os_platform = detectedPlatform === 'win32' ? 'win32' : detectedPlatform;
    const cpu_arch = detectedArch === 'arm64' ? 'arm64' : 'x64';
    const hasAvx2 = options.hasAvx2 ?? hasAvx2Support();

    const npmPackage = getBunNpmPackage(os_platform, cpu_arch, hasAvx2);
    if (!npmPackage) {
        throw new Error(`Unsupported platform/arch for NPM download: ${OS_PLATFORM}-${detectedArch}`);
    }

    const registries = await getOrderedRegistries();

    const plainVersion = fullVersion.replace(/^v/, '');
    let url = '';
    let integrity = '';
    const metadataFailures: string[] = [];
    for (const registry of registries) {
      try {
        const metadataResponse = await fetchWithTimeout(`${registry}/${npmPackage}/${plainVersion}`, {
          headers: { 'User-Agent': USER_AGENT },
          timeout: 10000,
        });
        if (!metadataResponse.ok) throw new Error(`status ${metadataResponse.status}`);
        const metadata = await metadataResponse.json() as {
          dist?: { tarball?: string; integrity?: string };
        };
        if (!metadata.dist?.tarball || !metadata.dist.integrity?.startsWith('sha512-')) {
          throw new Error('missing SHA-512 integrity');
        }
        url = metadata.dist.tarball;
        integrity = metadata.dist.integrity;
        break;
      } catch (error: any) {
        metadataFailures.push(`${registry}: ${error.message}`);
      }
    }
    if (!url || !integrity) {
      throw new Error(
        `Bun package metadata for ${npmPackage}@${plainVersion} is missing SHA-512 integrity or unavailable. Attempted: ${metadataFailures.join('; ')}`,
      );
    }

    const urls = [
      url,
      ...registries
        .filter((registry) => !url.startsWith(`${registry}/`))
        .map((registry) => getBunDownloadUrl(npmPackage, plainVersion, registry)),
    ].filter((candidate, index, all) => all.indexOf(candidate) === index);

    return { url, urls, foundVersion: fullVersion, integrity };
}

/**
 * Fetches the latest BVM release info from NPM Registry.
 * @returns Object with version, tarball url, and integrity check.
 */
export async function fetchLatestBvmReleaseInfo(): Promise<{ version: string; tarball: string; integrity: string; shasum: string } | null> {
  const registries = await getOrderedRegistries();
  for (const registry of registries) {
    try {
      const distTagsRes = await fetchWithTimeout(`${registry}/-/package/bvm-core/dist-tags`, {
        headers: { 'User-Agent': USER_AGENT },
        timeout: 5000,
      });

      if (!distTagsRes.ok) continue;
      const tags = await distTagsRes.json();
      const latestVersion = tags.latest;
      if (!latestVersion) continue;

      const versionRes = await fetchWithTimeout(`${registry}/bvm-core/${latestVersion}`, {
        headers: { 'User-Agent': USER_AGENT },
        timeout: 5000,
      });

      if (!versionRes.ok) continue;
      const data = await versionRes.json();
      if (!data.dist?.tarball || !data.dist.integrity) continue;
      return {
        version: latestVersion,
        tarball: data.dist.tarball,
        integrity: data.dist.integrity,
        shasum: data.dist.shasum,
      };
    } catch {
      // Try the next configured public mirror.
    }
  }
  return null;
}

// Missing imports to fix potential compilation errors
import { pathExists, readTextFile, writeTextFile, ensureDir } from './utils';
