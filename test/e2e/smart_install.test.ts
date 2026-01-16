import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { getSandboxDir, setupSandbox, cleanupSandbox, runInstallScript } from "./e2e-utils";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

describe("Smart Install Source Switching", () => {
    let sandboxDir: string;

    beforeEach(() => {
        sandboxDir = getSandboxDir();
        setupSandbox(sandboxDir);
    });

    afterEach(() => {
        cleanupSandbox(sandboxDir);
    });

    it("should default to unpkg when no specific mirror is detected", async () => {
        // Run with an environment that makes elemecdn fail or slow
        const result = await runInstallScript(sandboxDir, { 
            BVM_TEST_FORCE_GLOBAL: "true" 
        });
        expect(result.exitCode).toBe(0);
        expect(result.all).toContain("(global)");
    }, 30000);

    it("should switch to elemecdn when CN environment is detected", async () => {
        // Run with an environment that makes elemecdn look fast
        const result = await runInstallScript(sandboxDir, { 
            BVM_TEST_FORCE_CN: "true" 
        });
        expect(result.exitCode).toBe(0);
        expect(result.all).toContain("(cn)");
    }, 30000);
});
