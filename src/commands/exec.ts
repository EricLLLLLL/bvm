import { colors } from '../utils/ui';
import { join } from 'path';
import { BVM_VERSIONS_DIR, EXECUTABLE_NAME } from '../constants';
import { pathExists, normalizeVersion } from '../utils';
import { resolveLocalVersion } from './version';
import { withSpinner } from '../command-runner';
import { spawn } from 'child_process';

/**
 * Executes a command using a specific Bun version.
 * @param targetVersion The Bun version to use.
 * @param command The command to execute.
 * @param args Additional arguments to pass to the command.
 */
export async function execWithBunVersion(targetVersion: string, command: string, args: string[]): Promise<void> {
  await withSpinner(
    `Preparing to execute with Bun ${targetVersion}...`,
    async (spinner) => {
    // Resolve alias or 'latest' or 'current'
    let resolvedVersion = await resolveLocalVersion(targetVersion);
    
    if (!resolvedVersion) {
        resolvedVersion = normalizeVersion(targetVersion);
    }

    const installPath = join(BVM_VERSIONS_DIR, resolvedVersion);
    const installBinPath = join(installPath, 'bin');
    const bunExecutablePath = join(installBinPath, EXECUTABLE_NAME);

    // Check if the version is installed locally
    if (!(await pathExists(bunExecutablePath))) {
      spinner.fail(colors.red(`Bun ${targetVersion} (resolved: ${resolvedVersion}) is not installed.`));
      console.log(colors.yellow(`You can install it using: bvm install ${targetVersion}`));
      return;
    }

    spinner.stop();

    // Execute the command with the specified Bun version in PATH
    const env = {
      ...process.env,
      PATH: `${installBinPath}${process.platform === 'win32' ? ';' : ':'}${process.env.PATH}`,
      BUN_INSTALL: installPath,
    };

    return new Promise<void>((resolve, reject) => {
      const child = spawn(command, args, {
        stdio: 'inherit',
        shell: true,
        env,
        cwd: process.cwd(),
      });

      child.on('exit', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Command exited with code ${code}`));
        }
      });

      child.on('error', (err) => {
        reject(err);
      });
    });
    },
    { failMessage: `Failed to execute command with Bun ${targetVersion}` },
  );
}
