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
  action: (spinner: Spinner) => Promise<T>,
  options?: SpinnerOptions,
): Promise<T> {
  const spinner = new Spinner(message);
  spinner.start();
  try {
    const result = await action(spinner);
    // Note: custom Spinner doesn't expose isSpinning, but stop() is safe to call multiple times or succeed() handles it.
    // However, our custom implementation's stop() clears the line.
    // If the action already called succeed/fail, we shouldn't call stop/fail again ideally,
    // but the original logic relied on isSpinning.
    // Let's assume action calls succeed/fail. If not, we stop it.
    // Actually, our Spinner.stop() clears the line.
    // If the action returned, we assume success? No, the caller usually calls spinner.succeed().
    // If they didn't, we should probably stop it.
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
