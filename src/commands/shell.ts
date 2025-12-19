import { colors } from '../utils/ui';
import { normalizeVersion, getInstalledVersions, resolveVersion } from '../utils';
import { withSpinner } from '../command-runner';
import { resolveLocalVersion } from './version';

/**
 * Outputs a command to set the active Bun version for the current shell session.
 * @param targetVersion The version to activate for the session (e.g., "1.0.0", "latest").
 */
export async function shellBunVersion(targetVersion: string): Promise<void> {
  await withSpinner(
    `Resolving session version for Bun ${targetVersion}...`,
    async (spinner) => {
      let finalResolvedVersion: string | null = null;

      // Resolve alias or 'latest' or 'current'
      const resolvedFromLocal = await resolveLocalVersion(targetVersion);
      if (resolvedFromLocal) {
          finalResolvedVersion = resolvedFromLocal;
      } else {
          const installedVersions = (await getInstalledVersions()).map(v => normalizeVersion(v));
          finalResolvedVersion = resolveVersion(targetVersion, installedVersions);
      }

      if (!finalResolvedVersion) {
        throw new Error(`Bun version '${targetVersion}' is not installed or cannot be resolved.`);
      }

      const normalizedFinalResolvedVersion = normalizeVersion(finalResolvedVersion);
      
      // Output the shell command to set BVM_ACTIVE_VERSION
      spinner.succeed(colors.green(`Bun ${normalizedFinalResolvedVersion} will be active in this session.`));
      console.log(`export BVM_ACTIVE_VERSION=${normalizedFinalResolvedVersion}`);
      console.log(colors.dim('Run `eval $(bvm shell <version>)` or `export BVM_ACTIVE_VERSION=...` to activate.'));
    },
    { failMessage: `Failed to set session version for Bun ${targetVersion}` },
  );
}