#!/usr/bin/env bun
import { parseArgs } from 'util';
import packageJson from '../package.json';
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
import { colors } from './utils/ui';
import { triggerUpdateCheck, getUpdateNotification } from './utils/update-checker';

// --- Lightweight CLI Router (Inlined for bundle stability) ---

type ActionHandler = (args: string[], flags: Record<string, any>) => Promise<void> | void;

interface CommandDef {
  description: string;
  usage: string;
  action: ActionHandler;
  aliases?: string[];
}

class App {
  private commands: Record<string, CommandDef> = {};
  private helpEntries: string[] = [];
  private name: string;
  private versionStr: string;

  constructor(name: string) {
    this.name = name;
    this.versionStr = packageJson.version;
  }

  command(usage: string, description: string, options: { aliases?: string[] } = {}) {
    const name = usage.split(' ')[0];
    const commandObj: CommandDef = {
      description,
      usage: `${this.name} ${usage}`,
      action: async () => {},
      aliases: options.aliases
    };
    this.commands[name] = commandObj;
    this.helpEntries.push(`  ${usage.padEnd(35)} ${description}`);
    if (options.aliases) {
        options.aliases.forEach(alias => { this.commands[alias] = commandObj; });
    }
    const builder = {
        action: (handler: ActionHandler) => {
            commandObj.action = handler;
            return builder;
        },
        option: (rawName: string, description: string) => builder
    };
    return builder;
  }

  async run() {
    // 1. Trigger background check (Safe wrapper)
    try { triggerUpdateCheck().catch(() => {}); } catch(e) {}

    const { values, positionals } = parseArgs({
      args: Bun.argv.slice(2),
      strict: false,
      allowPositionals: true,
      options: {
        help: { type: 'boolean', short: 'h' },
        version: { type: 'boolean', short: 'v' },
        silent: { type: 'boolean', short: 's' }
      }
    });

    const commandName = positionals[0];
    const isSilent = !!(values.silent || values.s);
    const isVersionOrHelp = !!(values.version || values.v || values.help || values.h);

    if (!commandName) {
        if (values.version || values.v) { console.log(this.versionStr); process.exit(0); }
        if (values.help || values.h) { this.showHelp(); process.exit(0); }
        this.showHelp(); process.exit(1);
    }

    if (values.help || values.h) { this.showHelp(); process.exit(0); }

    const command = this.commands[commandName];
    if (!command) {
        console.error(colors.yellow(`Unknown command '${commandName}'`));
        this.showHelp();
        process.exit(0);
    }

    try {
        await command.action(positionals.slice(1), values);

        // 2. Show notification after execution for interactive commands
        if (!isVersionOrHelp && !isSilent && ['ls', 'current', 'doctor', 'default'].includes(commandName)) {
            const notice = await getUpdateNotification();
            if (notice) console.log(notice);
        }
    } catch (error: any) {
        if (!error.reported) {
            console.error(colors.red(`✖ ${error.message}`));
        }
        process.exit(1);
    }
  }

  private showHelp() {
      console.log(`Bun Version Manager (bvm) v${this.versionStr}`);
      console.log(`Built with Bun · Runs with Bun · Tested on Bun\n`);
      console.log('Usage:');
      console.log(`  ${this.name} <command> [flags]\n`);
      console.log('Commands:');
      console.log(this.helpEntries.join('\n'));
      console.log('\nGlobal Flags:');
      console.log('  --help, -h                     Show this help message');
      console.log('  --version, -v                  Show version number');
      console.log('\nExamples:');
      console.log('  bvm install 1.0.0');
      console.log('  bvm use 1.0.0');
      console.log('  bvm run 1.0.0 index.ts');
  }
}

// --- Main Execution ---

async function main() {
  const app = new App('bvm');

  app.command('rehash', 'Regenerate shims for all installed binaries')
    .option('--silent', 'Suppress output')
    .action(async (_args, flags) => { await rehash({ silent: flags.silent }); });

  app.command('install [version]', 'Install a Bun version and set as current')
    .option('--global, -g', 'Install as a global tool (not just default)')
    .action(async (args, flags) => { await installBunVersion(args[0], { global: flags.global || flags.g }); });

  app.command('i [version]', 'Alias for install')
    .action(async (args, flags) => { await installBunVersion(args[0], { global: flags.global || flags.g }); });

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

  await app.run();
  process.exit(0);
}

main().catch(err => {
    console.error(colors.red("\n[FATAL ERROR] Unexpected Crash:"));
    console.error(err);
    process.exit(1);
});
