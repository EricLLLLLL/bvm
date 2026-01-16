import { join } from "path";
import { rmSync, mkdirSync, existsSync, readdirSync, readFileSync, writeFileSync, chmodSync, symlinkSync } from "fs";
import { execa } from "execa";
import { tmpdir } from "os";
import { randomBytes } from "crypto";

export function getSandboxDir() {
    const id = randomBytes(4).toString("hex");
    return join(tmpdir(), `bvm-e2e-${id}`);
}

export function setupSandbox(dir: string) {
    if (existsSync(dir)) {
        rmSync(dir, { recursive: true, force: true });
    }
    mkdirSync(dir, { recursive: true });
}

export function cleanupSandbox(dir: string) {
    rmSync(dir, { recursive: true, force: true });
}

export interface RunResult {
    stdout: string;
    stderr: string;
    exitCode: number;
    all: string;
}

export function getInstalledVersions(sandboxDir: string): string[] {
    const versionsDir = join(sandboxDir, ".bvm", "versions");
    if (!existsSync(versionsDir)) return [];
    return readdirSync(versionsDir);
}

export function getAlias(sandboxDir: string, aliasName: string): string | null {
    const aliasFile = join(sandboxDir, ".bvm", "aliases", aliasName);
    if (!existsSync(aliasFile)) return null;
    return readFileSync(aliasFile, "utf-8").trim();
}

// Simple ANSI stripper
const stripAnsi = (str: string) => str.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');

export async function runBvm(args: string[], sandboxDir: string, env: Record<string, string> = {}): Promise<RunResult> {
    const bvmBin = join(process.cwd(), "src/index.ts");
    
    // Set up environment to point to sandbox
    const sandboxEnv: Record<string, string> = {
        ...process.env,
        HOME: sandboxDir,
        USERPROFILE: sandboxDir, // Windows equivalent
        BVM_DIR: join(sandboxDir, ".bvm"),
        BVM_TEST_MODE: "true",
        NO_COLOR: "1", // Try to disable colors
        ...env
    };

    try {
        const result = await execa("bun", ["run", bvmBin, ...args], {
            env: sandboxEnv,
            reject: false,
            all: true,
            timeout: 60000
        });

        const stdout = stripAnsi(result.stdout);
        const stderr = stripAnsi(result.stderr);
        const all = stripAnsi(result.all ?? "");

        return {
            stdout,
            stderr,
            exitCode: result.exitCode ?? 1,
            all
        };
    } catch (error: any) {
        const stdout = stripAnsi(error.stdout ?? "");
        const stderr = stripAnsi(error.stderr ?? "");
        const all = stripAnsi((error.stdout ?? "") + (error.stderr ?? ""));

        return {
            stdout,
            stderr,
            exitCode: error.exitCode ?? 1,
            all
        };
    }
}

export async function runInstallScript(sandboxDir: string, env: Record<string, string> = {}): Promise<RunResult> {
    const isWindows = process.platform === "win32";
    const scriptPath = isWindows 
        ? join(process.cwd(), "install.ps1") 
        : join(process.cwd(), "install.sh");

    const sandboxEnv: Record<string, string> = {
        ...process.env,
        HOME: sandboxDir,
        USERPROFILE: sandboxDir,
        BVM_DIR: join(sandboxDir, ".bvm"),
        BVM_TEST_MODE: "true",
        ...env
    };

    if (isWindows) {
        const result = await execa("powershell", ["-ExecutionPolicy", "Bypass", "-File", scriptPath], {
            env: sandboxEnv,
            reject: false,
            all: true,
            timeout: 60000
        });
        return {
            stdout: stripAnsi(result.stdout),
            stderr: stripAnsi(result.stderr),
            exitCode: result.exitCode ?? 1,
            all: stripAnsi(result.all ?? "")
        };
    } else {
        const result = await execa("sh", [scriptPath], {
            env: sandboxEnv,
            reject: false,
            all: true,
            timeout: 60000
        });
        return {
            stdout: stripAnsi(result.stdout),
            stderr: stripAnsi(result.stderr),
            exitCode: result.exitCode ?? 1,
            all: stripAnsi(result.all ?? "")
        };
    }
}

export function mockRuntime(sandboxDir: string, version: string) {
    const runtimeDir = join(sandboxDir, ".bvm", "runtime", `v${version}`, "bin");
    mkdirSync(runtimeDir, { recursive: true });
    
    const bunPath = join(runtimeDir, process.platform === "win32" ? "bun.exe" : "bun");
    
    // Symlink system bun (which is running this test) to the mock location
    // This allows bvm (which is JS) to run using this runtime without downloading.
    try {
        if (existsSync(bunPath)) rmSync(bunPath);
        symlinkSync(process.execPath, bunPath);
    } catch (e) {
        console.error("Failed to symlink bun:", e);
    }
}