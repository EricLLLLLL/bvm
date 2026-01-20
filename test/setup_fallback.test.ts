// test/setup_fallback.test.ts
import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { rm, mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { configureShell } from "../src/commands/setup";

const TEST_HOME = join(import.meta.dir, ".tmp_setup_fallback");

describe("setup.ts fallback detection", () => {
    const originalEnv = { ...process.env };
    
    beforeAll(async () => {
        await rm(TEST_HOME, { recursive: true, force: true });
        await mkdir(TEST_HOME, { recursive: true });
    });

    afterAll(async () => {
        process.env = originalEnv;
        await rm(TEST_HOME, { recursive: true, force: true });
    });

    test("should fallback to .zshrc if SHELL is empty", async () => {
        process.env.HOME = TEST_HOME;
        process.env.SHELL = ""; // Clear SHELL to trigger fallback
        process.env.BVM_DIR = join(TEST_HOME, ".bvm");

        const zshrcPath = join(TEST_HOME, ".zshrc");
        await writeFile(zshrcPath, "# empty");

        await configureShell(false);

        const content = await Bun.file(zshrcPath).text();
        expect(content).toContain("export BVM_DIR=");
        expect(content).toContain("export PATH=");
    });
});
