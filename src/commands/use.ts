import { join } from 'path';
import { BVM_VERSIONS_DIR, EXECUTABLE_NAME } from '../constants';
import { ensureDir, pathExists, normalizeVersion, resolveVersion, getInstalledVersions } from '../utils';
import { colors } from '../utils/ui';
import { getRcVersion } from '../rc';
import { resolveLocalVersion } from './version';
import { withSpinner } from '../command-runner';
import { createAlias } from './alias';

/**
 * Switches to a specific Bun version.
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

    // In Shim architecture, 'use' typically sets the global default.
    // If the user wants session-only, they should export BVM_ACTIVE_VERSION.
    // We will set the 'default' alias to this version.
    
    await createAlias('default', normalizedFinalResolvedVersion);

    if (spinner) {
        spinner.succeed(colors.green(`Now using Bun ${normalizedFinalResolvedVersion} (default).`));
        // console.log(colors.dim('To use this version only in this shell, run:'));
        // console.log(colors.cyan(`export BVM_ACTIVE_VERSION=${normalizedFinalResolvedVersion}`));
    }
  };

  if (options.silent) {
      await runLogic();
  } else {
      await withSpinner(
        `Setting default to Bun ${versionToUse}...`,
        (spinner) => runLogic(spinner),
        { failMessage: () => `Failed to use Bun ${versionToUse}` },
      );
  }
}
