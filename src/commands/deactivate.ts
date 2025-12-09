import { unlink } from 'fs/promises';
import { BVM_CURRENT_BUN_PATH } from '../constants';
import { pathExists } from '../utils';
import chalk from 'chalk';
import ora from 'ora';

export async function deactivate(): Promise<void> {
  const spinner = ora('Deactivating current Bun version...').start();
  try {
    if (await pathExists(BVM_CURRENT_BUN_PATH)) {
      await unlink(BVM_CURRENT_BUN_PATH);
      spinner.succeed(chalk.green('Current Bun version deactivated.'));
      console.log(chalk.gray(`Path ${BVM_CURRENT_BUN_PATH} has been removed.`));
    } else {
      spinner.info('No Bun version is currently active via bvm.');
    }
  } catch (error: any) {
    spinner.fail(chalk.red(`Failed to deactivate: ${error.message}`));
  }
}
