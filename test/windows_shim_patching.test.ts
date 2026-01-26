import { describe, test, expect } from "bun:test";
import { fixShimContent } from "../src/utils/windows-shim-fixer";

describe("Windows Shim Patching", () => {
  test("Replaces relative path with absolute path", () => {
    const shimContent = `@ECHO OFF\r\n\"%~dp0\\..\\node_modules\\pkg\\cli.js\" %*`;
    const versionDir = "C:\\Users\\.bvm\\versions\\v1";
    
    const fixed = fixShimContent(shimContent, versionDir);
    
    expect(fixed).toBe(`@ECHO OFF\r\n\"${versionDir}\\node_modules\\pkg\\cli.js\" %*`);
  });
});