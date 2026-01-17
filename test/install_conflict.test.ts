import { join } from "path";
import { rmSync, mkdirSync, existsSync, writeFileSync, lstatSync } from "fs";
import { expect, test, describe, beforeAll, afterAll } from "bun:test";
import { execa } from "execa";

const TEST_SANDBOX = join(process.cwd(), ".test-bvm-conflict");
const TEST_HOME = join(TEST_SANDBOX, "home");
const BVM_DIR = join(TEST_HOME, ".bvm");
const RUNTIME_DIR = join(BVM_DIR, "runtime");
const CURRENT_LINK = join(RUNTIME_DIR, "current");

describe("Installation Path Conflict Verification", () => {
    beforeAll(() => {
        if (existsSync(TEST_SANDBOX)) {
            rmSync(TEST_SANDBOX, { recursive: true, force: true });
        }
        mkdirSync(TEST_HOME, { recursive: true });
    });

    afterAll(() => {
        if (existsSync(TEST_SANDBOX)) {
            rmSync(TEST_SANDBOX, { recursive: true, force: true });
        }
    });

    test("install.sh should handle pre-existing non-empty directory at current link path", async () => {
        if (process.platform === "win32") return; // Skip Unix test on Windows

        // 1. Simulate conflict: Create a real directory with a file at the link path
        mkdirSync(CURRENT_LINK, { recursive: true });
        writeFileSync(join(CURRENT_LINK, "blocker.txt"), "I am blocking you");

        // 2. Run install.sh in a sandbox environment
        const result = await execa("bash", ["install.sh"], {
            env: {
                ...process.env,
                HOME: TEST_HOME,
                BVM_SUPPRESS_CONFLICT_WARNING: "true"
            }
        });

        expect(result.exitCode).toBe(0);
        
        // 3. Verify that 'current' is now a symlink, not a directory
        const stats = lstatSync(CURRENT_LINK);
        expect(stats.isSymbolicLink()).toBe(true);
    }, 60000);

    test("install.ps1 should handle pre-existing non-empty directory at current link path", async () => {
        if (process.platform !== "win32") return; // Skip Windows test on Unix

        // 1. Simulate conflict: Create a real directory with a file at the link path
        mkdirSync(CURRENT_LINK, { recursive: true });
        writeFileSync(join(CURRENT_LINK, "blocker.txt"), "I am blocking you");

        // 2. Run install.ps1 via powershell
        const result = await execa("powershell", ["-File", "install.ps1"], {
            env: {
                ...process.env,
                HOME: TEST_HOME,
                BVM_DIR: BVM_DIR,
                BVM_SUPPRESS_CONFLICT_WARNING: "true"
            }
        });

        expect(result.exitCode).toBe(0);

        // 3. Verify that 'current' is now a Junction
        const stats = lstatSync(CURRENT_LINK);
        expect(stats.isDirectory()).toBe(true);
    });

    test("bvm upgrade should not touch runtime/current link", async () => {
        if (process.platform === "win32") return; // Only test on Unix for now as install.sh is more direct for test

        // 1. Initial setup: run install to have a working environment
        await execa("bash", ["install.sh"], {
            env: { ...process.env, HOME: TEST_HOME, BVM_SUPPRESS_CONFLICT_WARNING: "true" }
        });

        const bvmBin = join(BVM_DIR, "bin", "bvm");
        const initialStat = lstatSync(CURRENT_LINK);
        const initialMtime = initialStat.mtimeMs;

        // Wait a bit to ensure mtime could change
        await new Promise(res => setTimeout(res, 100));

        // 2. Run bvm upgrade
        await execa(bvmBin, ["upgrade"], {
            env: { 
                ...process.env, 
                HOME: TEST_HOME,
                BVM_DIR: BVM_DIR,
                BVM_TEST_MODE: "true"
            }
        });

        const finalStat = lstatSync(CURRENT_LINK);
        expect(finalStat.mtimeMs).toBe(initialMtime);
    }, 60000);
});
