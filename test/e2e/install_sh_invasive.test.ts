// test/e2e/install_sh_invasive.test.ts
import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { rm, mkdir, writeFile, readFile, stat } from "fs/promises";
import { join } from "path";
import { execSync } from "child_process";

const TEST_DIR = join(import.meta.dir, ".tmp_install_sh_invasive");
const MOCK_HOME = join(TEST_DIR, "home");
const INSTALL_SH_PATH = join(import.meta.dir, "..", "..", "install.sh"); 
const OFFICIAL_BUN_DIR = join(MOCK_HOME, ".bun");
const OFFICIAL_BUN_BIN = join(OFFICIAL_BUN_DIR, "bin", "bun");

describe("install.sh invasive logic check", () => {
    beforeAll(async () => {
        await rm(TEST_DIR, { recursive: true, force: true });
        await mkdir(MOCK_HOME, { recursive: true });
        
        // Setup "Official Bun"
        await mkdir(join(OFFICIAL_BUN_DIR, "bin"), { recursive: true });
        // Create a dummy bun binary. In a real scenario it would be an executable.
        // For this test, verifying content integrity is enough.
        await writeFile(OFFICIAL_BUN_BIN, "i am official bun");
        // Make it executable just in case
        await execSync(`chmod +x ${OFFICIAL_BUN_BIN}`);
    });

    afterAll(async () => {
        await rm(TEST_DIR, { recursive: true, force: true });
    });

    test("should not modify or remove existing ~/.bun directory", async () => {
        const env: NodeJS.ProcessEnv = {
            ...process.env,
            HOME: MOCK_HOME,
            // Add official bun to PATH to simulate coexistence collision
            PATH: `${join(OFFICIAL_BUN_DIR, "bin")}:${process.env.PATH || ""}`,
            // Ensure BVM_DIR is not set, so it defaults to HOME/.bvm
            BVM_DIR: undefined, 
        };

        const command = `bash ${INSTALL_SH_PATH}`;
        
        try {
            // We use stdio 'ignore' or 'pipe' to prevent clutter, but we want to let it run
            execSync(command, { cwd: MOCK_HOME, env: env as any, stdio: 'pipe' });
        } catch (e) {
            // We catch execution errors because we are testing for SIDE EFFECTS (file deletion),
            // not necessarily successful installation (though it should succeed).
            // If install.sh fails due to network, we still want to verify it didn't delete .bun
            console.log("Install script failed (expected if network issues), but checking .bun integrity...");
        }

        // Check if official bun still exists and is untouched
        const exists = await stat(OFFICIAL_BUN_BIN).then(() => true).catch(() => false);
        expect(exists).toBe(true);
        
        const content = await readFile(OFFICIAL_BUN_BIN, "utf-8");
        expect(content).toBe("i am official bun");
    });
});
