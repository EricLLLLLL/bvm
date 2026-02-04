import { test, expect, describe, beforeEach, afterEach } from "bun:test";
import { join } from "path";
import { tmpdir } from "os";
import { existsSync } from "fs";

describe("Physical bunx existence", () => {
    const TEST_VERSION = "1.1.20";
    const normalized = `v${TEST_VERSION}`;

    beforeEach(async () => {
        // no-op
    });

    afterEach(async () => {
        // no-op
    });

    test("should ensure bunx exists after installation", async () => {
        const tempHome = join(tmpdir(), `bvm-bunx-${Date.now()}-${Math.random().toString(16).slice(2)}`);
        const bvmDir = join(tempHome, ".bvm");
        const versionDir = join(bvmDir, "versions", normalized);
        const bunName = process.platform === "win32" ? "bun.exe" : "bun";
        const bunxName = process.platform === "win32" ? "bunx.exe" : "bunx";

        const scriptPath = join(process.cwd(), "src/index.ts");
        const bunExe = process.execPath;
        const proc = Bun.spawn([bunExe, "run", scriptPath, "install", TEST_VERSION], {
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
        await proc.exited;
        expect(proc.exitCode).toBe(0);

        const bunPath = join(versionDir, "bin", bunName);
        const bunxPath = join(versionDir, "bin", bunxName);

        expect(existsSync(bunPath)).toBe(true);
        expect(existsSync(bunxPath)).toBe(true);

        await Bun.$`rm -rf ${tempHome}`.nothrow();
    }, 30000);
});
