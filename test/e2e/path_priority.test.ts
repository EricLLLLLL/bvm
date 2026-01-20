// test/e2e/path_priority.test.ts
import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { rm, mkdir, writeFile, stat } from "fs/promises";
import { join } from "path";
import { execSync } from "child_process";

const TEST_DIR = join(import.meta.dir, ".tmp_path_priority");
const MOCK_HOME = join(TEST_DIR, "home");
const INSTALL_SH_PATH = join(import.meta.dir, "..", "..", "install.sh"); 
const OFFICIAL_BUN_DIR = join(MOCK_HOME, ".bun");
const OFFICIAL_BUN_BIN_DIR = join(OFFICIAL_BUN_DIR, "bin");
const OFFICIAL_BUN_BIN = join(OFFICIAL_BUN_BIN_DIR, "bun");

describe("BVM Path Priority & Coexistence", () => {
    beforeAll(async () => {
        await rm(TEST_DIR, { recursive: true, force: true });
        await mkdir(MOCK_HOME, { recursive: true });
        
        // 1. Setup Mock "Official Bun"
        await mkdir(OFFICIAL_BUN_BIN_DIR, { recursive: true });
        await writeFile(OFFICIAL_BUN_BIN, "#!/bin/sh\necho 'official bun'");
        await execSync(`chmod +x ${OFFICIAL_BUN_BIN}`);
    });

    afterAll(async () => {
        await rm(TEST_DIR, { recursive: true, force: true });
    });

    test("BVM shims should take priority over official bun path", async () => {
        // 2. Simulate environment where official bun is already in PATH
        const initialPath = `${OFFICIAL_BUN_BIN_DIR}:${process.env.PATH || ""}`;
        
        const env: NodeJS.ProcessEnv = {
            ...process.env,
            HOME: MOCK_HOME,
            PATH: initialPath,
            BVM_DIR: join(MOCK_HOME, ".bvm"),
        };

        // 3. Run BVM Installation
        try {
            execSync(`bash ${INSTALL_SH_PATH}`, { cwd: MOCK_HOME, env: env as any, stdio: 'pipe' });
        } catch (e: any) {
            // Ignore potential network errors during download, we care about shims
            console.log("Install script finished (may have network warnings).");
        }

        // 4. Verify which bun
        const bvmShimsDir = join(MOCK_HOME, ".bvm", "shims");
        const bvmBunShim = join(bvmShimsDir, "bun");
        
        const shimExists = await stat(bvmBunShim).then(() => true).catch(() => false);
        expect(shimExists).toBe(true);

        // 5. Simulate a new shell session by prepending BVM shims to PATH
        // This is exactly what BVM setup instructions tell the user to do (via .zshrc/.bashrc)
        const updatedPath = `${bvmShimsDir}:${initialPath}`;
        
        // 6. Execute 'which bun' in this simulated shell
        const whichResult = execSync(`which bun`, { env: { ...env, PATH: updatedPath } as any }).toString().trim();
        
        // It should point to BVM shim, NOT the official bun path
        expect(whichResult).toBe(bvmBunShim);
        expect(whichResult).not.toBe(OFFICIAL_BUN_BIN);
        
        // 7. Verify coexistence: Official bun is still there
        const officialExists = await stat(OFFICIAL_BUN_BIN).then(() => true).catch(() => false);
        expect(officialExists).toBe(true);
    }, 30000);
});
