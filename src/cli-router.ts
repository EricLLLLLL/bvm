import { parseArgs } from 'util';
import { colors } from './utils/ui';
import packageJson from '../package.json';

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
    // usage: "install [version]" -> name: "install"
    const name = usage.split(' ')[0];
    
    const commandObj: CommandDef = {
      description,
      usage: `${this.name} ${usage}`, // Prepend 'bvm'
      action: async () => {}, // Placeholder
      aliases: options.aliases
    };

    this.commands[name] = commandObj;
    
    // Add to help entries
    this.helpEntries.push(`  ${usage.padEnd(35)} ${description}`);
    if (options.aliases) {
        options.aliases.forEach(alias => {
            this.commands[alias] = commandObj;
            // Don't clutter help with aliases usually, or maybe do?
            // Let's keep it clean like cac, aliases are hidden or shown differently.
            // But for simplicity, we add them if needed. 
            // Actually, let's NOT list aliases in main help to save space, user can discover them or we list them in description.
        });
    }

    // Builder pattern
    const builder = {
        action: (handler: ActionHandler) => {
            commandObj.action = handler;
            return builder;
        },
        option: (rawName: string, description: string) => {
            // We ignore options registration for parsing since we use loose parsing,
            // but we could use this for help generation if we wanted to be fancy.
            return builder;
        }
    };
    return builder;
  }

  async run() {
    // Parse args using util.parseArgs
    // We allow loose parsing because each command might have different flags
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
    
    // Handle global flags only if no command is specified
    if (!commandName) {
        if (values.version || values.v) {
            console.log(this.versionStr);
            process.exit(0);
        }
        if (values.help || values.h) {
            this.showHelp();
            process.exit(0);
        }
        // If no command and no global flag, show help and exit with error
        this.showHelp();
        process.exit(1);
    }

    // If help requested for a specific command, show global help (simplified)
    if (values.help || values.h) {
        this.showHelp(); 
        process.exit(0);
    }

    const command = this.commands[commandName];
    if (!command) {
        console.error(colors.yellow(`Unknown command '${commandName}'`));
        this.showHelp();
        process.exit(0); // Exit cleanly as per original cac behavior
    }

    try {
        // Pass arguments excluding the command name itself
        // args: positionals after command
        // flags: parsed options
        await command.action(positionals.slice(1), values);
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
