import { App } from './cli-router';
import { installBunVersion } from './commands/install';
import { useBunVersion } from './commands/use';
import { listRemoteVersions } from './commands/ls-remote';
import { listLocalVersions } from './commands/ls';
import { displayCurrentVersion } from './commands/current';
import { uninstallBunVersion } from './commands/uninstall';
import { createAlias } from './commands/alias';
import { removeAlias } from './commands/unalias';
import { runWithBunVersion } from './commands/run';
import { execWithBunVersion } from './commands/exec';
import { whichBunVersion } from './commands/which';
import { deactivate } from './commands/deactivate';
import { displayVersion } from './commands/version';
import { cacheCommand } from './commands/cache';
import { configureShell } from './commands/setup';
import { upgradeBvm } from './commands/upgrade';
import { doctor } from './commands/doctor';
import { printCompletion } from './commands/completion';
import { colors } from './utils/ui';

const app = new App('bvm');

// Placeholder for commands
app.command('install [version]', 'Install a Bun version')
  .action(async (args) => {
    try {
      const version = args[0];
      await installBunVersion(version);
    } catch (error: any) {
      console.error(colors.red(`✖ ${error.message}`));
      process.exit(1);
    }
  });

app.command('ls', 'List installed Bun versions', { aliases: ['list'] })
  .action(async () => {
    try {
      await listLocalVersions();
    } catch (error: any) {
      console.error(colors.red(`✖ ${error.message}`));
      process.exit(1);
    }
  });

app.command('ls-remote', 'List all available remote Bun versions')
  .action(async () => {
    try {
      await listRemoteVersions();
    } catch (error: any) {
      console.error(colors.red(`✖ ${error.message}`));
      process.exit(1);
    }
  });

app.command('use [version]', 'Switch to a specific Bun version')
  .option('--silent, -s', 'Suppress output')
  .action(async (args, flags) => {
    try {
      const version = args[0];
      await useBunVersion(version, { silent: flags.silent || flags.s });
    } catch (error: any) {
      if (!flags.silent && !flags.s) {
        console.error(colors.red(`✖ ${error.message}`));
      }
      process.exit(1);
    }
  });

app.command('current', 'Display the currently active Bun version')
  .action(async () => {
    try {
      await displayCurrentVersion();
    } catch (error: any) {
      console.error(colors.red(`✖ ${error.message}`));
      process.exit(1);
    }
  });

app.command('uninstall <version>', 'Uninstall a Bun version')
  .action(async (args) => {
    try {
      const version = args[0];
      if (!version) throw new Error('Version is required');
      await uninstallBunVersion(version);
    } catch (error: any) {
      console.error(colors.red(`✖ ${error.message}`));
      process.exit(1);
    }
  });

app.command('alias <name> <version>', 'Create an alias for a Bun version')
  .action(async (args) => {
    try {
      const name = args[0];
      const version = args[1];
      if (!name || !version) throw new Error('Name and version are required');
      await createAlias(name, version);
    } catch (error: any) {
      console.error(colors.red(`✖ ${error.message}`));
      process.exit(1);
    }
  });

app.command('unalias <name>', 'Remove an existing alias')
  .action(async (args) => {
    try {
      const name = args[0];
      if (!name) throw new Error('Alias name is required');
      await removeAlias(name);
    } catch (error: any) {
      console.error(colors.red(`✖ ${error.message}`));
      process.exit(1);
    }
  });

app.command('run <version> [...args]', 'Run a command with a specific Bun version')
  .action(async (args) => {
    try {
      const version = args[0];
      if (!version) throw new Error('Version is required');

      // Manually extract args to preserve flags like --version
      const runIndex = process.argv.indexOf('run');
      
      let rawArgs: string[] = [];
      if (runIndex !== -1 && process.argv.length > runIndex + 2) {
          rawArgs = process.argv.slice(runIndex + 2);
      }
      
      await runWithBunVersion(version, rawArgs);
    } catch (error: any) {
      console.error(colors.red(`✖ ${error.message}`));
      process.exit(1);
    }
  });

app.command('exec <version> <cmd> [...args]', 'Execute a command with a specific Bun version\'s environment')
  .action(async (args) => {
    try {
      const version = args[0];
      const cmd = args[1];
      if (!version || !cmd) throw new Error('Version and command are required');

      // Manually extract args
      const execIndex = process.argv.indexOf('exec');
      
      let rawArgs: string[] = [];
      if (execIndex !== -1 && process.argv.length > execIndex + 3) {
          rawArgs = process.argv.slice(execIndex + 3);
      }

      await execWithBunVersion(version, cmd, rawArgs);
    } catch (error: any) {
      console.error(colors.red(`✖ ${error.message}`));
      process.exit(1);
    }
  });

app.command('which [version]', 'Display path to installed bun version')
  .action(async (args) => {
    try {
      await whichBunVersion(args[0]);
    } catch (error: any) {
      console.error(colors.red(`✖ ${error.message}`));
      process.exit(1);
    }
  });

app.command('deactivate', 'Undo effects of bvm on current shell')
  .action(async () => {
    try {
      await deactivate();
    } catch (error: any) {
      console.error(colors.red(`✖ ${error.message}`));
      process.exit(1);
    }
  });

app.command('version <spec>', 'Resolve the given description to a single local version')
  .action(async (args) => {
    try {
      const spec = args[0];
      if (!spec) throw new Error('Version specifier is required');
      await displayVersion(spec);
    } catch (error: any) {
      console.error(colors.red(`✖ ${error.message}`));
      process.exit(1);
    }
  });

app.command('cache <action>', 'Manage bvm cache')
  .action(async (args) => {
    try {
      const action = args[0];
      if (!action) throw new Error('Action is required');
      await cacheCommand(action);
    } catch (error: any) {
      console.error(colors.red(`✖ ${error.message}`));
      process.exit(1);
    }
  });

app.command('setup', 'Configure shell environment automatically')
  .option('--silent, -s', 'Suppress output')
  .action(async (_args, flags) => {
    try {
      await configureShell(!(flags.silent || flags.s));
    } catch (error: any) {
      console.error(colors.red(`✖ ${error.message}`));
      process.exit(1);
    }
  });

app.command('upgrade', 'Upgrade bvm to the latest version', { aliases: ['self-update'] })
  .action(async () => {
    try {
      await upgradeBvm();
    } catch (error: any) {
      console.error(colors.red(`✖ ${error.message}`));
      process.exit(1);
    }
  });

app.command('doctor', 'Show diagnostics for Bun/BVM setup')
  .action(async () => {
    try {
      await doctor();
    } catch (error: any) {
      console.error(colors.red(`✖ ${error.message}`));
      process.exit(1);
    }
  });

app.command('completion <shell>', 'Generate shell completion script (bash|zsh|fish)')
  .action(async (args) => {
    try {
      const shell = args[0];
      if (!shell) throw new Error('Shell name is required');
      printCompletion(shell);
    } catch (error: any) {
      console.error(colors.red(`✖ ${error.message}`));
      process.exit(1);
    }
  });

app.command('help', 'Show help message')
  .action(() => {
    // App handles this internally usually, but explicit command works too
    // We can access private showHelp if we exported it or just let App handle invalid commands
  });

app.run();