import { createInterface } from 'readline';

// --- Colors ---
const isColorSupported = !process.env.NO_COLOR;
// Escape regex special characters (like [)
const escapeRegex = (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const formatter = (open: string, close: string, replace = open) => 
  (input: string) => isColorSupported ? open + input.replace(new RegExp(escapeRegex(close), 'g'), replace) + close : input;

export const colors = {
  red: formatter('\x1b[31m', '\x1b[39m'),
  green: formatter('\x1b[32m', '\x1b[39m'),
  yellow: formatter('\x1b[33m', '\x1b[39m'),
  blue: formatter('\x1b[34m', '\x1b[39m'),
  cyan: formatter('\x1b[36m', '\x1b[39m'),
  gray: formatter('\x1b[90m', '\x1b[39m'),
  bold: formatter('\x1b[1m', '\x1b[22m', '\x1b[22m\x1b[1m'),
  dim: formatter('\x1b[2m', '\x1b[22m', '\x1b[22m\x1b[2m'),
};

// --- Spinner ---
export class Spinner {
  private timer: Timer | null = null;
  private frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  private frameIndex = 0;
  private text: string;

  constructor(text: string) {
    this.text = text;
  }

  start(text?: string) {
    if (text) this.text = text;
    if (this.timer) return;
    this.timer = setInterval(() => {
      process.stdout.write(`\r${colors.cyan(this.frames[this.frameIndex])} ${this.text}`);
      this.frameIndex = (this.frameIndex + 1) % this.frames.length;
    }, 80);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      process.stdout.write('\r\x1b[K'); // Clear line
    }
    // Always ensure cursor is shown, just in case
    process.stdout.write('\x1b[?25h'); 
  }

  succeed(text?: string) {
    this.stop();
    console.log(`${colors.green('✓')} ${text || this.text}`);
  }

  fail(text?: string) {
    this.stop();
    console.log(`${colors.red('✖')} ${text || this.text}`);
  }
  
  info(text?: string) {
      this.stop();
      console.log(`${colors.blue('ℹ')} ${text || this.text}`);
  }

  update(text: string) {
    this.text = text;
  }
}

// --- Progress Bar ---
export class ProgressBar {
  private total: number;
  private current: number = 0;
  private width: number = 40;

  constructor(total: number) {
    this.total = total;
  }

  start() {
    process.stdout.write('\x1b[?25l'); // Hide cursor
    this.render();
  }

  update(current: number, data?: { speed: string }) {
    this.current = current;
    this.render(data);
  }

  stop() {
    process.stdout.write('\n\x1b[?25h'); // Show cursor
  }

  private render(data?: { speed: string }) {
    const percentage = Math.min(1, this.current / this.total);
    const filled = Math.round(this.width * percentage);
    const empty = this.width - filled;
    const bar = colors.green('█'.repeat(filled)) + colors.gray('░'.repeat(empty));
    const percentStr = (percentage * 100).toFixed(0);
    const speedStr = data ? ` | ${data.speed} kb/s` : '';
    
    process.stdout.write(`\r ${bar} | ${percentStr}% | ${this.current}/${this.total} bytes${speedStr}`);
  }
}

// --- Prompt ---
export async function confirm(message: string): Promise<boolean> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${colors.yellow('?')} ${message} (Y/n) `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() !== 'n');
    });
  });
}
