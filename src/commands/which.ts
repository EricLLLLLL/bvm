import { join } from 'path';
import { BVM_VERSIONS_DIR, EXECUTABLE_NAME } from '../constants';
import { pathExists, normalizeVersion, getActiveVersion } from '../utils';
import { getRcVersion } from '../rc';
import { withSpinner } from '../command-runner';

/**
 * Displays the path to the executable for a specific Bun version.
 * @param version The version to look up. If omitted, uses .bvmrc or current.
 */
export async function whichBunVersion(version?: string): Promise<void> {
  let targetVersion = version;

  // 1. If no version provided, try .bvmrc
  if (!targetVersion) {
    targetVersion = await getRcVersion() || undefined;
  }

  await withSpinner(
    `Resolving Bun path for ${targetVersion || 'current'}...`,
    async () => {
      let resolvedVersion: string | null = null;

      if (!targetVersion || targetVersion === 'current') {
         const activeInfo = await getActiveVersion();
         resolvedVersion = activeInfo.version;
         
         if (!resolvedVersion) {
             throw new Error('No active Bun version found.');
         }
      } else {
          const { resolveLocalVersion } = await import('./version');
          resolvedVersion = await resolveLocalVersion(targetVersion);
          if (!resolvedVersion) {
              resolvedVersion = normalizeVersion(targetVersion);
          }
      }

      const binPath = join(BVM_VERSIONS_DIR, resolvedVersion, 'bin', EXECUTABLE_NAME);

      if (await pathExists(binPath)) {
        console.log(binPath);
      } else {
        throw new Error(`Bun ${targetVersion || 'current'} (${resolvedVersion}) is not installed.`);
      }
    },
    { failMessage: 'Failed to resolve Bun path' },
  );
}
