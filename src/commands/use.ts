import { join } from 'path';
import { BVM_BIN_DIR, BVM_VERSIONS_DIR, EXECUTABLE_NAME } from '../constants';
import { createSymlink, ensureDir, pathExists, normalizeVersion, resolveVersion, getInstalledVersions } from '../utils';
import { colors } from '../utils/ui';
import { getRcVersion } from '../rc';
import { resolveLocalVersion } from './version';
import { withSpinner } from '../command-runner';

/**
 * Switches to a specific Bun version.
 * @param targetVersion The version to use (e.g., "1.0.0"). Optional if .bvmrc exists.
 * @param options Configuration options
 */
export async function useBunVersion(targetVersion?: string, options: { silent?: boolean } = {}): Promise<void> {
  let versionToUse = targetVersion;

  if (!versionToUse) {
    versionToUse = await getRcVersion() || undefined;
    if (versionToUse && !options.silent) {
        console.log(colors.dim(`Found '.bvmrc' with version <${versionToUse}>`));
    }
  }

  if (!versionToUse) {
    if (!options.silent) {
        console.error(colors.red('No version specified and no .bvmrc found. Usage: bvm use <version>'));
    }
    throw new Error('No version specified and no .bvmrc found.');
  }

  const runLogic = async (spinner?: any) => {
      let finalResolvedVersion: string | null = null;

    // First, try resolving using resolveLocalVersion (handles aliases, 'current', 'latest' from installed)
    const resolvedFromLocal = await resolveLocalVersion(versionToUse!);
    if (resolvedFromLocal) {
        finalResolvedVersion = resolvedFromLocal;
    } else {
        // If not resolved by resolveLocalVersion, then try fuzzy matching against installed versions
        const installedVersions = (await getInstalledVersions()).map(v => normalizeVersion(v));
        finalResolvedVersion = resolveVersion(versionToUse!, installedVersions);
    }

    if (!finalResolvedVersion) {
      const installed = (await getInstalledVersions()).map(v => normalizeVersion(v));
      if (!options.silent) {
        console.log(colors.cyan(`Available installed versions: ${installed.length > 0 ? installed.join(', ') : 'None'}`));
      }
      throw new Error(`Bun version '${versionToUse}' is not installed or cannot be resolved.`);
    }

    // Use the final resolved version from now on
    const normalizedFinalResolvedVersion = normalizeVersion(finalResolvedVersion); // Normalize the resolved version

    // 1. Check if the version is installed locally
    const installPath = join(BVM_VERSIONS_DIR, normalizedFinalResolvedVersion);
    const installBinPath = join(installPath, 'bin');
    const bunExecutablePath = join(installBinPath, EXECUTABLE_NAME);

    // Auto-migration: If old structure exists (bun in root), move to new structure (bun in bin/)
    const oldExecutablePath = join(installPath, EXECUTABLE_NAME);
    if (!(await pathExists(bunExecutablePath)) && (await pathExists(oldExecutablePath))) {
        if (!options.silent) {
            console.log(colors.dim(`Migrating ${finalResolvedVersion} to new directory structure...`));
        }
        await ensureDir(installBinPath);
        const { rename } = require('node:fs/promises');
        await rename(oldExecutablePath, bunExecutablePath);
    }

    if (!(await pathExists(bunExecutablePath))) {
      const errorMsg = `Resolved version ${finalResolvedVersion} is not installed correctly (missing binary in bin/).`;
      if (spinner) spinner.fail(colors.red(errorMsg));
      throw new Error(errorMsg);
    }

    // 2. Create/update the symlinks
    await ensureDir(BVM_BIN_DIR); // Ensure the manager bin directory exists
    
    // Update directory symlink (~/.bvm/current -> ~/.bvm/versions/vX.Y.Z)
    const { BVM_CURRENT_DIR } = require('../constants');
    await createSymlink(installPath, BVM_CURRENT_DIR);

    // Update single binary symlink for convenience (~/.bvm/bin/bun -> ~/.bvm/current/bin/bun)
    // Note: We point to the symlink directory to make it doubly dynamic
    await createSymlink(join(BVM_CURRENT_DIR, 'bin', EXECUTABLE_NAME), join(BVM_BIN_DIR, EXECUTABLE_NAME));

    if (spinner) {
        spinner.succeed(colors.green(`Bun ${finalResolvedVersion} is now active.`));
    }
  };

  if (options.silent) {
      await runLogic();
  } else {
      await withSpinner(
        `Attempting to use Bun ${versionToUse}...`,
        (spinner) => runLogic(spinner),
        { failMessage: () => `Failed to use Bun ${versionToUse}` },
      );
  }
}
