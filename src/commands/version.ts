import { join } from 'path';
import { BVM_ALIAS_DIR, BVM_VERSIONS_DIR } from '../constants';
import { getInstalledVersions, normalizeVersion, pathExists, readTextFile, getActiveVersion, resolveVersion } from '../utils';
import { readlink } from 'fs/promises';
import { maxSatisfying } from '../utils/semver-lite';
import { withSpinner } from '../command-runner';

/**
 * Resolves a version-ish string to an installed version.
 * Supports:
 * - "current" -> currently active version
 * - "default" (or any alias) -> resolved alias
 * - "1.1" -> highest installed satisfying 1.1
 * - "1.1.38" -> exact match
 */
export async function resolveLocalVersion(spec: string): Promise<string | null> {
  // 1. Handle "current"
  if (spec === 'current') {
    const { version } = await getActiveVersion();
    return version;
  }

  // 2. Handle Alias or 'latest'
  if (spec === 'latest') {
      const installed = await getInstalledVersions();
      if (installed.length > 0) {
          // getInstalledVersions returns sorted list (descending)
          return installed[0];
      }
      return null;
  }

  const aliasPath = join(BVM_ALIAS_DIR, spec);
  if (await pathExists(aliasPath)) {
    try {
      const aliasTarget = (await readTextFile(aliasPath)).trim();
      return normalizeVersion(aliasTarget);
    } catch { return null; }
  }


  // 3. Handle Semver / Exact
  const normalizedSpec = normalizeVersion(spec);
  const installed = await getInstalledVersions(); // Returns normalized vX.Y.Z

  // Use the shared resolveVersion utility for consistent behavior
  return resolveVersion(spec, installed);
}

export async function displayVersion(spec: string): Promise<void> {
  await withSpinner(
    `Resolving version '${spec}'...`,
    async () => {
      const version = await resolveLocalVersion(spec);
      if (version) {
        console.log(version);
      } else {
        throw new Error('N/A');
      }
    },
    { failMessage: `Failed to resolve version '${spec}'` },
  );
}
