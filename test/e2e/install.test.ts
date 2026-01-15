import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { getSandboxDir, setupSandbox, cleanupSandbox, runInstallScript } from "./e2e-utils";
import { existsSync } from "fs";
import { join } from "path";

describe("BVM E2E: Installation", () => {
    let sandboxDir: string;

    beforeAll(() => {
        sandboxDir = getSandboxDir();
        setupSandbox(sandboxDir);
    });

    afterAll(() => {
        cleanupSandbox(sandboxDir);
    });

    it("should successfully run the installation script", async () => {
        const result = await runInstallScript(sandboxDir);
        
        // Log output if it fails for easier debugging
        if (result.exitCode !== 0) {
            console.log("Install Output:", result.all);
        }

        expect(result.exitCode).toBe(0);
        
        // Verify .bvm directory exists in sandbox
        const bvmDir = join(sandboxDir, ".bvm");
        expect(existsSync(bvmDir)).toBe(true);
        expect(existsSync(join(bvmDir, "bin"))).toBe(true);
    }, 60000);
});
