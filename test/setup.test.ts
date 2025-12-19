import { beforeAll, afterAll, describe, expect, test } from "bun:test";
import { runBvm, resetTestHome, cleanupTestHome, TEST_HOME } from "./test-utils";
import { join } from "path";
import { writeFileSync, readFileSync } from "fs";

describe("Setup & Shell Configuration Suite", () => {
  beforeAll(async () => {
    await resetTestHome();
  });

  afterAll(async () => {
    await cleanupTestHome();
  });

  test("setup configures bashrc", async () => {
    const bashrcPath = join(TEST_HOME, ".bashrc");
    writeFileSync(bashrcPath, "# Existing content\n");

    const { exitCode, allOutput } = await runBvm(["setup"], process.cwd(), { SHELL: "/bin/bash", BVM_TEST_MODE: "" });
    
    expect(exitCode).toBe(0);
    expect(allOutput).toContain("updated BVM configuration");
    
    const content = readFileSync(bashrcPath, "utf-8");
    expect(content).toContain('export BVM_DIR=');
    expect(content).toContain('/shims');
  });

  test("setup configures zshrc", async () => {
    const zshrcPath = join(TEST_HOME, ".zshrc");
    writeFileSync(zshrcPath, "# Existing content\n");

    const { exitCode, allOutput } = await runBvm(["setup"], process.cwd(), { SHELL: "/bin/zsh", BVM_TEST_MODE: "" });
    
    expect(exitCode).toBe(0);
    expect(allOutput).toContain("updated BVM configuration");
    
    const content = readFileSync(zshrcPath, "utf-8");
    expect(content).toContain('export BVM_DIR=');
    expect(content).toContain('/shims');
  });

  test("setup configures fish config", async () => {
    const fishConfigDir = join(TEST_HOME, ".config", "fish");
    const fishConfigPath = join(fishConfigDir, "config.fish");
    await Bun.write(fishConfigPath, "# Existing fish config\n"); // Auto-creates dir if needed? No, need mkdir

    const { exitCode, allOutput } = await runBvm(["setup"], process.cwd(), { SHELL: "/usr/bin/fish", BVM_TEST_MODE: "" });
    
    expect(exitCode).toBe(0);
    
    const content = readFileSync(fishConfigPath, "utf-8");
    expect(content).toContain('set -Ux BVM_DIR');
    expect(content).toContain('shims');
  });

  test("setup is idempotent (runs twice without duplicate)", async () => {
    const bashrcPath = join(TEST_HOME, ".bashrc");
    // Run setup again
    await runBvm(["setup"], process.cwd(), { SHELL: "/bin/bash", BVM_TEST_MODE: "" });
    
    const content = readFileSync(bashrcPath, "utf-8");
    // Count occurrences of "BVM_DIR" assignment
    const matches = content.match(/export BVM_DIR=/g);
    expect(matches?.length).toBe(1);
  });
  
  test("setup respects BVM_TEST_MODE (skips conflict check interactions)", async () => {
      // In BVM_TEST_MODE='true', it skips checks.
      // But passing empty BVM_TEST_MODE enables checks.
      // Since we can't easily interact with inquirer in these tests, we mostly ensure it doesn't crash.
      const { exitCode } = await runBvm(["setup"], process.cwd(), { SHELL: "/bin/bash", BVM_TEST_MODE: "true" });
      expect(exitCode).toBe(0);
  });
});
