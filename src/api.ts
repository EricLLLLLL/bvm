import { join } from 'path';
import { USER_AGENT, getBunAssetName, REPO_FOR_BVM_CLI, ASSET_NAME_FOR_BVM, OS_PLATFORM, CPU_ARCH, IS_TEST_MODE, TEST_REMOTE_VERSIONS, BVM_CACHE_DIR } from './constants';
import { normalizeVersion } from './utils';
import { valid, rcompare, parse, compareParsed } from './utils/semver-lite';
import { colors } from './utils/ui';
import { getBunNpmPackage, getBunDownloadUrl } from './utils/npm-lookup';
import { runCommand } from './helpers/process';
import { getFastestRegistry, fetchWithTimeout } from './utils/network-utils';

const VERSIONS_CACHE_FILE = 'bun-versions.json';
const VERSIONS_CACHE_TTL = 60 * 60 * 1000; // 1 hour

/**
 * Fetches available Bun versions from the NPM registry.
 * Uses the fastest available registry based on race strategy.
 */
export async function fetchBunVersionsFromNpm(): Promise<string[]> {
  if (IS_TEST_MODE) {
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

  const fastestRegistry = await getFastestRegistry();
  // Fallback: If fastest fails, try official
  const registries = [fastestRegistry];
  if (fastestRegistry !== 'https://registry.npmjs.org') {
      registries.push('https://registry.npmjs.org');
  }

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
  if (IS_TEST_MODE) {
    return [...TEST_REMOTE_VERSIONS];
  }
  return new Promise((resolve, reject) => {
    const versions: string[] = [];
    
    try {
      const proc = Bun.spawn(['git', 'ls-remote', '--tags', 'https://github.com/oven-sh/bun.git'], {
        stdout: 'pipe',
        stderr: 'pipe',
      });

      const timeout = setTimeout(() => {
        proc.kill();
        reject(new Error('Git operation timed out'));
      }, 10000); // 10s timeout for git

      const stream = new Response(proc.stdout);
      stream.text().then(text => {
        clearTimeout(timeout);
        const lines = text.split('\n');
        for (const line of lines) {
          const match = line.match(/refs\/tags\/bun-v?(\d+\.\d+\.\d+.*)$/);
          if (match) {
             versions.push(match[1]);
          }
        }
        resolve(versions);
      }).catch(err => {
        clearTimeout(timeout);
        reject(err);
      });
      
    } catch (e: any) {
      reject(new Error(`Failed to run git: ${e.message}`));
    }
  });
}

/**
 * Main function to get Bun versions. Tries NPM, then falls back to Git.
 */
export async function fetchBunVersions(): Promise<string[]> {
  if (IS_TEST_MODE) {
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
  if (IS_TEST_MODE) {
      return TEST_REMOTE_VERSIONS.includes(version) || version === 'latest';
  }
  
  const registry = await getFastestRegistry();
  // NPM Registry URL must not have the 'v' prefix
  const plainVersion = version.replace(/^v/, '');
  const url = `${registry}/bun/${plainVersion}`;

  const curlCmd = OS_PLATFORM === 'win32' ? 'curl.exe' : 'curl';
  
  // Safety Wrapper: Don't let a sub-process hang the whole CLI
  const runWithTimeout = async () => {
      try {
        await runCommand([curlCmd, '-I', '-f', '-m', '5', '-s', url], {
            stdout: 'ignore',
            stderr: 'ignore'
        });
        return true;
      } catch (e) {
        return false;
      }
  };

  const timeout = new Promise<boolean>((resolve) => 
      setTimeout(() => resolve(false), 10000) // 10s hard timeout
  );

  return Promise.race([runWithTimeout(), timeout]);
}

/**
 * Fetches distribution tags (latest, canary, etc.) from NPM.
 * Used to resolve 'latest' without fetching the full version list.
 */
export async function fetchBunDistTags(): Promise<Record<string, string>> {
  if (IS_TEST_MODE) return { latest: '1.1.20' };

  const registry = await getFastestRegistry();
  const url = `${registry}/-/package/bun/dist-tags`;

  try {
    const response = await fetchWithTimeout(url, {
        headers: { 'User-Agent': USER_AGENT },
        timeout: 5000
    });
    
    if (response.ok) {
        return await response.json();
    }
  } catch (e) {}
  return {};
}

/**
 * Finds the download URL for a specific Bun version and platform.
 * @param version The target Bun version (e.g., "1.0.0", "latest").
 * @returns The download URL and the exact version found.
 */
export async function findBunDownloadUrl(targetVersion: string): Promise<{ url: string; mirrorUrl?: string; foundVersion: string } | null> {
    const fullVersion = normalizeVersion(targetVersion); // Ensure 'v' prefix

    if (!valid(fullVersion)) {
        console.error(colors.red(`Invalid version provided to findBunDownloadUrl: ${targetVersion}`));
        return null;
    }
    if (IS_TEST_MODE) {
        return {
          url: `https://example.com/${getBunAssetName(fullVersion)}`,
          foundVersion: fullVersion,
        };
    }

    // Determine platform/arch for NPM package lookup
    const os_platform = OS_PLATFORM === 'win32' ? 'win32' : OS_PLATFORM; // nodejs platform style
    const cpu_arch = CPU_ARCH === 'arm64' ? 'arm64' : 'x64';

    const npmPackage = getBunNpmPackage(os_platform, cpu_arch);
    if (!npmPackage) {
        throw new Error(`Unsupported platform/arch for NPM download: ${OS_PLATFORM}-${CPU_ARCH}`);
    }

    // Determine Registry
    // Priority: BVM_REGISTRY > Race Strategy
    let registry = '';
    if (process.env.BVM_REGISTRY) {
        registry = process.env.BVM_REGISTRY;
    } else if (process.env.BVM_DOWNLOAD_MIRROR) {
        registry = process.env.BVM_DOWNLOAD_MIRROR;
    } else {
        registry = await getFastestRegistry();
    }

    // Strip 'v' from version for NPM (1.1.0 not v1.1.0)
    const plainVersion = fullVersion.replace(/^v/, '');
    const url = getBunDownloadUrl(npmPackage, plainVersion, registry);

    return { url, foundVersion: fullVersion };
}

/**
 * Fetches the latest BVM release info.
 * @returns Object with tag_name and download_url for the current platform, or null.
 */
export async function fetchLatestBvmReleaseInfo(): Promise<{ tagName: string; downloadUrl: string } | null> {
  const assetName = ASSET_NAME_FOR_BVM;
  
  // Method 1: jsDelivr (Fastest, CDN cached)
  try {
    const response = await fetchWithTimeout(`https://cdn.jsdelivr.net/gh/${REPO_FOR_BVM_CLI}@latest/package.json`, {
        headers: { 'User-Agent': USER_AGENT },
        timeout: 2000
    });

    if (response.ok) {
        const pkg = await response.json();
        if (pkg && pkg.version) {
            const tagName = `v${pkg.version}`; // convention: tag is vX.Y.Z
            return {
                tagName: tagName,
                downloadUrl: `https://github.com/${REPO_FOR_BVM_CLI}/releases/download/${tagName}/${assetName}`
            };
        }
    }
  } catch (e) {
      // Fallback
  }

  // Method 2: GitHub Redirect (No API Rate Limit)
  try {
    const redirectUrl = `https://github.com/${REPO_FOR_BVM_CLI}/releases/latest`;
    const response = await fetchWithTimeout(redirectUrl, {
      method: 'HEAD',
      redirect: 'manual', // Don't follow automatically, we want the Location header
      headers: { 'User-Agent': USER_AGENT },
      timeout: 2000
    });
    
    // GitHub returns 302 Found for /releases/latest -> /releases/tag/vX.Y.Z
    if (response.status === 302 || response.status === 301) {
       const location = response.headers.get('location');
       if (location) {
          // location is like: https://github.com/bvm-cli/bvm/releases/tag/v1.0.10
          const parts = location.split('/');
          const tag = parts[parts.length - 1];
          if (tag && valid(tag)) {
             return {
               tagName: tag,
               downloadUrl: `https://github.com/${REPO_FOR_BVM_CLI}/releases/download/${tag}/${assetName}`
             };
          }
       }
    }
  } catch (e) {
      // Ignore error and fall back to API
  }

  // Method 3: GitHub API (Last Resort)
  const headers: HeadersInit = { 'User-Agent': USER_AGENT };
  const url = `https://api.github.com/repos/${REPO_FOR_BVM_CLI}/releases/latest`;
  
  try {
    const response = await fetchWithTimeout(url, { headers, timeout: 2000 });

    if (!response.ok) {
      return null;
    }
    const release = await response.json();
    
    const tagName = release.tag_name;
    const downloadUrl = `https://github.com/${REPO_FOR_BVM_CLI}/releases/download/${tagName}/${assetName}`;
    return {
      tagName: tagName,
      downloadUrl: downloadUrl,
    };
  } catch (error: any) {
    return null;
  }
}

// Missing imports to fix potential compilation errors
import { pathExists, readTextFile, writeTextFile, ensureDir } from './utils';