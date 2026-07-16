#!/usr/bin/env bun
import packageJson from '../package.json';
import { App } from './cli/app';
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
import { shellBunVersion } from './commands/shell';
import { defaultBunVersion } from './commands/default';
import { deactivate } from './commands/deactivate';
import { displayVersion } from './commands/version';
import { cacheCommand } from './commands/cache';
import { configureShell } from './commands/setup';
import { upgradeBvm } from './commands/upgrade';
import { doctor } from './commands/doctor';
import { handleConfigCommand } from './commands/config';
import { rehash } from './commands/rehash';
import { printCompletion } from './commands/completion';

// --- Main Execution ---

async function main() {
  const app = new App('bvm', packageJson.version);

  app.command('rehash', 'Regenerate shims for all installed binaries')
    .option('--silent', 'Suppress output')
    .action(async (_args, flags) => { await rehash({ silent: Boolean(flags.silent) }); });

  app.command('install [version]', 'Install a Bun version and set as current')
    .option('--global, -g', 'Install as a global tool (not just default)')
    .action(async (args, flags) => { await installBunVersion(args[0], { global: Boolean(flags.global || flags.g) }); });

  app.command('i [version]', 'Alias for install')
    .option('--global, -g', 'Install as a global tool (not just default)')
    .action(async (args, flags) => { await installBunVersion(args[0], { global: Boolean(flags.global || flags.g) }); });

  app.command('ls', 'List installed Bun versions', { aliases: ['list'] })
    .action(async () => { await listLocalVersions(); });

  app.command('ls-remote', 'List all available remote Bun versions')
    .action(async () => { await listRemoteVersions(); });

  app.command('use <version>', 'Switch the active Bun version immediately (all terminals)')
    .option('--fix-path', 'Auto-run setup if shims not active')
    .option('--yes, -y', 'Assume yes for prompts')
    .action(async (args, flags) => {
      if (!args[0]) throw new Error('Version is required');
      const fixPath = !!(flags as any).fixPath || !!(flags as any)['fix-path'];
      const yes = !!(flags as any).yes || !!(flags as any).y;
      await useBunVersion(args[0], { fixPath, yes });
    });

  app.command('shell <version>', 'Switch Bun version for the current shell session')
    .action(async (args) => { if (!args[0]) throw new Error('Version is required'); await shellBunVersion(args[0]); });

  app.command('default [version]', 'Display or set the global default Bun version')
    .action(async (args) => { await defaultBunVersion(args[0]); });

  app.command('current', 'Display the currently active Bun version')
    .action(async () => { await displayCurrentVersion(); });

  app.command('uninstall <version>', 'Uninstall a Bun version')
    .action(async (args) => { if (!args[0]) throw new Error('Version is required'); await uninstallBunVersion(args[0]); });

  app.command('alias <name> <version>', 'Create an alias for a Bun version')
    .action(async (args) => { if (!args[0] || !args[1]) throw new Error('Name and version are required'); await createAlias(args[0], args[1]); });

  app.command('unalias <name>', 'Remove an existing alias')
    .action(async (args) => { if (!args[0]) throw new Error('Alias name is required'); await removeAlias(args[0]); });

  app.command('run <version> [...args]', 'Run a command with a specific Bun version')
    .action(async (args) => {
      const version = args[0];
      if (!version) throw new Error('Version is required');
      const runIndex = process.argv.indexOf('run');
      const rawArgs = runIndex !== -1 ? process.argv.slice(runIndex + 2) : [];
      await runWithBunVersion(version, rawArgs);
    });

  app.command('exec <version> <cmd> [...args]', 'Execute a command with a specific Bun version\'s environment')
    .action(async (args) => {
      const version = args[0];
      const cmd = args[1];
      if (!version || !cmd) throw new Error('Version and command are required');
      const execIndex = process.argv.indexOf('exec');
      const rawArgs = execIndex !== -1 ? process.argv.slice(execIndex + 3) : [];
      await execWithBunVersion(version, cmd, rawArgs);
    });

  app.command('which [version]', 'Display path to installed bun version')
    .action(async (args) => { await whichBunVersion(args[0]); });

  app.command('deactivate', 'Undo effects of bvm on current shell')
    .action(async () => { await deactivate(); });

  app.command('version <spec>', 'Resolve the given description to a single local version')
    .action(async (args) => { if (!args[0]) throw new Error('Version specifier is required'); await displayVersion(args[0]); });

  app.command('cache <action>', 'Manage bvm cache')
    .action(async (args) => { if (!args[0]) throw new Error('Action is required'); await cacheCommand(args[0]); });

  app.command('setup', 'Configure shell environment automatically')
    .option('--silent, -s', 'Suppress output')
    .action(async (_args, flags) => { await configureShell(!(flags.silent || flags.s)); });

  app.command('upgrade', 'Upgrade bvm to the latest version', { aliases: ['self-update'] })
    .action(async () => { await upgradeBvm(); });

  app.command('config <subcommand>', 'Manage BVM configuration (registry)')
    .action(async (args) => { await handleConfigCommand(args); });

  app.command('doctor', 'Show diagnostics for Bun/BVM setup')
    .action(async () => { await doctor(); });

  app.command('completion <shell>', 'Generate shell completion script (bash|zsh|fish)')
    .action(async (args) => { if (!args[0]) throw new Error('Shell name is required'); printCompletion(args[0]); });

  return app.run(Bun.argv.slice(2));
}

main().then((exitCode) => {
    process.exit(exitCode);
}).catch(err => {
    const message = err instanceof Error ? err.stack || err.message : String(err);
    console.error("\n[FATAL ERROR] Unexpected Crash:");
    console.error(message);
    process.exit(1);
});
