import { beforeAll, afterAll, describe, expect, test } from "bun:test";
import { runBvm, resetTestHome, cleanupTestHome, TEST_BVM_DIR, EXECUTABLE_NAME } from "./test-utils";
import { mkdir, symlink, writeFile } from "fs/promises";
import { join } from "path";
import { chmod } from "fs/promises";

describe("Rehash Cleanup Logic", () => {
  beforeAll(async () => {
    await resetTestHome();
    // Install a dummy version
    await runBvm(["install", "1.0.0"]);
  });

  afterAll(async () => {
    // await cleanupTestHome();
  });

  test("rehash removes legacy npm/yarn symlinks pointing to bun", async () => {
    const versionBinDir = join(TEST_BVM_DIR, "versions", "v1.0.0", "bin");
    const bunPath = join(versionBinDir, EXECUTABLE_NAME);
    
    // 1. Simulate the "bad state": create npm/yarn symlinks pointing to bun
    const badLinks = ["npm", "yarn", "pnpm"];
    for (const link of badLinks) {
      const linkPath = join(versionBinDir, link);
      // Create a relative symlink to ./bun (which is what the bug did)
      try {
        await symlink(`./${EXECUTABLE_NAME}`, linkPath);
      } catch (e) {
          // If it exists from install, force overwrite or ignore
      }
    }

    // Verify bad state exists
    for (const link of badLinks) {
      expect(await Bun.file(join(versionBinDir, link)).exists()).toBe(true);
    }

    // 2. Run rehash
    const result = await runBvm(["rehash"]);
    expect(result.exitCode).toBe(0);

    // 3. Verify cleanup: links should be GONE from version bin dir
    for (const link of badLinks) {
      expect(await Bun.file(join(versionBinDir, link)).exists()).toBe(false);
    }

    // 4. Verify shims: should NOT exist in shims dir either
    const shimsDir = join(TEST_BVM_DIR, "shims");
    for (const link of badLinks) {
        // Windows might have extensions, but we check base name
        // The rehash logic removes shims that aren't in the executables list
        const shimPath = join(shimsDir, link);
        // We need to check exact file or with extension
        // simpler: check if file exists. on unix it's just name.
        expect(await Bun.file(shimPath).exists()).toBe(false);
    }
  });

  test("rehash preserves real files (e.g. global installs)", async () => {
    const versionBinDir = join(TEST_BVM_DIR, "versions", "v1.0.0", "bin");
    
    // 1. Simulate a REAL global install (actual script/binary, not symlink to bun)
    const realToolName = "my-real-tool";
    const realToolPath = join(versionBinDir, realToolName);
    await writeFile(realToolPath, "#!/bin/sh\necho real");
    await chmod(realToolPath, 0o755);

    // 2. Run rehash
    await runBvm(["rehash"]);

    // 3. Verify: file still exists in bin dir
    expect(await Bun.file(realToolPath).exists()).toBe(true);

    // 4. Verify: shim IS created for it
    const shimPath = join(TEST_BVM_DIR, "shims", realToolName);
    expect(await Bun.file(shimPath).exists()).toBe(true);
  });
});
