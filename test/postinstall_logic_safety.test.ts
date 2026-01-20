// test/postinstall_logic_safety.test.ts
import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { rm, mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { execSync } from "child_process";

const TEST_DIR = join(import.meta.dir, ".tmp_postinstall_safety");
const SCRIPT_PATH = join(import.meta.dir, "..", "scripts", "postinstall.js");

describe("postinstall.js safety checks", () => {
    beforeAll(async () => {
        await rm(TEST_DIR, { recursive: true, force: true });
        await mkdir(TEST_DIR, { recursive: true });
    });

    afterAll(async () => {
        await rm(TEST_DIR, { recursive: true, force: true });
    });

    test("should handle gracefully if source and dest are same during bootstrap", async () => {
        const bvmDir = join(TEST_DIR, ".bvm");
        const version = "1.3.6";
        const verDir = join(bvmDir, "versions", `v${version}`);
        const binDir = join(verDir, "bin");
        const bunBin = join(binDir, "bun");

        await mkdir(binDir, { recursive: true });
        await writeFile(bunBin, "#!/bin/sh\necho 1.3.6"); // Mock bun returning version
        await execSync(`chmod +x ${bunBin}`);

        const env = {
            ...process.env,
            BVM_DIR: bvmDir,
            HOME: TEST_DIR,
            PATH: `${binDir}:${process.env.PATH}`,
        };

        try {
            execSync(`node ${SCRIPT_PATH}`, { env: env as any, stdio: 'pipe' });
        } catch (e: any) {
            const stderr = e.stderr ? e.stderr.toString() : "";
            // If the bug exists, node throws an error about identical paths
            if (stderr.includes("Source and destination must not be the same")) {
                 // Test Passes: We confirmed the bug exists (Red Phase)
                 // But wait, in TDD, Red Phase means "Test Fails" (assertion fails).
                 // Here, we want to assert that the script *SUCCEEDS* (handles it gracefully).
                 // So if it throws, the test fails -> Red Phase.
                 throw new Error("Script failed due to identical copy paths: " + stderr);
            }
            throw e; 
        }
        
        // If we get here, the script succeeded, meaning no bug or bug fixed.
    });
});
