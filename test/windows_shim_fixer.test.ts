import { describe, it, expect, mock, afterAll } from "bun:test";
import { join } from "path";
import { rm, mkdir } from "fs/promises";
import { fixWindowsShims } from "../src/utils/windows-shim-fixer";

// Mock OS_PLATFORM via module mocking to force execution
mock.module("../src/constants", () => ({
    OS_PLATFORM: "win32"
}));

describe("Windows Shim Fixer", () => {
    const testDir = join(process.cwd(), "test-shims");
    
    it("should fix relative path in .cmd file", async () => {
        await mkdir(join(testDir, "bin"), { recursive: true });
        await mkdir(join(testDir, "node_modules"), { recursive: true });
        
        const cmdPath = join(testDir, "bin", "claude.cmd");
        // Simulate Bun's relative path
        const originalContent = '@ECHO off\r\n\"%~dp0\\..\\node_modules\\pkg\\cli.js\" %*';
        await Bun.write(cmdPath, originalContent);
        
        await fixWindowsShims(join(testDir, "bin"));
        
        const fixedContent = await Bun.file(cmdPath).text();
        
        // We expect absolute path
        const absNodeModules = join(testDir, "node_modules").replace(/\//g, '\\');
        
        console.log("Fixed Content:", fixedContent);
        console.log("Expected Path:", absNodeModules);

        expect(fixedContent).not.toContain('%~dp0\\..\\node_modules');
        expect(fixedContent).toContain(absNodeModules);
        
        // Cleanup
        await rm(testDir, { recursive: true, force: true });
    });
});
