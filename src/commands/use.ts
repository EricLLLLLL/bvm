import { join } from 'path';
import { BVM_BIN_DIR, BVM_VERSIONS_DIR, EXECUTABLE_NAME } from '../constants';
import { createSymlink, ensureDir, pathExists, normalizeVersion } from '../utils';
import ora from 'ora';
import chalk from 'chalk';
import semver from 'semver';
import { getRcVersion } from '../rc';

/**
 * Switches to a specific Bun version.
 * @param targetVersion The version to use (e.g., "1.0.0"). Optional if .bvmrc exists.
 */
export async function useBunVersion(targetVersion?: string): Promise<void> {
  let versionToUse = targetVersion;

  if (!versionToUse) {
    versionToUse = await getRcVersion() || undefined;
    if (versionToUse) {
        console.log(chalk.blue(`Found '.bvmrc' with version <${versionToUse}>`));
    }
  }

  if (!versionToUse) {
    console.error(chalk.red('No version specified and no .bvmrc found. Usage: bvm use <version>'));
    return;
  }

  const spinner = ora(`Attempting to use Bun ${versionToUse}...`).start();
  try {
    const normalizedTargetVersion = normalizeVersion(versionToUse);

    // 1. Check if the version is installed locally
    const installPath = join(BVM_VERSIONS_DIR, normalizedTargetVersion);
    const bunExecutablePath = join(installPath, EXECUTABLE_NAME);

    if (!(await pathExists(bunExecutablePath))) {
      spinner.fail(chalk.red(`Bun ${versionToUse} is not installed.`));
      console.log(chalk.blue(`You can install it using: bvm install ${versionToUse}`));
      return;
    }

    // 2. Create/update the symlink
    await ensureDir(BVM_BIN_DIR); // Ensure the bin directory exists
    await createSymlink(bunExecutablePath, join(BVM_BIN_DIR, EXECUTABLE_NAME));

    spinner.succeed(chalk.green(`Bun ${normalizedTargetVersion} is now active.`));
    console.log(chalk.yellow(`Remember to add ${BVM_BIN_DIR} to your PATH environment variable to use bvm.`));

  } catch (error: any) {
    spinner.fail(chalk.red(`Failed to use Bun ${versionToUse}: ${error.message}`));
    console.error(error);
  }
}
