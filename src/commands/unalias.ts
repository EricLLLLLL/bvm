import ora from 'ora';
import chalk from 'chalk';
import { join } from 'path';
import { BVM_ALIAS_DIR } from '../constants';
import { pathExists } from '../utils';
import { unlink } from 'fs/promises';

/**
 * Removes an existing alias.
 * @param aliasName The name of the alias to remove.
 */
export async function removeAlias(aliasName: string): Promise<void> {
  const spinner = ora(`Removing alias '${aliasName}'...`).start();
  try {
    const aliasFilePath = join(BVM_ALIAS_DIR, aliasName);

    // 1. Check if the alias file exists
    if (!(await pathExists(aliasFilePath))) {
      spinner.fail(chalk.red(`Alias '${aliasName}' does not exist.`));
      return;
    }

    // 2. Remove the alias file
    await unlink(aliasFilePath);

    spinner.succeed(chalk.green(`Alias '${aliasName}' removed successfully.`));
  } catch (error: any) {
    spinner.fail(chalk.red(`Failed to remove alias '${aliasName}': ${error.message}`));
    console.error(error);
  }
}
