import { colors } from '../utils/ui';
import { join } from 'path';
import { BVM_VERSIONS_DIR, EXECUTABLE_NAME, BVM_ALIAS_DIR } from '../constants';
import { pathExists, removeDir, normalizeVersion, readTextFile } from '../utils';
import { withSpinner } from '../command-runner';
import { rehash } from './rehash'; // New import

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

    // 2. Check if the version is currently set as default
    let isDefault = false;
    try {
        const defaultPath = join(BVM_ALIAS_DIR, 'default');
        if (await pathExists(defaultPath)) {
            const defaultVer = await readTextFile(defaultPath);
            if (normalizeVersion(defaultVer) === normalizedTargetVersion) {
                isDefault = true;
            }
        }
    } catch (e) {}

    if (isDefault) {
      console.log(colors.yellow(`Hint: Set a new default using 'bvm default <new_version>'`));
      throw new Error(`Bun ${targetVersion} is currently set as default. Please set another default before uninstalling.`);
    }

    // 3. Remove the version directory
    await removeDir(installPath);
      spinner.succeed(colors.green(`Bun ${normalizedTargetVersion} uninstalled successfully.`));
      
      // Rehash after uninstall to remove stale shims
      await rehash();
    },
    { failMessage: `Failed to uninstall Bun ${targetVersion}` },
  );
}
