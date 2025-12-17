import { BVM_CACHE_DIR } from '../constants';
import { removeDir, ensureDir } from '../utils';
import { colors } from '../utils/ui';
import { withSpinner } from '../command-runner';

export async function cacheCommand(action: string): Promise<void> {
  if (action === 'dir') {
    console.log(BVM_CACHE_DIR);
    return;
  }

  if (action === 'clear') {
    await withSpinner(
      'Clearing cache...',
      async (spinner) => {
        await removeDir(BVM_CACHE_DIR);
        await ensureDir(BVM_CACHE_DIR);
        spinner.succeed(colors.green('Cache cleared.'));
      },
      { failMessage: 'Failed to clear cache' },
    );
    return;
  }

  console.error(colors.red(`Unknown cache command: ${action}`));
  console.log('Usage: bvm cache dir | bvm cache clear');
}
