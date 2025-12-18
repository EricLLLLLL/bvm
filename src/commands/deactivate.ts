import { unlink } from 'fs/promises';
import { BVM_CURRENT_BUN_PATH, BVM_CURRENT_DIR } from '../constants';
import { pathExists } from '../utils';
import { colors } from '../utils/ui';
import { withSpinner } from '../command-runner';

export async function deactivate(): Promise<void> {
  await withSpinner(
    'Deactivating current Bun version...',
    async (spinner) => {
      let removedAny = false;

      if (await pathExists(BVM_CURRENT_BUN_PATH)) {
        await unlink(BVM_CURRENT_BUN_PATH);
        removedAny = true;
      }

      if (await pathExists(BVM_CURRENT_DIR)) {
        await unlink(BVM_CURRENT_DIR);
        removedAny = true;
      }

      if (removedAny) {
        spinner.succeed(colors.green('Current Bun version deactivated.'));
      } else {
        spinner.info('No Bun version is currently active via bvm.');
      }
    },
    { failMessage: 'Failed to deactivate' },
  );
}
