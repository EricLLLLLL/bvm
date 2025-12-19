import { colors } from '../utils/ui';
import { join, basename } from 'path';
import { BVM_VERSIONS_DIR, EXECUTABLE_NAME, BVM_ALIAS_DIR, BVM_SHIMS_DIR, BVM_CURRENT_DIR } from '../constants';
import { pathExists, removeDir, normalizeVersion, readTextFile, getSymlinkTarget } from '../utils';
import { realpath, unlink } from 'fs/promises';
import { withSpinner } from '../command-runner';
import { rehash } from './rehash';

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
            const defaultVer = (await readTextFile(defaultPath)).trim();
            if (normalizeVersion(defaultVer) === normalizedTargetVersion) {
                isDefault = true;
            }
        }
    } catch (e) {}

    if (isDefault) {
      console.log(colors.yellow(`Hint: Set a new default using 'bvm default <new_version>'`));
      throw new Error(`Bun ${targetVersion} is currently set as default. Please set another default before uninstalling.`);
    }

    // 3. Check if it's the current active version (symlink) and remove it if so
    try {
        const currentLinkTarget = await getSymlinkTarget(BVM_CURRENT_DIR);
        if (currentLinkTarget) {
            const targetBasename = normalizeVersion(basename(currentLinkTarget));
            if (targetBasename === normalizedTargetVersion) {
                await unlink(BVM_CURRENT_DIR);
            }
        }
    } catch (e) {
        // Ignore errors checking current symlink
    }

    // 4. Remove the version directory
    await removeDir(installPath);
      spinner.succeed(colors.green(`Bun ${normalizedTargetVersion} uninstalled successfully.`));
      
      // Rehash after uninstall to remove stale shims
      await rehash();
    },
    { failMessage: `Failed to uninstall Bun ${targetVersion}` },
  );
}
