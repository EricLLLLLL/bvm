import { describe, expect, test, beforeAll, afterAll } from "bun:test";
import { join, dirname } from "path";
import { mkdir, rm, writeFile } from "fs/promises";
import { BVM_DIR } from "../src/constants";

// Define a temporary home directory for testing
const TEST_HOME = join(process.cwd(), "test_home");
const TEST_BVM_DIR = join(TEST_HOME, ".bvm");

// Get current bun path to ensure child process can find it
const bunDir = dirname(process.execPath);

async function runBvm(args: string[], cwd: string = process.cwd()) {
  const scriptPath = join(process.cwd(), "src/index.ts");
  const proc = Bun.spawn(["bun", "run", scriptPath, ...args], {
    cwd,
    env: {
      ...process.env,
      HOME: TEST_HOME,
      PATH: `${bunDir}:/usr/bin:/bin`, 
      BVM_GITHUB_TOKEN: process.env.BVM_GITHUB_TOKEN,
      BVM_TEST_MODE: 'true'
    },
    stdout: "pipe",
    stderr: "pipe"
  });

  const output = await new Response(proc.stdout).text();
  const error = await new Response(proc.stderr).text();
  await proc.exited;

  if (proc.exitCode !== 0) {
      // console.error(`Command [${args.join(' ')}] failed with exit code ${proc.exitCode}:`);
      // console.error(error);
  }

  return { exitCode: proc.exitCode, output, error, allOutput: output + error };
}

describe("CLI Integration Suite", () => {
  beforeAll(async () => {
    await rm(TEST_HOME, { recursive: true, force: true });
    await mkdir(TEST_HOME, { recursive: true });
  });

  afterAll(async () => {
    await rm(TEST_HOME, { recursive: true, force: true });
  });

  // --- Network & Discovery ---
  test("ls-remote returns versions", async () => {
    const { exitCode, allOutput } = await runBvm(["ls-remote"]);
    expect(exitCode).toBe(0);
    expect(allOutput).toContain("v1.0.0");
  });

  // --- Installation ---
  test("install 1.0.0 (fresh)", async () => {
    const { exitCode, allOutput } = await runBvm(["install", "1.0.0"]);
    expect(exitCode).toBe(0);
    const binPath = join(TEST_BVM_DIR, "versions", "v1.0.0", "bun");
    expect(await Bun.file(binPath).exists()).toBe(true);
  }, 120000);

  test("install 1.0.0 (re-install should skip)", async () => {
    const { exitCode, allOutput } = await runBvm(["install", "1.0.0"]);
    expect(exitCode).toBe(0);
    expect(allOutput).toContain("already installed");
  });

  test("install invalid version fails", async () => {
    const { exitCode } = await runBvm(["install", "99.99.99"]);
    expect(exitCode).not.toBe(0);
  });

  // --- Version Management ---
  test("ls lists installed versions", async () => {
    const { exitCode, allOutput } = await runBvm(["ls"]);
    expect(exitCode).toBe(0);
    expect(allOutput).toContain("v1.0.0");
    expect(allOutput).toContain("(current)"); // Auto-activated
  });

  test("use 1.0.0 works", async () => {
    const { exitCode } = await runBvm(["use", "1.0.0"]);
    expect(exitCode).toBe(0);
  });

  test("current shows active version", async () => {
    const { exitCode, allOutput } = await runBvm(["current"]);
    expect(exitCode).toBe(0);
    expect(allOutput).toContain("v1.0.0");
  });

  test("which 1.0.0 returns path", async () => {
    const { exitCode, output } = await runBvm(["which", "1.0.0"]);
    expect(exitCode).toBe(0);
    expect(output).toContain(".bvm/versions/v1.0.0/bun");
  });

  // --- Aliases ---
  test("alias create and resolve", async () => {
    await runBvm(["alias", "prod", "1.0.0"]);
    const { allOutput } = await runBvm(["ls"]);
    expect(allOutput).toContain("prod -> v1.0.0");
    
    // Resolve via version command
    const { output: ver } = await runBvm(["version", "prod"]);
    expect(ver.trim()).toBe("v1.0.0");
  });

  test("alias overwrite", async () => {
      // Overwrite 'prod' alias
      // We need another version to test overwrite meaningfully, but we only installed 1.0.0.
      // We can just overwrite it with the same target and ensure it succeeds.
      const { exitCode } = await runBvm(["alias", "prod", "1.0.0"]);
      expect(exitCode).toBe(0);
  });

  test("unalias works", async () => {
    await runBvm(["unalias", "prod"]);
    const { allOutput } = await runBvm(["ls"]);
    expect(allOutput).not.toContain("prod ->");
  });

  // --- Execution ---
  test("run specific version", async () => {
    const { exitCode, output } = await runBvm(["run", "1.0.0", "--version"]);
    expect(exitCode).toBe(0);
    expect(output.trim()).toBe("1.0.0");
  });

  test("exec failure propagates exit code", async () => {
      const { exitCode } = await runBvm(["exec", "1.0.0", "false"]);
      expect(exitCode).not.toBe(0);
  });

  // --- Configuration ---
  test(".bvmrc support", async () => {
    const projectDir = join(TEST_HOME, "my-project");
    await mkdir(projectDir, { recursive: true });
    await writeFile(join(projectDir, ".bvmrc"), "1.0.0");

    await runBvm(["deactivate"]);
    
    const { exitCode, allOutput } = await runBvm(["use"], projectDir);
    expect(exitCode).toBe(0);
    expect(allOutput).toContain("Found '.bvmrc' with version <1.0.0>");
  });

  test(".bvmrc invalid version", async () => {
    const projectDir = join(TEST_HOME, "bad-project");
    await mkdir(projectDir, { recursive: true });
    await writeFile(join(projectDir, ".bvmrc"), "invalid-ver-xyz");

    const { exitCode } = await runBvm(["install"], projectDir);
    expect(exitCode).not.toBe(0);
  });

  // --- Cleanup ---
  test("uninstall active version fails", async () => {
    // Ensure active
    await runBvm(["use", "1.0.0"]);
    
    const { exitCode, allOutput } = await runBvm(["uninstall", "1.0.0"]);
    expect(exitCode).not.toBe(0);
    expect(allOutput).toContain("currently active");
  });

  test("uninstall 1.0.0 works", async () => {
    // Deactivate first
    await runBvm(["deactivate"]);

    const { exitCode } = await runBvm(["uninstall", "1.0.0"]);
    expect(exitCode).toBe(0);
    const binPath = join(TEST_BVM_DIR, "versions", "v1.0.0", "bun");
    expect(await Bun.file(binPath).exists()).toBe(false);
  });

  test("cache clear", async () => {
    const { exitCode } = await runBvm(["cache", "clear"]);
    expect(exitCode).toBe(0);
  });
});
