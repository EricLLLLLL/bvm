import { colors } from '../utils/ui';
import { getInstalledVersions, normalizeVersion, readDir, pathExists, readTextFile, getActiveVersion } from '../utils';
import { BVM_ALIAS_DIR } from '../constants';
import { join } from 'path';
import { withSpinner } from '../command-runner';

/**
 * Lists all locally installed Bun versions and configured aliases.
 */
export async function listLocalVersions(): Promise<void> {
  await withSpinner(
    'Fetching locally installed Bun versions...', 
    async (spinner) => {
      const installedVersions = await getInstalledVersions(); // Returns normalized 'vX.Y.Z'
      
      const activeInfo = await getActiveVersion();
      const currentVersion = activeInfo.version;

      spinner.succeed(colors.green('Locally installed Bun versions:'));

    // Display installed versions
    if (installedVersions.length === 0) {
      console.log('  (No versions installed yet)');
    } else {
      installedVersions.forEach(version => {
        if (version === currentVersion) {
          console.log(`* ${colors.green(version)} ${colors.dim('(current)')}`);
        } else {
          console.log(`  ${version}`);
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
                try {
                    const aliasTargetVersion = (await readTextFile(join(BVM_ALIAS_DIR, aliasName))).trim();
                    const normalizedAliasTarget = normalizeVersion(aliasTargetVersion);
                    
                    let aliasStatus = `-> ${colors.cyan(normalizedAliasTarget)}`;
                    if (normalizedAliasTarget === currentVersion) {
                        aliasStatus += ` ${colors.dim('(current)')}`;
                    }
                    console.log(`  ${aliasName} ${colors.gray(aliasStatus)}`);
                } catch (e) {
                    // Skip invalid aliases
                }
            }
        }
    }

    },
    { failMessage: 'Failed to list local Bun versions' },
  );
}