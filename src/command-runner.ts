import { Spinner, colors } from './utils/ui';

type FailMessage = string | ((error: unknown) => string);

interface SpinnerOptions {
  failMessage?: FailMessage;
}

/**
 * Wraps command logic with a managed spinner and consistent error handling.
 */
export async function withSpinner<T>(
  message: string,
  action: (spinner: Spinner | any) => Promise<T>,
  options?: SpinnerOptions,
): Promise<T> {
  const isWindows = process.platform === 'win32';

  if (isWindows) {
      console.log(colors.cyan(`> ${message}`));
      // Mock spinner object for Windows to avoid ANSI cursor crashes
      const mockSpinner = {
          start: (msg?: string) => { if (msg) console.log(colors.cyan(`> ${msg}`)); },
          stop: () => {},
          succeed: (msg: string) => console.log(colors.green(`  ✓ ${msg}`)),
          fail: (msg: string) => console.log(colors.red(`  ✖ ${msg}`)),
          info: (msg: string) => console.log(colors.cyan(`  ℹ ${msg}`)),
          update: (msg: string) => console.log(colors.dim(`  ... ${msg}`)),
          isSpinning: false
      };
      
      try {
          return await action(mockSpinner);
      } catch (error: any) {
          const failureText = resolveFailMessage(error, options?.failMessage);
          console.log(colors.red(`  ✖ ${failureText}`));
          if (process.env.BVM_DEBUG || true) { // Always show detailed error for now during debugging
              console.log(colors.dim(`    Details: ${error.message}`));
              if (error.code) console.log(colors.dim(`    Code: ${error.code}`));
          }
          error.reported = true;
          throw error;
      }
  }

  const spinner = new Spinner(message);
  spinner.start();
  try {
    const result = await action(spinner);
    spinner.stop(); 
    return result;
  } catch (error: any) {
    const failureText = resolveFailMessage(error, options?.failMessage);
    spinner.fail(colors.red(failureText));
    error.reported = true;
    throw error;
  }
}

function resolveFailMessage(error: unknown, failMessage?: FailMessage): string {
  const defaultMessage = error instanceof Error ? error.message : String(error);
  if (!failMessage) {
    return defaultMessage;
  }

  if (typeof failMessage === 'function') {
    return failMessage(error);
  }

  return `${failMessage}: ${defaultMessage}`;
}
