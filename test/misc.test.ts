import { beforeAll, afterAll, describe, expect, test } from "bun:test";
import { runBvm, resetTestHome, cleanupTestHome, TEST_HOME } from "./test-utils";
import { join } from "path";
import { existsSync } from "fs";

describe("Miscellaneous Commands Suite", () => {
  beforeAll(async () => {
    await resetTestHome();
    await runBvm(["install", "1.0.0"]);
  });

  afterAll(async () => {
    await cleanupTestHome();
  });

  // --- Doctor ---
  test("doctor prints diagnostic info", async () => {
    const { exitCode, allOutput } = await runBvm(["doctor"]);
    expect(exitCode).toBe(0);
    expect(allOutput).toContain("BVM_DIR");
    expect(allOutput).toContain("HOME");
    expect(allOutput).toContain("Installed Versions");
    expect(allOutput).toContain("Aliases");
    expect(allOutput).toContain("Diagnostics complete");
  });

  // --- Completion ---
  test("completion bash outputs script", async () => {
    const { exitCode, output } = await runBvm(["completion", "bash"]);
    expect(exitCode).toBe(0);
    expect(output).toContain("_bvm_completions");
    expect(output).toContain("complete -F");
    expect(output).toContain("deactivate"); // Ensure our fix is present
  });

  test("completion zsh outputs script", async () => {
    const { exitCode, output } = await runBvm(["completion", "zsh"]);
    expect(exitCode).toBe(0);
    expect(output).toContain("#compdef bvm");
  });

  test("completion fish outputs script", async () => {
    const { exitCode, output } = await runBvm(["completion", "fish"]);
    expect(exitCode).toBe(0);
    expect(output).toContain("complete -c bvm");
  });

  // --- Cache ---
  test("cache dir shows path", async () => {
    const { exitCode, output } = await runBvm(["cache", "dir"]);
    expect(exitCode).toBe(0);
    expect(output).toContain(".bvm/cache");
  });
  
  // --- Deactivate ---
    test("deactivate removes default alias", async () => {
      // 1. Ensure a version is active (sets default)
      await runBvm(["use", "1.0.0"]);
      const defaultAliasPath = join(TEST_HOME, ".bvm", "aliases", "default");
      
      // Verify alias exists
      expect(existsSync(defaultAliasPath)).toBe(true);

      // 2. Run deactivate
      const { exitCode } = await runBvm(["deactivate"]);
      expect(exitCode).toBe(0);

      // 3. Verify alias is gone
      expect(existsSync(defaultAliasPath)).toBe(false);
    });
});
