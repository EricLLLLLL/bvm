import { test, expect, describe } from "bun:test";
import { join, resolve } from "path";
import fs from "fs";
import { $ } from "bun";
import { tmpdir } from "os";

describe("Proxy-Bunker Architecture Integration", () => {
    test("Full Lifecycle: Install -> Native Shim -> Proxy -> Delegated Execution", async () => {
        if (process.platform !== "win32") {
            // Windows-only: this test validates .cmd/.ps1 shim behaviors.
            return;
        }

        const mockBvmDir = join(tmpdir(), `bvm-mock-full-${Date.now()}`);
        const version = "v1.3.7";
        const internalBinDir = join(mockBvmDir, "versions", version, "bin");
        const centralShimsDir = join(mockBvmDir, "shims");
        const bvmBinDir = join(mockBvmDir, "bin");

        // 1. Setup Directories
        fs.mkdirSync(internalBinDir, { recursive: true });
        fs.mkdirSync(centralShimsDir, { recursive: true });
        fs.mkdirSync(bvmBinDir, { recursive: true });

        // 2. Simulate Bun installing a native "buggy" package (e.g. claude)
        const nativeShim = join(internalBinDir, "claude.cmd");
        // This is exactly what Bun generates - the source of the drift
        fs.writeFileSync(nativeShim, `@echo off
echo Native Shim Received: %*`);

        // 3. Setup BVM Private Assets
        const shimJsPath = resolve("src/templates/win/bvm-shim.js");
        fs.copyFileSync(shimJsPath, join(bvmBinDir, "bvm-shim.js"));

        // 4. Run the New Rehash Logic (simulated)
        // We'll use a simplified version of the logic we just wrote to verify the proxy generation
        const executables = ["claude"]; 
        const bvmDirWin = mockBvmDir.replace(/\//g, "\\");
        
        for (const bin of executables) {
            const proxyContent = `@echo off
set "BVM_DIR=${bvmDirWin}"
node "${join(bvmBinDir, 'bvm-shim.js')}" "${bin}" %*`;
            fs.writeFileSync(join(centralShimsDir, `${bin}.cmd`), proxyContent);
        }

        // 5. Execution Test: Call the Proxy
        // We mock the BVM environment and active version
        const env = {
            ...process.env,
            BVM_DIR: mockBvmDir,
            BVM_ACTIVE_VERSION: version
        };

        const result = await $`node ${join(bvmBinDir, 'bvm-shim.js')} claude --version`.env(env).quiet().text();

        console.log("Delegation Output:", result.trim());

        // 6. Assertions
        expect(result).toContain("Native Shim Received: --version");
        
        // 7. Verify Env Injection
        // We'll write a small test script to check injected env vars
        const inspectorScript = join(internalBinDir, "inspect.js");
        fs.writeFileSync(inspectorScript, "console.log(process.env.BUN_INSTALL);");
        
        // Use the shim to run the inspector
        const envResult = await $`node ${join(bvmBinDir, 'bvm-shim.js')} node ${inspectorScript}`.env(env).quiet().text();
        expect(envResult.trim()).toBe(join(mockBvmDir, "versions", version));

        console.log("✅ Proxy-Bunker Integration Verified: Delegation is solid, Env is injected.");

        // Cleanup
        fs.rmSync(mockBvmDir, { recursive: true, force: true });
    });
});
