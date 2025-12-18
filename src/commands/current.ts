import { colors } from '../utils/ui';
import { BVM_CURRENT_BUN_PATH, BVM_CURRENT_DIR } from '../constants';
import { readlink, realpath } from 'fs/promises';
import { normalizeVersion, pathExists } from '../utils';
import { withSpinner } from '../command-runner';
import { basename } from 'path';

/**
 * Displays the currently active Bun version.
 */
export async function displayCurrentVersion(): Promise<void> {
  await withSpinner(
    'Checking current Bun version...',
    async (spinner) => {
      let currentVersion: string | null = null;

      try {
        if (await pathExists(BVM_CURRENT_DIR)) {
          const realPath = await realpath(BVM_CURRENT_DIR);
          currentVersion = normalizeVersion(basename(realPath));
        }
      } catch (error: any) {
        if (error.code === 'ENOENT' || error.code === 'EINVAL') {
          currentVersion = null;
        } else {
          throw error;
        }
      }

      if (currentVersion) {
        spinner.succeed(colors.green(`Current Bun version: ${currentVersion}`));
      } else {
        spinner.info(colors.blue('No Bun version is currently active.'));
        console.log(colors.yellow(`Use 'bvm install <version>' to install a version and 'bvm use <version>' to activate it.`));
      }
    },
    { failMessage: 'Failed to determine current Bun version' },
  );
}
