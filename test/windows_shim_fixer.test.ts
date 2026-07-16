import { describe, it, expect } from "bun:test";
import { join } from "path";
import { rm, mkdir } from "fs/promises";
import { fixWindowsShims } from "../src/utils/windows-shim-fixer";

describe("Windows Shim Fixer", () => {
    const testDir = join(process.cwd(), "test-shims");
    
    it("should fix relative path in .cmd file", async () => {
        await mkdir(join(testDir, "bin"), { recursive: true });
        await mkdir(join(testDir, "node_modules"), { recursive: true });
        
        const cmdPath = join(testDir, "bin", "claude.cmd");
        // Simulate Bun's relative path
        const originalContent = '@ECHO off\r\n\"%~dp0\\..\\node_modules\\pkg\\cli.js\" %*';
        await Bun.write(cmdPath, originalContent);
        
        await fixWindowsShims(join(testDir, "bin"), 'win32');
        
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

    it("should fix relative paths in PowerShell shims", async () => {
        await mkdir(join(testDir, "bin"), { recursive: true });
        await mkdir(join(testDir, "node_modules"), { recursive: true });

        const ps1Path = join(testDir, "bin", "claude.ps1");
        await Bun.write(ps1Path, '& "$PSScriptRoot\\..\\node_modules\\pkg\\cli.js" $args');

        const result = await fixWindowsShims(join(testDir, "bin"), 'win32');
        const fixedContent = await Bun.file(ps1Path).text();
        const absNodeModules = join(testDir, "node_modules").replace(/\//g, '\\');

        expect(fixedContent).not.toContain('$PSScriptRoot\\..\\node_modules');
        expect(fixedContent).toContain(absNodeModules);
        expect(result.fixed).toContain(ps1Path);
        expect(result.failed).toEqual([]);

        await rm(testDir, { recursive: true, force: true });
    });

    it("should continue after one malformed shim", async () => {
        const binDir = join(testDir, "bin");
        await mkdir(join(binDir, "a-broken.cmd"), { recursive: true });
        await mkdir(join(testDir, "node_modules"), { recursive: true });

        const validPath = join(binDir, "z-valid.ps1");
        await Bun.write(validPath, '& "$PSScriptRoot\\..\\node_modules\\pkg\\cli.js" $args');

        const result = await fixWindowsShims(binDir, 'win32');

        expect(result.fixed).toContain(validPath);
        expect(result.failed).toContainEqual(expect.objectContaining({
            path: join(binDir, "a-broken.cmd"),
        }));

        await rm(testDir, { recursive: true, force: true });
    });
});
