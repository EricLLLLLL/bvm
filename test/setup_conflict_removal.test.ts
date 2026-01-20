import { beforeAll, afterAll, describe, expect, test } from "bun:test";
import { runBvm, resetTestHome, cleanupTestHome, TEST_HOME } from "./test-utils";
import { join } from "path";
import { mkdirSync, writeFileSync, chmodSync } from "fs";

describe("Setup Conflict Removal", () => {
  const mockOfficialBunDir = join(TEST_HOME, ".bun");
  const mockOfficialBunBin = join(mockOfficialBunDir, "bin");
  const mockOfficialBunExe = join(mockOfficialBunBin, "bun");

  beforeAll(async () => {
    await resetTestHome();
    // Create fake official bun
    mkdirSync(mockOfficialBunBin, { recursive: true });
    writeFileSync(mockOfficialBunExe, "echo 'Official Bun'");
    chmodSync(mockOfficialBunExe, 0o755);
  });

  afterAll(async () => {
    await cleanupTestHome();
  });

  test("Should NOT warn about official bun conflicts", async () => {
    // We need to put the official bun in the PATH for checkConflicts to find it.
    const newPath = `${mockOfficialBunBin}:${process.env.PATH}`;
    
    // Run setup with BVM_TEST_MODE="" to enable conflict checks (if they exist)
    const { allOutput, exitCode } = await runBvm(["setup"], process.cwd(), { 
        PATH: newPath,
        BVM_TEST_MODE: "" 
    });

    expect(exitCode).toBe(0);
    // The goal is to remove this warning
    expect(allOutput).not.toContain("OFFICIAL BUN DETECTED");
    expect(allOutput).not.toContain("ANOTHER BUN DETECTED");
  });
});
