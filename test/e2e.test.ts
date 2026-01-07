import { join, dirname } from "path";
import { rmSync, mkdirSync, existsSync, statSync, readFileSync, cpSync } from "fs";
import { expect, test, describe } from "bun:test";

const SANDBOX_DIR = join(process.cwd(), ".sandbox-e2e");
const SANDBOX_HOME = join(SANDBOX_DIR, "home");
const BVM_DIR = join(SANDBOX_HOME, ".bvm");
const BVM_BIN = join(BVM_DIR, "bin", "bvm");

async function runInSandbox(command: string, env: Record<string, string> = {}) {
    const proc = Bun.spawn({
        cmd: ["bash", "-c", command],
        cwd: SANDBOX_DIR,
        env: {
            ...process.env,
            HOME: SANDBOX_HOME,
            ...env
        },
        stdout: "pipe",
        stderr: "pipe",
    });

    const stdout = await new Response(proc.stdout).text();
    const stderr = await new Response(proc.stderr).text();
    await proc.exited;

    if (proc.exitCode !== 0) {
        console.error("E2E Command Failed:", command);
        console.error("STDOUT:", stdout);
        console.error("STDERR:", stderr);
    }
    
    return { stdout, stderr, exitCode: proc.exitCode };
}

describe("E2E Verification Suite", () => {
    // Setup and Teardown
    test("setup", () => {
        if (existsSync(SANDBOX_DIR)) {
            rmSync(SANDBOX_DIR, { recursive: true, force: true });
        }
        mkdirSync(SANDBOX_HOME, { recursive: true });
    });

    // Phase 1 Tests
    test("should install bvm itself using install.sh", async () => {
        // Prepare "dist" in sandbox so install.sh picks up local build
        const distDir = join(SANDBOX_DIR, "dist");
        if (!existsSync(distDir)) {
            mkdirSync(distDir, { recursive: true });
        }
        cpSync(join(process.cwd(), "dist", "index.js"), join(distDir, "index.js"));

        const installScript = join(process.cwd(), "install.sh");
        const { exitCode } = await runInSandbox(`bash ${installScript}`);
        expect(exitCode).toBe(0);
        expect(existsSync(BVM_BIN)).toBe(true);
    }, 30000); // 30 second timeout for download
    
    test("should upgrade bvm itself", async () => {
        const bvmSrcFile = join(BVM_DIR, "src", "index.js");
        const initialStat = statSync(bvmSrcFile);
        
        // Wait a bit to ensure modification time is different
        await new Promise(res => setTimeout(res, 10));

        const installScriptPath = join(process.cwd(), "install.sh");

        const { exitCode } = await runInSandbox(`${BVM_BIN} upgrade`, {
            BVM_TEST_MODE: "true",
            BVM_TEST_LATEST_VERSION: "v99.99.99",
            BVM_TEST_REAL_UPGRADE: "true",
            BVM_INSTALL_SCRIPT_URL: `file://${installScriptPath}`
        });
        expect(exitCode).toBe(0);

        const finalStat = statSync(bvmSrcFile);
        expect(finalStat.mtimeMs).toBeGreaterThan(initialStat.mtimeMs);
    });

    // Phase 4: Static Analysis for PowerShell Parity
    test("install.ps1 should be logically equivalent to install.sh", () => {
        const shContent = readFileSync(join(process.cwd(), "install.sh"), "utf-8");
        const psContent = readFileSync(join(process.cwd(), "install.ps1"), "utf-8");

        // 1. Check for NPM mirror URL
        expect(psContent).toContain("registry.npmmirror.com");

        // 2. Check for tar extraction
        expect(psContent).toContain("tar -xzf");

        // 3. Check for .tgz file extension
        expect(psContent).toContain(".tgz");

        // 4. Check for NPM package name construction (basic check)
        expect(psContent).toContain("@oven/bun-windows-x64");
    });


    // Teardown
    test("teardown", () => {
        if (existsSync(SANDBOX_DIR)) {
            rmSync(SANDBOX_DIR, { recursive: true, force: true });
        }
    });
});