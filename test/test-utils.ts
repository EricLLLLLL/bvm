import { join, dirname } from "path";
import { rmSync, mkdirSync } from "fs";
import { EXECUTABLE_NAME } from "../src/constants";

export const TEST_HOME = join(process.cwd(), "test_home_shared");
export const TEST_BVM_DIR = join(TEST_HOME, ".bvm");
export const CURRENT_BUN_EXECUTABLE = process.execPath;
export { EXECUTABLE_NAME };

export async function resetTestHome() {
  await rmSync(TEST_HOME, { recursive: true, force: true });
  await mkdirSync(TEST_HOME, { recursive: true });
  await mkdirSync(TEST_BVM_DIR, { recursive: true });
  await mkdirSync(join(TEST_BVM_DIR, "alias"), { recursive: true });
}

export async function cleanupTestHome() {
  await rmSync(TEST_HOME, { recursive: true, force: true });
}

// Simple ANSI stripper
const stripAnsi = (str: string) => str.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');

export async function runBvm(args: string[], cwd: string = process.cwd(), envOverrides: Record<string, string> = {}) {
  const scriptPath = join(process.cwd(), "src/index.ts");
  const constructedPath = `${dirname(CURRENT_BUN_EXECUTABLE)}:${process.env.PATH}`;

  const proc = Bun.spawn([CURRENT_BUN_EXECUTABLE, "run", scriptPath, ...args], {
    cwd,
    env: {
      ...process.env,
      HOME: TEST_HOME, // Mock HOME
      PATH: constructedPath,
      BVM_GITHUB_TOKEN: process.env.BVM_GITHUB_TOKEN,
      BVM_TEST_MODE: 'true',
      NO_COLOR: '1', // Disable color in tests via env!
      ...envOverrides
    },
    stdout: "pipe",
    stderr: "pipe"
  });
  const outputRaw = await new Response(proc.stdout).text();
  const errorRaw = await new Response(proc.stderr).text();
  await proc.exited;

  const output = stripAnsi(outputRaw);
  const error = stripAnsi(errorRaw);

  return { exitCode: proc.exitCode, output, error, allOutput: output + error };
}
