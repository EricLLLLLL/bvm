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

    // 2. Check if the version is currently active
    let currentVersionName: string | null = null;
    try {
      if (await pathExists(BVM_CURRENT_DIR)) {
        const realPath = await realpath(BVM_CURRENT_DIR);
        currentVersionName = normalizeVersion(basename(realPath));
      }
    } catch (error: any) {
      // Ignore
    }

    if (currentVersionName === normalizedTargetVersion) {
      throw new Error(`Bun ${targetVersion} is currently active. Please use 'bvm use <another-version>' or 'bvm deactivate' before uninstalling.`);
    }

    // 3. Remove the version directory
    await removeDir(installPath);
      spinner.succeed(colors.green(`Bun ${normalizedTargetVersion} uninstalled successfully.`));
    },
    { failMessage: `Failed to uninstall Bun ${targetVersion}` },
  );
}
