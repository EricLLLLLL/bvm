import { colors } from '../utils/ui';
import { join } from 'path';
import { BVM_ALIAS_DIR, BVM_VERSIONS_DIR } from '../constants';
import { ensureDir, pathExists, normalizeVersion, writeTextFile, readTextFile, resolveVersion } from '../utils';
import { resolveLocalVersion } from './version';
import { withSpinner } from '../command-runner';

/**
 * Creates an alias for a Bun version.
 * @param aliasName The name of the alias (e.g., "default", "lts").
 * @param targetVersion The Bun version to alias (e.g., "1.0.0", "latest").
 * @param options Configuration options
 */
export async function createAlias(aliasName: string, targetVersion: string, options: { silent?: boolean } = {}): Promise<void> {
  const runLogic = async (spinner?: any) => {
      // Resolve the target version to a concrete installed version
      const resolvedVersion = await resolveLocalVersion(targetVersion);
      
      if (!resolvedVersion) {
        if (!options.silent) {
            console.log(colors.blue(`Please install Bun ${targetVersion} first using: bvm install ${targetVersion}`));
        }
        throw new Error(`Bun version '${targetVersion}' is not installed. Cannot create alias.`);
      }

      // Check if the target version is actually installed
      const versionPath = join(BVM_VERSIONS_DIR, resolvedVersion);
      if (!(await pathExists(versionPath))) {
        throw new Error(`Internal Error: Resolved Bun version ${resolvedVersion} not found.`);
      }

      // Ensure alias directory exists
      await ensureDir(BVM_ALIAS_DIR);

    // Alias specific logic
    const aliasFilePath = join(BVM_ALIAS_DIR, aliasName);
    
    // Rule: 'default' can always be overwritten. Other aliases cannot be created if they exist.
    if (aliasName !== 'default' && (await pathExists(aliasFilePath))) {
        throw new Error(`Alias '${aliasName}' already exists. Use 'bvm alias ${aliasName} <new-version>' to update or 'bvm unalias ${aliasName}' to remove.`);
    }

    // Write the alias file
    await writeTextFile(aliasFilePath, `${resolvedVersion}\n`);

      if (spinner) {
        spinner.succeed(colors.green(`Alias '${aliasName}' created for Bun ${resolvedVersion}.`));
      }
  };

  if (options.silent) {
      await runLogic();
  } else {
      await withSpinner(
        `Creating alias '${aliasName}' for Bun ${targetVersion}...`,
        (spinner) => runLogic(spinner),
        { failMessage: `Failed to create alias '${aliasName}'` },
      );
  }
}
