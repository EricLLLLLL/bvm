import { BunfigManager } from '../utils/bunfig';
import { RegistrySpeedTester, REGISTRIES } from '../utils/registry-check';
import { colors } from '../utils/ui';
import { withSpinner } from '../command-runner';

export async function handleConfigCommand(args: string[]) {
  const [subcommand, key, value] = args;
  const bunfig = new BunfigManager();

  if (subcommand === 'ls' || !subcommand) {
    console.log(colors.bold('\nBVM Configuration (via ~/.bunfig.toml)'));
    console.log(`Path: ${colors.dim(bunfig.getPath())}`);
    const registry = bunfig.getRegistry();
    console.log(`Registry: ${registry ? colors.green(registry) : colors.yellow('(not set, using Bun default)')}`);
    return;
  }

  if (subcommand === 'registry') {
    if (key === 'auto') {
      await withSpinner('Racing registries for optimal speed...', async (spinner) => {
        const tester = new RegistrySpeedTester();
        const fastest = await tester.getFastestRegistry();
        bunfig.setRegistry(fastest);
        spinner.succeed(colors.green(`✓ Set registry to ${fastest}`));
      });
    } else if (key) {
      bunfig.setRegistry(key);
      console.log(colors.green(`✓ Registry set to ${key}`));
    } else {
      const current = bunfig.getRegistry();
      console.log(`Current registry: ${current || 'default'}`);
    }
    return;
  }

  console.log(colors.red(`Unknown config command: ${subcommand}`));
  console.log('Usage:');
  console.log('  bvm config ls');
  console.log('  bvm config registry <url|auto>');
}
