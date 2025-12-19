import { colors } from '../utils/ui';
import { BVM_ALIAS_DIR } from '../constants';
import { pathExists, readTextFile, normalizeVersion } from '../utils';
import { withSpinner } from '../command-runner';
import { join } from 'path';

/**
 * Displays the currently active Bun version.
 * Prioritizes: Env > .bvmrc > default alias.
 */
export async function displayCurrentVersion(): Promise<void> {
  await withSpinner(
    'Checking current Bun version...',
    async (spinner) => {
      let currentVersion: string | null = null;
      let source = '';

      // 1. Env Variable
      if (process.env.BVM_ACTIVE_VERSION) {
        currentVersion = normalizeVersion(process.env.BVM_ACTIVE_VERSION);
        source = 'env';
      } 
      // 2. .bvmrc
      else {
        // TODO: Recursive check not fully implemented here for simplicity in TS, 
        // but checking CWD is a good start.
        const rcPath = join(process.cwd(), '.bvmrc');
        if (await pathExists(rcPath)) {
            const rcContent = await readTextFile(rcPath);
            currentVersion = normalizeVersion(rcContent.trim());
            source = '.bvmrc';
        }
        // 3. Default Alias
        else {
            const defaultPath = join(BVM_ALIAS_DIR, 'default');
            if (await pathExists(defaultPath)) {
                const defaultVer = await readTextFile(defaultPath);
                currentVersion = normalizeVersion(defaultVer.trim());
                source = 'default';
            }
        }
      }

      if (currentVersion) {
        spinner.succeed(colors.green(`Current Bun version: ${currentVersion} (${source})`));
      } else {
        spinner.info(colors.blue('No Bun version is currently active.'));
        console.log(colors.yellow(`Use 'bvm use <version>' to set a default, or create a .bvmrc file.`));
      }
    },
    { failMessage: 'Failed to determine current Bun version' },
  );
}
