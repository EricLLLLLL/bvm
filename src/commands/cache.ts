import { BVM_CACHE_DIR } from '../constants';
import { removeDir, ensureDir } from '../utils';
import chalk from 'chalk';
import ora from 'ora';

export async function cacheCommand(action: string): Promise<void> {
  if (action === 'dir') {
    console.log(BVM_CACHE_DIR);
    return;
  }

  if (action === 'clear') {
    const spinner = ora('Clearing cache...').start();
    try {
      await removeDir(BVM_CACHE_DIR);
      // Re-create it empty
      await ensureDir(BVM_CACHE_DIR);
      spinner.succeed(chalk.green('Cache cleared.'));
    } catch (error: any) {
      spinner.fail(chalk.red(`Failed to clear cache: ${error.message}`));
    }
    return;
  }

  console.error(chalk.red(`Unknown cache command: ${action}`));
  console.log('Usage: bvm cache dir | bvm cache clear');
}
