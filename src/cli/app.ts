import { parseArgs } from 'util';

import { colors } from '../utils/ui';
import { getUpdateNotification, triggerUpdateCheck } from '../utils/update-checker';

export type CliFlags = Record<string, boolean | string | undefined>;
type ActionHandler = (args: string[], flags: CliFlags) => Promise<void> | void;

interface CommandDef {
  description: string;
  usage: string;
  action: ActionHandler;
  aliases?: string[];
  optionNames: Set<string>;
}

interface BooleanOption {
  type: 'boolean';
  short?: string;
}

export class App {
  private commands: Record<string, CommandDef> = {};
  private helpEntries: string[] = [];
  private optionDefinitions: Record<string, BooleanOption> = {
    help: { type: 'boolean', short: 'h' },
    version: { type: 'boolean', short: 'v' },
    silent: { type: 'boolean', short: 's' },
  };

  constructor(
    private readonly name: string,
    private readonly versionStr: string,
  ) {}

  command(usage: string, description: string, options: { aliases?: string[] } = {}) {
    const name = usage.split(' ')[0];
    const commandObj: CommandDef = {
      description,
      usage: `${this.name} ${usage}`,
      action: async () => {},
      aliases: options.aliases,
      optionNames: new Set(),
    };
    this.commands[name] = commandObj;
    this.helpEntries.push(`  ${usage.padEnd(35)} ${description}`);
    options.aliases?.forEach((alias) => {
      this.commands[alias] = commandObj;
    });

    const builder = {
      action: (handler: ActionHandler) => {
        commandObj.action = handler;
        return builder;
      },
      option: (rawName: string, _description: string) => {
        const names = rawName.split(',').map((part) => part.trim().split(/\s+/)[0]);
        const longName = names.find((name) => name.startsWith('--'))?.slice(2);
        const shortName = names.find((name) => /^-[^-]$/.test(name))?.slice(1);
        if (!longName) throw new Error(`Invalid option declaration '${rawName}'`);
        this.optionDefinitions[longName] = {
          type: 'boolean',
          ...(shortName ? { short: shortName } : {}),
        };
        commandObj.optionNames.add(longName);
        return builder;
      },
    };
    return builder;
  }

  async run(argv: string[]): Promise<number> {
    try {
      triggerUpdateCheck().catch(() => {});
    } catch {
      // Update checks are best-effort and must never block CLI commands.
    }

    const { values, positionals } = parseArgs({
      args: argv,
      strict: false,
      allowPositionals: true,
      options: this.optionDefinitions,
    });

    const flags = values as CliFlags;
    const commandName = positionals[0];
    const command = commandName ? this.commands[commandName] : undefined;
    const passthroughCommand = commandName === 'run' || commandName === 'exec';
    if (!passthroughCommand) {
      const allowed = new Set(['help', 'version', 'silent', ...(command?.optionNames ?? [])]);
      const unknownOption = Object.keys(flags).find((name) => !allowed.has(name));
      if (unknownOption) {
        console.error(colors.red(`Unknown option '--${unknownOption}'`));
        return 1;
      }
    }

    if (!commandName) {
      if (flags.version) {
        console.log(this.versionStr);
        return 0;
      }
      if (flags.help) {
        this.showHelp();
        return 0;
      }
      this.showHelp();
      return 0;
    }

    if (flags.help) {
      this.showHelp();
      return 0;
    }

    if (!command) {
      console.error(colors.yellow(`Unknown command '${commandName}'`));
      this.showHelp();
      return 1;
    }

    try {
      await command.action(positionals.slice(1), flags);
      const isSilent = Boolean(flags.silent);
      const isVersionOrHelp = Boolean(flags.version || flags.help);
      if (!isVersionOrHelp && !isSilent && ['ls', 'current', 'doctor', 'default'].includes(commandName)) {
        const notice = await getUpdateNotification();
        if (notice) console.log(notice);
      }
      return 0;
    } catch (error) {
      const reportedError = error as Error & { reported?: boolean };
      if (!reportedError.reported) {
        console.error(colors.red(`✖ ${reportedError.message}`));
      }
      return 1;
    }
  }

  private showHelp(): void {
    console.log(`Bun Version Manager (bvm) v${this.versionStr}`);
    console.log('Built with Bun · Runs with Bun · Tested on Bun\n');
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
