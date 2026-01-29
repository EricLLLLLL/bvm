import { test, expect, describe, beforeEach, afterEach } from "bun:test";
import { join } from "path";
import { rm, mkdir, lstat } from "fs/promises";
import { EXECUTABLE_NAME, BVM_VERSIONS_DIR } from "../src/constants";
import { installBunVersion } from "../src/commands/install";
import { pathExists, normalizeVersion } from "../src/utils";

describe("Physical bunx existence", () => {
    const TEST_VERSION = "1.1.20";
    const versionDir = join(BVM_VERSIONS_DIR, `v${TEST_VERSION}`);

    beforeEach(async () => {
        // Ensure clean state
        process.env.BVM_TEST_MODE = "true";
        await rm(versionDir, { recursive: true, force: true });
    });

    afterEach(async () => {
        await rm(versionDir, { recursive: true, force: true });
    });

    test("should ensure bunx exists after installation", async () => {
        await installBunVersion(TEST_VERSION);
        
        const bunPath = join(versionDir, "bin", EXECUTABLE_NAME);
        const bunxName = EXECUTABLE_NAME.replace("bun", "bunx");
        const bunxPath = join(versionDir, "bin", bunxName);

        expect(await pathExists(bunPath)).toBe(true);
        expect(await pathExists(bunxPath)).toBe(true);
        
        // Verify it's either a symlink or a file
        const stats = await lstat(bunxPath);
        expect(stats.isFile() || stats.isSymbolicLink()).toBe(true);
    }, 30000);
});
