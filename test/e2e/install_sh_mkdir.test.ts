// test/e2e/install_sh_mkdir.test.ts
import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { rm, stat, lstat, mkdir } from "fs/promises";
import { join } from "path";
import { execSync } from "child_process"; // Use Node.js child_process for exec in TS tests

// Helper to run shell commands, mimicking run_shell_command for test context
const runShellCommand = (command: string, options: { cwd: string; env: NodeJS.ProcessEnv }) => {
    return new Promise<{ stdout: string; stderr: string; error: Error | null }>((resolve) => {
        try {
            // Use stdio: 'pipe' to capture stdout and stderr
            const stdout = execSync(command, { cwd: options.cwd, env: options.env as any, stdio: 'pipe' }).toString();
            resolve({ stdout, stderr: "", error: null });
        } catch (error: any) {
            // Capture stdout and stderr from the error object if available
            resolve({ stdout: error.stdout?.toString() || "", stderr: error.stderr?.toString() || "", error });
        }
    });
};

// Define test directory and path to install.sh relative to the test file
const TEST_DIR = join(import.meta.dir, ".tmp_install_sh_mkdir_test");
// Adjust path to install.sh assuming test files are in 'test/e2e/' and install.sh is at the root
const INSTALL_SH_PATH = join(import.meta.dir, "..", "..", "install.sh"); 

describe("install.sh mkdir -p consistency", () => {
    beforeAll(async () => {
        // Clean up and create the test directory before all tests
        await rm(TEST_DIR, { recursive: true, force: true });
        await mkdir(TEST_DIR, { recursive: true });
    });

    afterAll(async () => {
        // Clean up the temporary directory after all tests
        await rm(TEST_DIR, { recursive: true, force: true });
    });

    test("should create all necessary directories with mkdir -p on first run", async () => {
        // Set up environment variables for the script to run in isolation
        const env: NodeJS.ProcessEnv = {
            ...process.env, // Inherit existing environment variables
            BVM_DIR: join(TEST_DIR, ".bvm"), // Point BVM home to .bvm inside test directory // Point BVM home to our test directory
            // BVM_INSTALL_VERSION is intentionally omitted to let the script resolve the version
            REGISTRY: "registry.npmjs.org", // Use global registry for predictable downloads
            PATH: process.env.PATH || "", // Ensure PATH is set for any command execution
        };

        // Execute install.sh for the first time.
        // The script should create directories like .bvm/src, .bvm/runtime, etc.
        const command = `bash ${INSTALL_SH_PATH}`;
        const result = await runShellCommand(command, { cwd: TEST_DIR, env });

        // Assert that the command executed without errors
        expect(result.error).toBeNull();
        expect(result.stderr).toBe(""); // Expect no errors on stdout

        // Verify that key directories are created by install.sh
        const expectedDirs = [
            join(TEST_DIR, ".bvm", "src"),
            // The script creates ${BVM_RUNTIME_DIR}/current, which is a symlink to a versioned dir.
            // So we check for the existence of the 'bin' subdirectory within the 'current' runtime.
            join(TEST_DIR, ".bvm", "runtime", "current", "bin"), 
            join(TEST_DIR, ".bvm", "bin"),
            join(TEST_DIR, ".bvm", "shims"),
            join(TEST_DIR, ".bvm", "aliases"),
            // The script should create a versioned directory for the runtime based on resolved version
            // We don't know the exact resolved version beforehand, so we check for the 'current' symlink and its bin subdir.
        ];

        for (const dir of expectedDirs) {
            try {
                const fileStat = await stat(dir);
                expect(fileStat.isDirectory()).toBe(true);
            } catch (e) {
                // Throw a more informative error if a directory is missing
                throw new Error(`Directory not found or not a directory: ${dir}. Error: ${e}`);
            }
        }
    });

    test("should not fail if directories already exist on subsequent run", async () => {
        // Set up environment variables, pointing to the test directory
        const env: NodeJS.ProcessEnv = {
            ...process.env,
            BVM_DIR: join(TEST_DIR, ".bvm"), // Point BVM home to .bvm inside test directory
            // BVM_INSTALL_VERSION is intentionally omitted to let the script resolve the version
            REGISTRY: "registry.npmjs.org",
            PATH: process.env.PATH || "",
        };
        
        // Run install.sh again. The mkdir -p commands should handle existing directories gracefully.
        const command = `bash ${INSTALL_SH_PATH}`;
        const result = await runShellCommand(command, { cwd: TEST_DIR, env });

        // Assert that the command executed without errors
        expect(result.error).toBeNull();
        expect(result.stderr).toBe(""); // Expect no errors
        
        // Verify that essential files/links are still present or correctly set up after re-run
        const bvmBinPath = join(TEST_DIR, ".bvm", "bin", "bvm");
        try {
            const bvmBinStat = await stat(bvmBinPath);
            expect(bvmBinStat.isFile()).toBe(true); // Check if the bvm wrapper script exists
        } catch (e) {
            throw new Error(`BVM binary wrapper not found at ${bvmBinPath}`);
        }

        // Also check if the symlink for the current runtime is correctly maintained
        const currentRuntimeLink = await lstat(join(TEST_DIR, ".bvm", "runtime", "current"));
        expect(currentRuntimeLink.isSymbolicLink()).toBe(true);
    });
});
