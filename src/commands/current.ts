import { colors } from '../utils/ui';
import { getActiveVersion } from '../utils';
import { withSpinner } from '../command-runner';

/**
 * Displays the currently active Bun version.
 */
export async function displayCurrentVersion(): Promise<void> {
  await withSpinner(
    'Checking current Bun version...',
    async (spinner) => {
      const { version, source } = await getActiveVersion();

      if (version) {
        spinner.stop();
        console.log(`${colors.green('✓')} Current Bun version: ${colors.green(version)} ${colors.dim(`(${source})`)}`);
      } else {
        spinner.info(colors.blue('No Bun version is currently active.'));
        console.log(colors.yellow(`Use 'bvm install <version>' to set a default, or create a .bvmrc file.`));
      }
    },
    { failMessage: 'Failed to determine current Bun version' },
  );
}