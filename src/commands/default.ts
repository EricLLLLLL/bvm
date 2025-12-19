import { colors } from '../utils/ui';
import { join } from 'path';
import { BVM_ALIAS_DIR } from '../constants';
import { pathExists, readTextFile, normalizeVersion, getInstalledVersions, resolveVersion } from '../utils';
import { withSpinner } from '../command-runner';
import { createAlias } from './alias';
import { rehash } from './rehash'; // Rehash after setting default

/**
 * Manages the global default Bun version.
 * - Displays the current default if no version is provided.
 * - Sets a new default if a version is provided.
 */
export async function defaultBunVersion(targetVersion?: string): Promise<void> {
  const defaultAliasPath = join(BVM_ALIAS_DIR, 'default');

  if (!targetVersion) {
    // Display current default
    await withSpinner(
      'Checking current default Bun version...',
      async (spinner) => {
        if (await pathExists(defaultAliasPath)) {
          const defaultVer = await readTextFile(defaultAliasPath);
          spinner.succeed(colors.green(`Default Bun version: ${normalizeVersion(defaultVer.trim())}`));
        } else {
          spinner.info(colors.blue('No global default Bun version is set.'));
          console.log(colors.yellow(`Use 'bvm default <version>' to set one.`));
        }
      },
      { failMessage: 'Failed to retrieve default Bun version' },
    );
  } else {
    // Set new default
    await withSpinner(
      `Setting global default to Bun ${targetVersion}...`,
      async (spinner) => {
        const installedVersions = (await getInstalledVersions()).map(v => normalizeVersion(v));
        const finalResolvedVersion = resolveVersion(targetVersion, installedVersions);

        if (!finalResolvedVersion) {
          throw new Error(`Bun version '${targetVersion}' is not installed.`);
        }

        await createAlias('default', finalResolvedVersion);
        spinner.succeed(colors.green(`✓ Default set to ${finalResolvedVersion}. New terminals will now start with this version.`));
        await rehash(); // Rehash after setting default
      },
      { failMessage: `Failed to set global default to Bun ${targetVersion}` },
    );
  }
}