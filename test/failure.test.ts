import { beforeAll, afterAll, describe, expect, test } from "bun:test";
import { runBvm, resetTestHome, cleanupTestHome, TEST_HOME } from "./test-utils";
import { join, dirname } from "path";
import { rmSync, mkdirSync, chmodSync } from "fs";

describe("Failure & Edge Cases Suite", () => {
  beforeAll(async () => {
    await resetTestHome();
    await runBvm(["install", "1.0.0"]);
  });

  afterAll(async () => {
    await cleanupTestHome();
  });

  // --- Install Failures ---
  test("install fails if version not found in remote (simulated)", async () => {
      // In TEST_MODE, fetchBunVersions returns a fixed list. 
      // If we ask for a version not in that list and fuzzy matching fails?
      // Actually fuzzy matching might try its best.
      // But let's try a very weird version.
      const { exitCode, allOutput } = await runBvm(["install", "999.999.999"]);
      expect(exitCode).not.toBe(0);
      expect(allOutput).toContain("not found on registry");
  });

  // --- Use Failures ---
  test("use fails if version directory exists but binary is missing (corrupt install)", async () => {
      // 1. Install valid version
      await runBvm(["install", "1.2.23"]);
      
      // 2. Corrupt it by removing the binary
      const binPath = join(TEST_HOME, ".bvm", "versions", "v1.2.23", "bin", "bun");
      rmSync(binPath);

            // 3. Try to use it
            const { exitCode, allOutput } = await runBvm(["use", "1.2.23"]);
      
            expect(exitCode).not.toBe(0);
            expect(allOutput).toContain("Failed to switch to Bun 1.2.23");
        });
  // --- Uninstall Failures ---
  test("uninstall fails for non-existent version", async () => {
      const { exitCode, allOutput } = await runBvm(["uninstall", "5.5.5"]);
      expect(exitCode).not.toBe(0);
      expect(allOutput).toContain("not installed");
  });

  // --- Permission Issues (Mocked via read-only dir) ---
  test("install fails on read-only BVM_DIR", async () => {
      // Create a read-only versions dir
      // Use a separate subdirectory inside TEST_HOME to ensure we don't lock the root
      const customHome = join(TEST_HOME, "ro_home");
      const customBvm = join(customHome, ".bvm");
      // BVM install creates 'versions' inside BVM_DIR.
      // We want to make the PARENT of 'versions' read-only so mkdir fails, 
      // or make 'versions' read-only so writing inside fails.
      // Let's make .bvm read-only so it can't create 'versions' or 'cache'.
      await mkdirSync(customBvm, { recursive: true });
      
      try {
        chmodSync(customBvm, 0o500); // Read/Execute only, no Write

        const { exitCode, allOutput } = await runBvm(["install", "1.0.0"], process.cwd(), { HOME: customHome });
      
        // Should fail to create directory/write
        expect(exitCode).not.toBe(0);
        expect(allOutput).toMatch(/EACCES|permission denied/i);
      } finally {
        // Cleanup (chmod back to delete)
        chmodSync(customBvm, 0o777);
        // rmSync handled by afterAll or resetTestHome
      }
  });
});
