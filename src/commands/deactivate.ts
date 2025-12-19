import { unlink } from 'fs/promises';
import { BVM_ALIAS_DIR } from '../constants';
import { pathExists } from '../utils';
import { colors } from '../utils/ui';
import { withSpinner } from '../command-runner';
import { join } from 'path';
import { rehash } from './rehash'; // New import

export async function deactivate(): Promise<void> {
  await withSpinner(
    'Deactivating current Bun version...',
    async (spinner) => {
      const defaultAliasPath = join(BVM_ALIAS_DIR, 'default');
      
      if (await pathExists(defaultAliasPath)) {
        await unlink(defaultAliasPath);
        spinner.succeed(colors.green('Default Bun version deactivated.'));
        console.log(colors.gray('Run `bvm use <version>` to reactivate.'));
        await rehash(); // Rehash to clean up any potentially stale shims if the default changed context
      } else {
        spinner.info('No default Bun version is currently active.');
      }
    },
    { failMessage: 'Failed to deactivate' },
  );
}
