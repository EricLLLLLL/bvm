import { cac } from 'cac';
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
import chalk from 'chalk';
import ora from 'ora';

const cli = cac('bvm');

const helpMessage = `
Bun Version Manager (bvm)

Usage:
  bvm --help                                Show this message
  bvm --version                             Print out the installed version of bvm
  bvm install [version]                     Download and install a <version>. Uses .bvmrc if available
  bvm uninstall <version>                   Uninstall a version
  bvm use [version]                         Modify PATH to use <version>. Uses .bvmrc if available
  bvm deactivate                            Undo effects of \`bvm\` on current shell
  bvm setup                                 Configure shell environment (PATH) automatically
  bvm exec <version> <command>              Run <command> on <version>
  bvm run <version> <args>                  Run \`bun\` on <version> with <args> as arguments
  bvm current                               Display currently activated version of Bun
  bvm ls                                    List installed versions
  bvm list                                  List installed versions (alias for ls)
  bvm ls-remote                             List remote versions available for install
  bvm version <version>                     Resolve the given description to a single local version
  bvm alias <name> <version>                Set an alias named <name> pointing to <version>
  bvm unalias <name>                        Deletes the alias named <name>
  bvm which [version]                       Display path to installed bun version. Uses .bvmrc if available
  bvm cache dir                             Display path to the cache directory for bvm
  bvm cache clear                           Empty cache directory for bvm

Example:
  bvm install 1.0.0                     Install a specific version number
  bvm use 1.0.0                         Use the specific version
  bvm run 1.0.0 index.ts                Run index.ts using bun 1.0.0
  bvm exec 1.0.0 bun index.ts           Run \`bun index.ts\` with the PATH pointing to bun 1.0.0
  bvm alias default 1.0.0               Set default bun version

Note:
  To remove, delete, or uninstall bvm - just remove the \`$BVM_DIR\` folder (usually \`~/.bvm\`)
`;

// Placeholder for commands
cli.command('install [version]', 'Install a Bun version')
  .action(async (version?: string) => {
    await installBunVersion(version);
  });

cli.command('ls', 'List installed Bun versions')
  .alias('list')
  .action(async () => {
    await listLocalVersions();
  });

cli.command('ls-remote', 'List all available remote Bun versions')
  .action(async () => {
    await listRemoteVersions();
  });

cli.command('use [version]', 'Switch to a specific Bun version')
  .action(async (version?: string) => {
    await useBunVersion(version);
  });

cli.command('current', 'Display the currently active Bun version')
  .action(async (version?: string) => {
    await displayCurrentVersion();
  });

cli.command('uninstall <version>', 'Uninstall a Bun version')
  .action(async (version: string) => {
    await uninstallBunVersion(version);
  });

cli.command('alias <name> <version>', 'Create an alias for a Bun version')
  .action(async (name: string, version: string) => {
    await createAlias(name, version);
  });

cli.command('unalias <name>', 'Remove an existing alias')
  .action(async (name: string) => {
    await removeAlias(name);
  });

cli.command('run <version> [...args]', 'Run a command with a specific Bun version')
  .allowUnknownOptions()
  .action(async (version: string) => {
    // Manually extract args to preserve flags like --version
    const runIndex = process.argv.indexOf('run');
    
    let rawArgs: string[] = [];
    if (runIndex !== -1 && process.argv.length > runIndex + 2) {
        rawArgs = process.argv.slice(runIndex + 2);
    }
    
    await runWithBunVersion(version, rawArgs);
  });

cli.command('exec <version> <cmd> [...args]', 'Execute a command with a specific Bun version\'s environment')
  .allowUnknownOptions()
  .action(async (version: string, cmd: string) => {
     // Manually extract args
    const execIndex = process.argv.indexOf('exec');
    
    let rawArgs: string[] = [];
    if (execIndex !== -1 && process.argv.length > execIndex + 3) {
        rawArgs = process.argv.slice(execIndex + 3);
    }

    await execWithBunVersion(version, cmd, rawArgs);
  });

cli.command('which [version]', 'Display path to installed bun version')
  .action(async (version?: string) => {
    await whichBunVersion(version);
  });

cli.command('deactivate', 'Undo effects of bvm on current shell')
  .action(async () => {
    await deactivate();
  });

cli.command('version <spec>', 'Resolve the given description to a single local version')
  .action(async (spec: string) => {
    await displayVersion(spec);
  });

cli.command('cache <action>', 'Manage bvm cache')
  .action(async (action: string) => {
    await cacheCommand(action);
  });

cli.command('setup', 'Configure shell environment automatically')
  .action(async () => {
    await configureShell();
  });

cli.command('help', 'Show help message')
  .action(() => {
    console.log(helpMessage);
  });

// Manually handle --help if passed as a flag to the root command
cli.option('--help', 'Show help message');

const parsed = cli.parse();

if (parsed.options.help) {
    console.log(helpMessage);
}