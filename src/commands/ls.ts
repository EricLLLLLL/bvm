import { colors } from '../utils/ui';
import { getInstalledVersions, normalizeVersion, readDir, pathExists, readTextFile, getActiveVersion } from '../utils';
import { BVM_ALIAS_DIR } from '../constants';
import { readlink, realpath } from 'fs/promises';
import { join, basename } from 'path';
import { withSpinner } from '../command-runner';

/**
 * Lists all locally installed Bun versions and configured aliases.
 */
export async function listLocalVersions(): Promise<void> {
  await withSpinner(
    'Fetching locally installed Bun versions...',
    async (spinner) => {
      const installedVersions = await getInstalledVersions(); // Returns normalized 'vX.Y.Z'
      let currentVersion: string | null = null; // Normalized 'vX.Y.Z'

    // Determine the currently active version
    const activeInfo = await getActiveVersion();
    currentVersion = activeInfo.version;

      spinner.succeed(colors.green('Locally installed Bun versions:'));

    // Display installed versions
    if (installedVersions.length === 0) {
      console.log('  (No versions installed yet)');
    } else {
      installedVersions.forEach(version => {
        const displayVersion = version; 
        if (displayVersion === currentVersion) {
          console.log(`* ${colors.green(displayVersion)} ${colors.dim('(current)')}`);
        } else {
          console.log(`  ${displayVersion}`);
        }
      });
    }

    // Display aliases
    const aliasDirExists = await pathExists(BVM_ALIAS_DIR);
    if (aliasDirExists) {
        const aliasFiles = await readDir(BVM_ALIAS_DIR);
        if (aliasFiles.length > 0) {
            console.log(colors.green('\nAliases:'));
            for (const aliasName of aliasFiles) {
                const aliasTargetVersion = (await readTextFile(join(BVM_ALIAS_DIR, aliasName))).trim();
                const normalizedAliasTarget = normalizeVersion(aliasTargetVersion);
                
                let aliasStatus = `-> ${colors.cyan(normalizedAliasTarget)}`;
                if (normalizedAliasTarget === currentVersion) {
                    aliasStatus += ` ${colors.dim('(current)')}`;
                }
                console.log(`  ${aliasName} ${colors.gray(aliasStatus)}`);
            }
        }
    }

    },
    { failMessage: 'Failed to list local Bun versions' },
  );
}
