import { join } from 'path';
import { BVM_VERSIONS_DIR, BVM_CURRENT_BUN_PATH, EXECUTABLE_NAME } from '../constants';
import { pathExists, normalizeVersion } from '../utils';
import { getRcVersion } from '../rc';
import { readlink } from 'fs/promises';
import chalk from 'chalk';

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

  // 2. If still no version (and asking for 'current' implicitly), check active symlink
  if (!targetVersion || targetVersion === 'current') {
    if (await pathExists(BVM_CURRENT_BUN_PATH)) {
        try {
            const realPath = await readlink(BVM_CURRENT_BUN_PATH);
            console.log(realPath);
            return;
        } catch (e) {
            // ignore
        }
    } else {
        console.error(chalk.red('No active Bun version found (system version is not managed by bvm).'));
    }
    return;
  }
  
  // 3. Look up specific version
  const normalized = normalizeVersion(targetVersion);
  const binPath = join(BVM_VERSIONS_DIR, normalized, EXECUTABLE_NAME);

  if (await pathExists(binPath)) {
    console.log(binPath);
  } else {
    console.log(chalk.red(`Bun ${targetVersion} (${normalized}) is not installed.`));
    // Check if it's an alias? (Not fully implemented yet, but good to have)
  }
}
