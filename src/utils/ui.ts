import { createInterface } from 'readline';

// --- Colors ---
const isColorSupported = !process.env.NO_COLOR;
// Escape regex special characters (like [)
const escapeRegex = (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const formatter = (open: string, close: string, replace = open) => 
  (input: string) => isColorSupported ? open + input.replace(new RegExp(escapeRegex(close), 'g'), replace) + close : input;

export const colors = {
  red: formatter('\x1b[1;31m', '\x1b[39m'),    // Bold Red
  green: formatter('\x1b[1;32m', '\x1b[39m'),  // Bold Green
  yellow: formatter('\x1b[1;33m', '\x1b[39m'), // Bold Yellow
  blue: formatter('\x1b[1;34m', '\x1b[39m'),   // Bold Blue (Standard high-vis blue)
  magenta: formatter('\x1b[1;35m', '\x1b[39m'),// Bold Magenta
  cyan: formatter('\x1b[1;36m', '\x1b[39m'),   // Bold Cyan (Brand)
  gray: formatter('\x1b[90m', '\x1b[39m'),     // Dim Gray
  bold: formatter('\x1b[1m', '\x1b[22m', '\x1b[22m\x1b[1m'),
  dim: formatter('\x1b[2m', '\x1b[22m', '\x1b[22m\x1b[2m'),
};

// --- Spinner ---
export class Spinner {
  private timer: Timer | null = null;
  private frames = process.platform === 'win32' 
    ? ['-'] // No animation on Windows
    : ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  private frameIndex = 0;
  private text: string;
  private isWindows = process.platform === 'win32';

  constructor(text: string) {
    this.text = text;
  }

  start(text?: string) {
    if (text) this.text = text;
    if (this.timer) return;
    
    if (this.isWindows) {
        // Just print once, no interval
        process.stdout.write(`${colors.cyan('>')} ${this.text}\n`);
        return;
    }

    this.timer = setInterval(() => {
      // \r moves to start, \x1b[K clears the line
      process.stdout.write(`\r\x1b[K${colors.cyan(this.frames[this.frameIndex])} ${this.text}`);
      this.frameIndex = (this.frameIndex + 1) % this.frames.length;
    }, 80);
  }

  stop() {
    if (this.isWindows) {
        return;
    }
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
    console.log(`${colors.green('  ✓')} ${text || this.text}`);
  }

  fail(text?: string) {
    this.stop();
    console.log(`${colors.red('  ✖')} ${text || this.text}`);
  }
  
  info(text?: string) {
      this.stop();
      console.log(`${colors.blue('  ℹ')} ${text || this.text}`);
  }

  update(text: string) {
    this.text = text;
    if (this.isWindows) {
        console.log(colors.dim(`  ... ${this.text}`));
    }
  }
}

// --- Progress Bar ---
export class ProgressBar {
  private total: number;
  private current: number = 0;
  private width: number = 20; // Super compact

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
    process.stdout.write('\x1b[?25h\n'); // Show cursor and final newline
  }

  private render(data?: { speed: string }) {
    const percentage = Math.min(1, this.current / this.total);
    const filled = Math.round(this.width * percentage);
    const empty = this.width - filled;
    
    // Use ASCII for Windows to avoid '?' or box characters in some environments
    const isWindows = process.platform === 'win32';
    const fillChar = isWindows ? '=' : '█';
    const emptyChar = isWindows ? '-' : '░';

    const bar = colors.green(fillChar.repeat(filled)) + colors.gray(emptyChar.repeat(empty));
    const percentStr = (percentage * 100).toFixed(0).padStart(3, ' ');
    
    const currentMB = (this.current / (1024 * 1024)).toFixed(1);
    const totalMB = (this.total / (1024 * 1024)).toFixed(1);
    const speedStr = data ? ` ${data.speed}KB/s` : '';
    
    // Total length is roughly: 1(space) + 20(bar) + 3(sep) + 3(%) + 3(sep) + 4(MB) + 1(/) + 4(MB) + 10(speed) = ~50 chars
    // This will fit in ALMOST ANY terminal window.
    process.stdout.write(`\r\x1b[2K ${bar} ${percentStr}% | ${currentMB}/${totalMB}MB${speedStr}`);
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
