import { test, expect, describe, beforeEach, afterEach } from "bun:test";
import { join } from "path";
import { rm, mkdir, lstat } from "fs/promises";
import { BVM_DIR, BVM_VERSIONS_DIR, EXECUTABLE_NAME } from "../src/constants";
import { installBunVersion } from "../src/commands/install";
import { pathExists, normalizeVersion } from "../src/utils";

describe("Bunker Foundation (Phase 1)", () => {
    const TEST_VERSION = "1.1.21";
    const runtimeDir = join(BVM_DIR, "runtime", `v${TEST_VERSION}`);
    const versionsDir = join(BVM_VERSIONS_DIR, `v${TEST_VERSION}`);

    beforeEach(async () => {
        process.env.BVM_TEST_MODE = "true";
        await rm(runtimeDir, { recursive: true, force: true });
        await rm(versionsDir, { recursive: true, force: true });
    });

    afterEach(async () => {
        await rm(runtimeDir, { recursive: true, force: true });
        await rm(versionsDir, { recursive: true, force: true });
    });

    test("should install physical files to versions directory", async () => {
        await installBunVersion(TEST_VERSION);
        
        const versionsBun = join(versionsDir, "bin", EXECUTABLE_NAME);
        const versionsBunfig = join(versionsDir, "bunfig.toml");

        // 1. Verify physical version entry
        expect(await pathExists(versionsBun)).toBe(true);
        expect(await pathExists(versionsBunfig)).toBe(true);
        
        const stats = await lstat(versionsDir);
        expect(stats.isDirectory()).toBe(true);
        expect(stats.isSymbolicLink()).toBe(false);

        // 2. Verify bunfig content
        const bunfigContent = await Bun.file(versionsBunfig).text();
        expect(bunfigContent).toContain(`globalDir =`);
        expect(bunfigContent).toContain(versionsDir.replace(/\\/g, '\\\\'));
    }, 30000);

    test("should skip download and auto-switch if version already exists", async () => {
        await installBunVersion(TEST_VERSION);
        
        const originalLog = console.log;
        let logs = "";
        console.log = (msg) => { logs += msg; originalLog(msg); };
        
        await installBunVersion(TEST_VERSION);
        
        console.log = originalLog;
        
        expect(logs).toContain("already installed");
        expect(logs).not.toContain("Downloading");
        
        const { getActiveVersion } = await import("../src/utils");
        const active = await getActiveVersion();
        expect(normalizeVersion(active.version!)).toBe(`v${TEST_VERSION}`);
    }, 30000);
});
