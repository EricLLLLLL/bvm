import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { getSandboxDir, setupSandbox, cleanupSandbox, runBvm, runInstallScript } from "./e2e-utils";
import { existsSync } from "fs";
import { join } from "path";

describe("BVM E2E: Maintenance Commands", () => {
    let sandboxDir: string;

    beforeAll(async () => {
        sandboxDir = getSandboxDir();
        setupSandbox(sandboxDir);
        await runInstallScript(sandboxDir);
    }, 60000);

    afterAll(() => {
        cleanupSandbox(sandboxDir);
    });

    it("should run 'doctor'", async () => {
        const result = await runBvm(["doctor"], sandboxDir);
        expect(result.exitCode).toBe(0);
        expect(result.all).toContain("Diagnostics complete");
    });

    it("should run 'cache ls' and 'cache clear'", async () => {
        const lsResult = await runBvm(["cache", "ls"], sandboxDir);
        expect(lsResult.exitCode).toBe(0);

        const clearResult = await runBvm(["cache", "clear"], sandboxDir);
        expect(clearResult.exitCode).toBe(0);
        expect(clearResult.all).toContain("Cache cleared");
    });

    it("should run 'setup'", async () => {
        const result = await runBvm(["setup"], sandboxDir);
        expect(result.exitCode).toBe(0);
        // It might say "already up to date" because install script already ran setup
        expect(result.all).toMatch(/Successfully updated|already up to date/);
    });

    it("should run 'rehash'", async () => {
        const result = await runBvm(["rehash"], sandboxDir);
        expect(result.exitCode).toBe(0);
        expect(result.all).toContain("Regenerated");
        expect(result.all).toContain("shims");
    });

    it("should run 'deactivate'", async () => {
        const result = await runBvm(["deactivate"], sandboxDir);
        expect(result.exitCode).toBe(0);
        expect(result.all).toContain("Default Bun version deactivated");
    });

    it("should run 'upgrade' (mocked or no-op check)", async () => {
        const result = await runBvm(["upgrade"], sandboxDir);
        // Upgrade might fail in test if no release found or network issues, 
        // but it should at least try and not crash.
        // Given we are at v1.0.6 (latest in install.sh), it might say already up to date.
        expect(result.all).toMatch(/already up to date|Upgrading BVM|v1.0.6/i);
    });
});
