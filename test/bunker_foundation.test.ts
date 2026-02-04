import { test, expect, describe, beforeEach, afterEach } from "bun:test";
import { join } from "path";
import { lstat } from "fs/promises";
import { tmpdir } from "os";
import { existsSync } from "fs";

describe("Bunker Foundation (Phase 1)", () => {
    const TEST_VERSION = "1.1.21";
    const normalized = `v${TEST_VERSION}`;

    let tempHome = "";
    let bvmDir = "";
    let runtimeDir = "";
    let versionsDir = "";
    let bunExecutableName = process.platform === "win32" ? "bun.exe" : "bun";

    const runBvm = async (args: string[]) => {
        const scriptPath = join(process.cwd(), "src/index.ts");
        const bunExe = process.execPath;
        const proc = Bun.spawn([bunExe, "run", scriptPath, ...args], {
            env: {
                ...process.env,
                HOME: tempHome,
                USERPROFILE: tempHome,
                BVM_DIR: bvmDir,
                BVM_TEST_MODE: "true",
                NO_COLOR: "1",
            },
            stdout: "pipe",
            stderr: "pipe",
        });
        const out = await new Response(proc.stdout).text();
        const err = await new Response(proc.stderr).text();
        await proc.exited;
        return { exitCode: proc.exitCode, all: out + err };
    };

    beforeEach(async () => {
        tempHome = join(tmpdir(), `bvm-bunker-${Date.now()}-${Math.random().toString(16).slice(2)}`);
        bvmDir = join(tempHome, ".bvm");
        runtimeDir = join(bvmDir, "runtime", normalized);
        versionsDir = join(bvmDir, "versions", normalized);
    });

    afterEach(async () => {
        try {
            await Bun.$`rm -rf ${tempHome}`.nothrow();
        } catch {}
    });

    test("should install physical files to versions directory", async () => {
        const res = await runBvm(["install", TEST_VERSION]);
        expect(res.exitCode).toBe(0);

        const versionsBun = join(versionsDir, "bin", bunExecutableName);
        const versionsBunfig = join(versionsDir, "bunfig.toml");

        // 1. Verify physical version entry
        expect(existsSync(versionsBun)).toBe(true);
        expect(existsSync(versionsBunfig)).toBe(true);
        
        const stats = await lstat(versionsDir);
        // Windows uses junctions for directory links; POSIX uses symlinks.
        if (process.platform === "win32") {
            expect(stats.isDirectory()).toBe(true);
            expect(stats.isSymbolicLink()).toBe(false);
        } else {
            expect(stats.isSymbolicLink()).toBe(true);
        }

        // 2. Verify bunfig content
        const bunfigContent = await Bun.file(versionsBunfig).text();
        expect(bunfigContent).toContain(`globalDir =`);
        // bunfig anchors to the physical runtime directory.
        const expectedPhysical = process.platform === "win32"
            ? runtimeDir.replace(/\//g, "\\").replace(/\\/g, "\\\\")
            : runtimeDir;
        expect(bunfigContent).toContain(expectedPhysical);
    }, 30000);

    test("should skip download and auto-switch if version already exists", async () => {
        const first = await runBvm(["install", TEST_VERSION]);
        expect(first.exitCode).toBe(0);

        const second = await runBvm(["install", TEST_VERSION]);
        expect(second.exitCode).toBe(0);
        expect(second.all).not.toContain("Downloading");
    }, 30000);
});
