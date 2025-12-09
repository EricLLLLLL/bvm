import { USER_AGENT, getBunAssetName } from './constants';
import { normalizeVersion } from './utils';
import semver from 'semver';
import chalk from 'chalk';
import { spawn } from 'child_process';

/**
 * Detects if the user is likely in China based on timezone.
 */
function isChina(): boolean {
  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return timeZone === 'Asia/Shanghai' || timeZone === 'Asia/Chongqing' || timeZone === 'Asia/Harbin' || timeZone === 'Asia/Urumqi';
  } catch (e) {
    return false;
  }
}

/**
 * Fetches available Bun versions from the NPM registry.
 * Uses a failover strategy:
 * - In China: Prefer npmmirror, fallback to npmjs.
 * - Elsewhere: Prefer npmjs, fallback to npmmirror.
 */
export async function fetchBunVersionsFromNpm(): Promise<string[]> {
  const inChina = isChina();
  const registries = inChina 
    ? ['https://registry.npmmirror.com/bun', 'https://registry.npmjs.org/bun']
    : ['https://registry.npmjs.org/bun', 'https://registry.npmmirror.com/bun'];

  let lastError: Error | null = null;

  for (const registry of registries) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout per registry

    try {
      if (inChina && registry.includes('npmmirror')) {
          // Optional: console.log(chalk.gray('Trying npmmirror...'));
      }

      const response = await fetch(registry, {
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'application/vnd.npm.install-v1+json'
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Registry (${registry}) returned ${response.status}`);
      }

      const data = await response.json();
      if (!data.versions) {
         throw new Error(`Invalid response from ${registry}`);
      }

      return Object.keys(data.versions);
    } catch (error: any) {
      clearTimeout(timeoutId);
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
  return new Promise((resolve, reject) => {
    const versions: string[] = [];
    // Bun.spawn or child_process.spawn can be used. using Bun.spawn for native feel if possible, 
    // but child_process is more standard for the 'api' module if we want to keep it generic.
    // Let's use Bun.spawn since we are in a Bun environment.
    
    // Check if git exists first? 
    // We'll just try running it and catch error.
    
    try {
      const proc = Bun.spawn(['git', 'ls-remote', '--tags', 'https://github.com/oven-sh/bun.git'], {
        stdout: 'pipe',
        stderr: 'pipe', // capture stderr to avoid polluting console
      });

      const timeout = setTimeout(() => {
        proc.kill();
        reject(new Error('Git operation timed out'));
      }, 10000); // 10s timeout for git

      const stream = new Response(proc.stdout);
      stream.text().then(text => {
        clearTimeout(timeout);
        // Output format: <hash>\trefs/tags/bun-v1.0.0
        const lines = text.split('\n');
        for (const line of lines) {
          const match = line.match(/refs\/tags\/bun-v?(\d+\.\d+\.\d+.*)$/);
          if (match) {
             // match[1] is the version part after bun-v or bun-
             // Sometimes tags are just 'bun-v1.0.0', sometimes 'v1.0.0' (rare for bun)
             // Bun uses 'bun-vX.Y.Z' convention usually.
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
 * Main function to get versions. Tries NPM, then falls back to Git.
 */
export async function fetchBunVersions(): Promise<string[]> {
  // Strategy 1: NPM
  try {
    const versions = await fetchBunVersionsFromNpm();
    return versions;
  } catch (npmError: any) {
    // Strategy 2: Git
    try {
      const versions = await fetchBunVersionsFromGit();
      if (versions.length > 0) return versions;
      throw new Error('No versions found via Git');
    } catch (gitError: any) {
      throw new Error(`Failed to fetch versions. NPM: ${npmError.message}. Git: ${gitError.message}`);
    }
  }
}

/**
 * Finds the download URL for a specific Bun version and platform.
 * @param version The target Bun version (e.g., "1.0.0", "latest").
 * @returns The download URL and the exact version found.
 */
export async function findBunDownloadUrl(targetVersion: string): Promise<{ url: string; foundVersion: string } | null> {
  let versions: string[];
  try {
    versions = await fetchBunVersions();
  } catch (error) {
    console.error(chalk.red('Error fetching version list.'));
    // Fallback: If strict version requested, try blindly constructing URL
    if (targetVersion !== 'latest' && semver.valid(targetVersion)) {
        console.warn(chalk.yellow(`Attempting to install ${targetVersion} blindly...`));
        versions = [targetVersion];
    } else {
        throw error;
    }
  }

  let foundVersion: string | undefined;

  if (targetVersion === 'latest') {
    const validVersions = versions.filter(v => semver.valid(v) && !semver.prerelease(v));
    validVersions.sort(semver.rcompare);
    foundVersion = validVersions[0];
  } else {
    const normalizedTarget = normalizeVersion(targetVersion).replace(/^v/, ''); // clean for comparison
    
    // 1. Exact match search
    if (versions.includes(normalizedTarget)) {
        foundVersion = normalizedTarget;
    } 
    // 2. Semver range search
    else if (semver.validRange(normalizedTarget)) {
      const validVersions = versions.filter(v => semver.satisfies(v, normalizedTarget));
      validVersions.sort(semver.rcompare);
      foundVersion = validVersions[0];
    }
    // 3. Fallback for explicit request if not found in list (maybe new version not yet in npm/git list?)
    else if (semver.valid(normalizedTarget)) {
       foundVersion = normalizedTarget;
    }
  }

  if (!foundVersion) {
    return null;
  }

  // Construct GitHub Download URL
  // Format: https://github.com/oven-sh/bun/releases/download/bun-v{version}/bun-{platform}-{arch}.zip
  const tagName = `bun-v${foundVersion}`;
  const assetName = getBunAssetName(foundVersion);
  
  let baseUrl = 'https://github.com';
  const mirror = process.env.BVM_GITHUB_MIRROR;
  
  if (mirror) {
      // If mirror allows full url appending (like ghproxy), we prepend.
      // If mirror is a direct replacement for github.com, we replace.
      // Common pattern: https://mirror.ghproxy.com/https://github.com/...
      // Or: https://npmmirror.com/mirrors/bun/... (if exists, but bun binaries aren't usually there)
      
      // Let's assume the user provides a prefix that handles the full URL or simply prepends.
      // Simple usage: BVM_GITHUB_MIRROR=https://mirror.ghproxy.com/
      
      // Remove trailing slash from mirror if exists
      const cleanMirror = mirror.endsWith('/') ? mirror.slice(0, -1) : mirror;
      
      // If the mirror acts as a proxy for the full URL
      baseUrl = `${cleanMirror}/https://github.com`;
  } else if (isChina()) {
      console.log(chalk.gray('Tip: Set BVM_GITHUB_MIRROR="https://mirror.ghproxy.com/" to accelerate downloads in China.'));
  }

  const url = `${baseUrl}/oven-sh/bun/releases/download/${tagName}/${assetName}`;

  return { url, foundVersion: `v${foundVersion}` };
}



