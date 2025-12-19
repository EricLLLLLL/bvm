import { join } from 'path';
import { BVM_VERSIONS_DIR, BVM_CURRENT_BUN_PATH, EXECUTABLE_NAME, BVM_CURRENT_DIR } from '../constants';
import { pathExists, normalizeVersion } from '../utils';
import { getRcVersion } from '../rc';
import { readlink, realpath } from 'fs/promises';
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
      if (!targetVersion || targetVersion === 'current') {
        if (await pathExists(BVM_CURRENT_DIR)) {
          try {
            const { realpath } = require('node:fs/promises');
            const realPath = await realpath(BVM_CURRENT_DIR);
            console.log(join(realPath, 'bin', EXECUTABLE_NAME));
          } catch {
            throw new Error('Unable to resolve current Bun path.');
          }
        } else {
          throw new Error('No active Bun version found (system version is not managed by bvm).');
        }
        return;
      }

      const { resolveLocalVersion } = require('./version');
      let resolvedVersion = await resolveLocalVersion(targetVersion);
      if (!resolvedVersion) {
          resolvedVersion = normalizeVersion(targetVersion);
      }

      const binPath = join(BVM_VERSIONS_DIR, resolvedVersion, 'bin', EXECUTABLE_NAME);

      if (await pathExists(binPath)) {
        console.log(binPath);
      } else {
        throw new Error(`Bun ${targetVersion} (${resolvedVersion}) is not installed.`);
      }
    },
    { failMessage: 'Failed to resolve Bun path' },
  );
}
