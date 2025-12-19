import { join } from 'path';
import { BVM_VERSIONS_DIR, EXECUTABLE_NAME, BVM_SHIMS_DIR, BVM_ALIAS_DIR } from '../constants';
import { pathExists, normalizeVersion, getActiveVersion, readTextFile } from '../utils';
import { getRcVersion } from '../rc';
import { realpath } from 'fs/promises';
import { withSpinner } from '../command-runner';
import { resolveLocalVersion } from './version';

/**
 * Displays the path to the real binary for a specific command or version.
 * Usage:
 *   bvm which           -> Path to current bun
 *   bvm which 1.0.0     -> Path to bun v1.0.0
 *   bvm which yarn      -> Path to yarn in current bun version
 */
export async function whichBunVersion(target?: string): Promise<void> {
  await withSpinner(
    `Resolving path...`,
    async () => {
      let resolvedVersion: string | null = null;
      let command = 'bun';

      const { version: currentVersion } = await getActiveVersion();

      if (!target || target === 'current') {
          // Case: bvm which
          resolvedVersion = currentVersion;
          if (!resolvedVersion) throw new Error('No active Bun version found.');
      } else {
          // Case: bvm which 1.0.0 OR bvm which yarn
          const { resolveLocalVersion } = await import('./version');
          resolvedVersion = await resolveLocalVersion(target);
          
          if (!resolvedVersion) {
              // If it's not a version/alias, it might be a command name (like 'yarn')
              if (currentVersion) {
                  resolvedVersion = currentVersion;
                  command = target;
              } else {
                  throw new Error(`Bun version or command '${target}' not found.`);
              }
          }
      }

      const binPath = join(BVM_VERSIONS_DIR, resolvedVersion, 'bin', command === 'bun' ? EXECUTABLE_NAME : command);

      if (await pathExists(binPath)) {
        console.log(binPath);
      } else {
        throw new Error(`Command '${command}' not found in Bun ${resolvedVersion}.`);
      }
    },
    { failMessage: 'Failed to resolve path' },
  );
}
