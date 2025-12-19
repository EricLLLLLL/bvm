import { colors } from '../utils/ui';
import { join, basename } from 'path';
import { BVM_VERSIONS_DIR, BVM_CURRENT_BUN_PATH, EXECUTABLE_NAME, BVM_CURRENT_DIR } from '../constants';
import { pathExists, removeDir, normalizeVersion } from '../utils';
import { readlink, realpath } from 'fs/promises';
import { withSpinner } from '../command-runner';

/**
 * Uninstalls a specific Bun version.
 * @param targetVersion The version to uninstall (e.g., "1.0.0").
 */
export async function uninstallBunVersion(targetVersion: string): Promise<void> {
  await withSpinner(
    `Attempting to uninstall Bun ${targetVersion}...`,
    async (spinner) => {
      const normalizedTargetVersion = normalizeVersion(targetVersion);
      const installPath = join(BVM_VERSIONS_DIR, normalizedTargetVersion);
      const bunExecutablePath = join(installPath, 'bin', EXECUTABLE_NAME);

      // 1. Check if the version is installed locally
      if (!(await pathExists(bunExecutablePath))) {
        throw new Error(`Bun ${targetVersion} is not installed.`);
      }

    // 2. Check if the version is currently active (default)
    // In Shim architecture, we check if it matches the default alias
    let isDefault = false;
    try {
        const { BVM_ALIAS_DIR } = require('../constants');
        const { readFile } = require('fs/promises');
        const defaultPath = join(BVM_ALIAS_DIR, 'default');
        if (await pathExists(defaultPath)) {
            const defaultVer = (await readFile(defaultPath, 'utf8')).trim();
            if (normalizeVersion(defaultVer) === normalizedTargetVersion) {
                isDefault = true;
            }
        }
    } catch (e) {}

    if (isDefault) {
      throw new Error(`Bun ${targetVersion} is currently set as default. Please set another default before uninstalling.`);
    }

    // 3. Remove the version directory
    await removeDir(installPath);
      spinner.succeed(colors.green(`Bun ${normalizedTargetVersion} uninstalled successfully.`));
    },
    { failMessage: `Failed to uninstall Bun ${targetVersion}` },
  );
}
