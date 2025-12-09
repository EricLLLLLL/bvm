import ora from 'ora';
import chalk from 'chalk';
import { join } from 'path';
import { BVM_VERSIONS_DIR, BVM_CURRENT_BUN_PATH, EXECUTABLE_NAME } from '../constants';
import { pathExists, removeDir, normalizeVersion } from '../utils';
import { readlink } from 'fs/promises';

/**
 * Uninstalls a specific Bun version.
 * @param targetVersion The version to uninstall (e.g., "1.0.0").
 */
export async function uninstallBunVersion(targetVersion: string): Promise<void> {
  const spinner = ora(`Attempting to uninstall Bun ${targetVersion}...`).start();
  try {
    const normalizedTargetVersion = normalizeVersion(targetVersion);
    const installPath = join(BVM_VERSIONS_DIR, normalizedTargetVersion);
    const bunExecutablePath = join(installPath, EXECUTABLE_NAME);

    // 1. Check if the version is installed locally
    if (!(await pathExists(bunExecutablePath))) {
      spinner.fail(chalk.red(`Bun ${targetVersion} is not installed.`));
      process.exit(1);
    }

    // 2. Check if the version is currently active
    let currentVersionPath: string | null = null;
    try {
      currentVersionPath = await readlink(BVM_CURRENT_BUN_PATH);
    } catch (error: any) {
      if (error.code !== 'ENOENT' && error.code !== 'EINVAL') {
        throw error;
      }
    }

    if (currentVersionPath && currentVersionPath.startsWith(installPath)) {
      spinner.fail(chalk.red(`Bun ${targetVersion} is currently active. Please use 'bvm use <another-version>' or 'bvm deactivate' before uninstalling.`));
      process.exit(1);
    }

    // 3. Remove the version directory
    await removeDir(installPath);
    spinner.succeed(chalk.green(`Bun ${normalizedTargetVersion} uninstalled successfully.`));

  } catch (error: any) {
    spinner.fail(chalk.red(`Failed to uninstall Bun ${targetVersion}: ${error.message}`));
    console.error(error);
    process.exit(1);
  }
}
