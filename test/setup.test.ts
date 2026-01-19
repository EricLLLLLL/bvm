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

  test("setup is idempotent (runs twice without duplicate)", async () => {
    const bashrcPath = join(TEST_HOME, ".bashrc");
    // Ensure we start with a clean state or known single state
    writeFileSync(bashrcPath, "# Existing content\n");
    
    // First run
    await runBvm(["setup"], process.cwd(), { SHELL: "/bin/bash", BVM_TEST_MODE: "true" });
    // Second run
    await runBvm(["setup"], process.cwd(), { SHELL: "/bin/bash", BVM_TEST_MODE: "true" });
    
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
