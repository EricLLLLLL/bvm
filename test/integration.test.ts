import { beforeAll, afterAll, describe, expect, test, vi } from "bun:test";
import { runBvm, resetTestHome, cleanupTestHome, TEST_HOME, TEST_BVM_DIR } from "./test-utils";
import { existsSync, rmSync, mkdirSync, readFileSync, writeFileSync, readlinkSync } from "fs";
import { join } from "path";

describe("CLI Integration Suite", () => {
  beforeAll(async () => {
    await resetTestHome();

    // Pre-install some versions for fuzzy matching tests
    await runBvm(["install", "1.3.4"]);
    await runBvm(["install", "1.2.23"]);
  });

  afterAll(async () => {
    await cleanupTestHome();
  });

  // --- Network & Discovery ---
  test("ls-remote returns versions", async () => {
    const { exitCode, allOutput } = await runBvm(["ls-remote"]);
    expect(exitCode).toBe(0);
    expect(allOutput).toContain("v1.0.0");
  });

  test("ls-remote filters out canary versions", async () => {
    const { exitCode, allOutput } = await runBvm(["ls-remote"]);
    expect(exitCode).toBe(0);
    expect(allOutput).not.toContain("canary");
  });

  // --- Fuzzy Version Matching ---
  test("use fuzzy version (e.g., 1.3 to v1.3.4)", async () => {
    const { exitCode, allOutput } = await runBvm(["use", "1.3"]);
    expect(exitCode).toBe(0);
    expect(allOutput).toContain("Now using Bun v1.3.4 (immediate effect)");
  });

  test("install fuzzy version (e.g., 1.2 to v1.2.23) and reports already installed", async () => {
    const { exitCode, allOutput } = await runBvm(["install", "1.2"]);
    expect(exitCode).toBe(0);
    expect(allOutput).toContain("Bun v1.2.23 is already installed.");
  });

  test("use latest resolves to highest installed", async () => {
    const { exitCode, allOutput } = await runBvm(["use", "latest"]);
    expect(exitCode).toBe(0);
    expect(allOutput).toContain("Now using Bun v1.3.4 (immediate effect)");
  });

  test("install latest installs/reports latest remote", async () => {
    const { exitCode, allOutput } = await runBvm(["install", "latest"]);
    expect(exitCode).toBe(0);
    expect(allOutput).toMatch(/Bun v\d+\.\d+\.\d+ (installed successfully|is already installed)/);
  });

  test("use invalid partial version fails gracefully", async () => {
    const { exitCode, allOutput } = await runBvm(["use", "99.x"]);
    expect(exitCode).not.toBe(0);
    expect(allOutput).toContain("Failed to switch to Bun 99.x");
  });

  test("install invalid partial version fails gracefully", async () => {
    const { exitCode, allOutput } = await runBvm(["install", "99.x"]);
    expect(exitCode).not.toBe(0);
    expect(allOutput).toContain("Could not find a Bun release for '99.x' compatible with your system.");
  });

  // --- Installation ---
  test("install without version reads .bvmrc and installs target", async () => {
    const rcInstallDir = join(TEST_HOME, "rc-install");
    await rmSync(rcInstallDir, { recursive: true, force: true });
    await mkdirSync(rcInstallDir, { recursive: true });
    await writeFileSync(join(rcInstallDir, ".bvmrc"), "1.0.0");
    await rmSync(join(TEST_BVM_DIR, "versions", "v1.0.0"), { recursive: true, force: true });

    const { exitCode, allOutput } = await runBvm(["install"], rcInstallDir);
    expect(exitCode).toBe(0);
    expect(allOutput).toContain("v1.0.0 installed");

    const installedBinPath = join(TEST_BVM_DIR, "versions", "v1.0.0", "bin", "bun");
    expect(await Bun.file(installedBinPath).exists()).toBe(true);

    const { allOutput: currentOutput } = await runBvm(["current"], rcInstallDir);
    expect(currentOutput).toContain("v1.0.0");

    await runBvm(["deactivate"]);
    const uninstallResult = await runBvm(["uninstall", "1.0.0"]);
    expect(uninstallResult.exitCode).toBe(0);
  });

  test("install 1.0.0 (fresh) auto-activates if first version", async () => {
    // resetTestHome already happened in beforeAll, but we need a fresh start for this specific test
    await resetTestHome();
    const { exitCode, allOutput } = await runBvm(["install", "1.0.0"]);
    expect(exitCode).toBe(0);
    
    const defaultAliasPath = join(TEST_BVM_DIR, "aliases", "default");
    expect(await Bun.file(defaultAliasPath).text()).toContain("v1.0.0");

    const { allOutput: currentOutput } = await runBvm(["current"]);
    expect(currentOutput).toContain("v1.0.0");
    // It might be (default) or (current) depending on resolution order, but usually (current) takes precedence if symlink exists
    expect(currentOutput).toMatch(/\((default|current)\)/);
  });

  test("install 1.0.0 (re-install should skip and NOT change default if already set)", async () => {
    // 1. Setup a different default
    const defaultAliasPath = join(TEST_BVM_DIR, "aliases", "default");
    await mkdirSync(join(TEST_BVM_DIR, "aliases"), { recursive: true });
    await writeFileSync(defaultAliasPath, "v1.3.4");

    // 2. Install 1.0.0
    const { exitCode, allOutput } = await runBvm(["install", "1.0.0"]);
    expect(exitCode).toBe(0);
    
    // 3. Default should still be 1.3.4
    expect(await Bun.file(defaultAliasPath).text()).toContain("v1.3.4");
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
  });

  test("use 1.0.0 works", async () => {
    const { exitCode } = await runBvm(["use", "1.0.0"]);
    expect(exitCode).toBe(0);
  });

  test("current shows active version", async () => {
    const { exitCode, allOutput } = await runBvm(["current"]);
    expect(exitCode).toBe(0);
    expect(allOutput).toContain("Current Bun version");
  });

  test("which 1.0.0 returns path", async () => {
    const { exitCode, output } = await runBvm(["which", "1.0.0"]);
    expect(exitCode).toBe(0);
    expect(output).toContain("versions/v1.0.0/bin/bun");
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

  test("alias overwrite protection", async () => {
      // 1. Create an alias
      await runBvm(["alias", "my-alias", "1.0.0"]);
      
      // 2. Try to overwrite (should fail)
      const { exitCode, allOutput } = await runBvm(["alias", "my-alias", "1.0.0"]);
      expect(exitCode).not.toBe(0);
      expect(allOutput).toContain("already exists");
      
      // 3. 'default' alias SHOULD allow overwrite
      const res = await runBvm(["alias", "default", "1.0.0"]);
      expect(res.exitCode).toBe(0);
  });

  test("unalias works", async () => {
    await runBvm(["unalias", "my-alias"]);
    const { allOutput } = await runBvm(["ls"]);
    expect(allOutput).not.toContain("my-alias ->");
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
    await mkdirSync(projectDir, { recursive: true });
    await writeFileSync(join(projectDir, ".bvmrc"), "1.0.0");

    await runBvm(["deactivate"]);
    
    // bvm current should pick up .bvmrc
    const { allOutput } = await runBvm(["current"], projectDir);
    expect(allOutput).toContain("v1.0.0 (.bvmrc)");
  });

  // --- Cleanup ---
  test("uninstall active version (but not default) should work", async () => {
    // 1. Install 1.0.0 and 1.3.4
    await runBvm(["install", "1.0.0"]);
    await runBvm(["install", "1.3.4"]);
    // 2. Set 1.3.4 as default, but use 1.0.0 (active via current symlink)
    await runBvm(["alias", "default", "1.3.4"]);
    await runBvm(["use", "1.0.0"]);
    
    // 3. Try to uninstall 1.0.0
    const { exitCode } = await runBvm(["uninstall", "1.0.0"]);
    expect(exitCode).toBe(0);
  });

  test("uninstall default version fails", async () => {
    // 1. Set 1.3.4 as default
    await runBvm(["install", "1.3.4"]);
    await runBvm(["alias", "default", "1.3.4"]);
    
    // 2. Try to uninstall
    const { exitCode, allOutput } = await runBvm(["uninstall", "1.3.4"]);
    expect(exitCode).not.toBe(0);
    expect(allOutput).toContain("currently set as default");
  });

  test("uninstall 1.0.0 works", async () => {
    // 1. Ensure 1.0.0 and 1.3.4 are installed
    await runBvm(["install", "1.0.0"]);
    await runBvm(["install", "1.3.4"]);
    
    // 2. Switch default away from 1.0.0
    await runBvm(["alias", "default", "1.3.4"]);
    await runBvm(["use", "1.3.4"]);

    // 3. Uninstall
    const { exitCode } = await runBvm(["uninstall", "1.0.0"]);
    expect(exitCode).toBe(0);
    const binPath = join(TEST_BVM_DIR, "versions", "v1.0.0", "bin", "bun");
    expect(await Bun.file(binPath).exists()).toBe(false);
  });

  test("cache clear", async () => {
    const { exitCode } = await runBvm(["cache", "clear"]);
    expect(exitCode).toBe(0);
  });

  test("unknown command prints help but exits cleanly", async () => {
    const { exitCode, allOutput } = await runBvm(["definitely-unknown"]);
    expect(exitCode).toBe(0);
    expect(allOutput).toContain("Unknown command 'definitely-unknown'");
  });
}, 120000);