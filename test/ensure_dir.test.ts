import { describe, expect, test, afterAll, beforeAll } from "bun:test";
import { ensureDir } from "../src/utils";
import { join } from "path";
import { rm, stat, writeFile, mkdir } from "fs/promises";
import { TEST_HOME } from "./test-utils";

describe("ensureDir Robustness", () => {
    const tmpDir = join(TEST_HOME, "ensure_dir_test");

    beforeAll(async () => {
        await mkdir(TEST_HOME, { recursive: true });
        await rm(tmpDir, { recursive: true, force: true });
        await mkdir(tmpDir, { recursive: true });
    });

    afterAll(async () => {
        await rm(tmpDir, { recursive: true, force: true });
    });

    test("should succeed if directory already exists", async () => {
        const target = join(tmpDir, "existing_dir");
        await mkdir(target);
        
        await ensureDir(target);
        
        const stats = await stat(target);
        expect(stats.isDirectory()).toBe(true);
    });

    test("should throw if file exists at path", async () => {
        const target = join(tmpDir, "file_blocking_dir");
        await writeFile(target, "blocker");
        
        // ensureDir should throw because it's a file, not a directory
        // And our logic re-throws if it's not a directory
        let error;
        try {
            await ensureDir(target);
        } catch (e) {
            error = e;
        }
        
        expect(error).toBeDefined();
        // The error code might vary depending on platform/bun version but usually EEXIST or ENOTDIR
        // Our code throws the original error which is EEXIST
        expect(error.code).toBe("EEXIST"); 
    });
});
