import { join } from 'path';
import { BVM_VERSIONS_DIR, EXECUTABLE_NAME, BVM_CURRENT_DIR } from '../constants';
import { ensureDir, pathExists, normalizeVersion, resolveVersion, getInstalledVersions, createSymlink } from '../utils';
import { colors } from '../utils/ui';
import { getRcVersion } from '../rc';
import { resolveLocalVersion } from './version';
import { withSpinner } from '../command-runner';

/**
 * Switches the active Bun version immediately by updating the `current` symlink.
 * @param targetVersion The version to use (e.g., "1.0.0").
 * @param options Configuration options
 */
export async function useBunVersion(targetVersion?: string, options: { silent?: boolean } = {}): Promise<void> {
  let versionToUse = targetVersion;

  if (!versionToUse) {
    versionToUse = await getRcVersion() || undefined;
  }

  if (!versionToUse) {
    if (!options.silent) {
        console.error(colors.red('No version specified. Usage: bvm use <version>'));
    }
    throw new Error('No version specified.');
  }

  const runLogic = async (spinner?: any) => {
    let finalResolvedVersion: string | null = null;

    const resolvedFromLocal = await resolveLocalVersion(versionToUse!);
    if (resolvedFromLocal) {
        finalResolvedVersion = resolvedFromLocal;
    } else {
        const installedVersions = (await getInstalledVersions()).map(v => normalizeVersion(v));
        finalResolvedVersion = resolveVersion(versionToUse!, installedVersions);
    }

    if (!finalResolvedVersion) {
      throw new Error(`Bun version '${versionToUse}' is not installed.`);
    }

    const normalizedFinalResolvedVersion = normalizeVersion(finalResolvedVersion);
    const installPath = join(BVM_VERSIONS_DIR, normalizedFinalResolvedVersion);
    const bunExecutablePath = join(installPath, 'bin', EXECUTABLE_NAME);
    
    // Validate installation
    if (!(await pathExists(bunExecutablePath))) {
        throw new Error(`Version ${normalizedFinalResolvedVersion} is not properly installed (binary missing).`);
    }

    // Update the 'current' directory symlink for immediate global effect
    await createSymlink(installPath, BVM_CURRENT_DIR);

    if (spinner) {
        spinner.succeed(colors.green(`Now using Bun ${normalizedFinalResolvedVersion} (immediate effect).`));
    }
  };

  if (options.silent) {
      await runLogic();
  } else {
      await withSpinner(
        `Switching to Bun ${versionToUse}...`,
        (spinner) => runLogic(spinner),
        { failMessage: () => `Failed to switch to Bun ${versionToUse}` },
      );
  }
}
