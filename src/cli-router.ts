import { parseArgs } from 'util';
import { colors } from './utils/ui';
import packageJson from '../package.json';
import { triggerUpdateCheck, getUpdateNotification } from './utils/update-checker';

type ActionHandler = (args: string[], flags: Record<string, any>) => Promise<void> | void;

interface CommandDef {
  description: string;
  usage: string;
  action: ActionHandler;
  aliases?: string[];
}

export class App {
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
        options.aliases.forEach(alias => {
            this.commands[alias] = commandObj;
        });
    }

    const builder = {
        action: (handler: ActionHandler) => {
            commandObj.action = handler;
            return builder;
        },
        option: (rawName: string, description: string) => {
            return builder;
        }
    };
    return builder;
  }

  async run() {
    // 1. Trigger background update check (non-blocking)
    triggerUpdateCheck().catch(() => {});

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
    
    if (!commandName) {
        if (values.version || values.v) {
            console.log(this.versionStr);
            process.exit(0);
        }
        if (values.help || values.h) {
            this.showHelp();
            process.exit(0);
        }
        this.showHelp();
        process.exit(1);
    }

    if (values.help || values.h) {
        this.showHelp(); 
        process.exit(0);
    }

    const command = this.commands[commandName];
    if (!command) {
        console.error(colors.yellow(`Unknown command '${commandName}'`));
        this.showHelp();
        process.exit(0);
    }

    try {
        await command.action(positionals.slice(1), values);

        // 2. Show update notification after command execution for interactive commands
        if (['ls', 'current', 'alias', 'default', 'doctor'].includes(commandName)) {
            const notice = await getUpdateNotification();
            if (notice) console.log(notice);
        }
    } catch (error: any) {
        console.error(colors.red(`✖ ${error.message}`));
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