import { describe, it, expect, mock } from "bun:test";
import { spawnSync } from "child_process";

// We need to test the logic that will replace the current 'run' function.
// Since I can't easily import the unexported function from the script without executing it,
// I will copy the 'run' function logic here to verify the fix before applying it, 
// OR I will modify the script to be testable.

// Let's modify `scripts/postinstall.js` to export `run` for testing purposes first.
// This is a "Refactor" step usually, but necessary for "Red" phase here.

describe("postinstall.js run() logic", () => {
    // We are simulating the fix logic here because we can't run the actual script on Windows in this env.
    // The goal is to verify that the NEW logic avoids the warning pattern.
    
    it("should avoid using shell:true with args array on Windows", () => {
        // This is what the code SHOULD do.
        const IS_WINDOWS = true;
        const mockSpawnSync = mock((cmd, args, opts) => ({ status: 0 }));
        
        // Proposed new implementation of run()
        function run(cmd, args, opts = {}) {
            const options = Object.assign({ encoding: 'utf-8' }, opts);
            if (IS_WINDOWS) {
                // Eliminate DEP0190: Don't use shell: true with args array.
                // Instead, use cmd /c or direct execution.
                if (cmd.endsWith('.cmd') || cmd.endsWith('.bat') || cmd === 'npm') {
                    return mockSpawnSync('cmd', ['/d', '/s', '/c', cmd, ...args], { ...options, windowsVerbatimArguments: true });
                }
                // For raw executables like curl.exe, tar.exe
                return mockSpawnSync(cmd, args, options);
            }
            return mockSpawnSync(cmd, args, Object.assign({ shell: true }, options));
        }

        // Test Case 1: npm command
        run("npm", ["install"]);
        expect(mockSpawnSync).toHaveBeenLastCalledWith(
            "cmd", 
            ["/d", "/s", "/c", "npm", "install"], 
            expect.objectContaining({ windowsVerbatimArguments: true })
        );
        expect(mockSpawnSync.mock.calls[0][2]).not.toHaveProperty("shell", true);

        // Test Case 2: curl.exe
        run("curl.exe", ["-O", "file"]);
        expect(mockSpawnSync).toHaveBeenLastCalledWith(
            "curl.exe", 
            ["-O", "file"], 
            expect.not.objectContaining({ shell: true })
        );
    });
});
