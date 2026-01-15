import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { getSandboxDir, setupSandbox, cleanupSandbox, runBvm, runInstallScript } from "./e2e-utils";
import { execa } from "execa";
import { join } from "path";

describe("BVM E2E: Shim & Isolation", () => {
    let sandboxDir: string;
    let bvmShimsDir: string;

    beforeAll(async () => {
        sandboxDir = getSandboxDir();
        setupSandbox(sandboxDir);
        bvmShimsDir = join(sandboxDir, ".bvm", "shims");
        
        // 1. Install BVM first to get shims
        await runInstallScript(sandboxDir);
    }, 120000);

    afterAll(() => {
        cleanupSandbox(sandboxDir);
    });

    it("should redirect 'bun' command via shim", async () => {
        // Install a specific version
        const installRes = await runBvm(["install", "1.0.0"], sandboxDir);
        expect(installRes.exitCode).toBe(0);
        
        const useRes = await runBvm(["use", "1.0.0"], sandboxDir);
        expect(useRes.exitCode).toBe(0);

        // Execute 'bun --version' with the sandbox shims in PATH
        const result = await execa("bun", ["--version"], {
            cwd: sandboxDir,
            env: {
                ...process.env,
                PATH: `${bvmShimsDir}${process.platform === "win32" ? ";" : ":"}${process.env.PATH}`,
                BVM_DIR: join(sandboxDir, ".bvm"),
                HOME: sandboxDir,
                USERPROFILE: sandboxDir
            }
        });

        expect(result.stdout.trim()).toBe("1.0.0");
    }, 120000);

    it("should switch version correctly in sub-process", async () => {
        // Install another version
        const installRes = await runBvm(["install", "1.2.23"], sandboxDir);
        if (installRes.exitCode !== 0) {
             console.log("Install 1.2.23 Failed:", installRes.all);
        }
        expect(installRes.exitCode).toBe(0);

        const useRes = await runBvm(["use", "1.2.23"], sandboxDir);
        expect(useRes.exitCode).toBe(0);

        // Execute 'bun --version' again
        const result = await execa("bun", ["--version"], {
            cwd: sandboxDir,
            env: {
                ...process.env,
                PATH: `${bvmShimsDir}${process.platform === "win32" ? ";" : ":"}${process.env.PATH}`,
                BVM_DIR: join(sandboxDir, ".bvm"),
                HOME: sandboxDir,
                USERPROFILE: sandboxDir
            }
        });

        expect(result.stdout.trim()).toBe("1.2.23");
    }, 120000);
});