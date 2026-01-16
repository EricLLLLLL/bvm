import { describe, it, expect } from "bun:test";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

describe("Build Artifacts Verification", () => {
    const distDir = join(process.cwd(), "dist");

    it("should have bvm-shim.sh in dist directory", () => {
        const shimPath = join(distDir, "bvm-shim.sh");
        expect(existsSync(shimPath)).toBe(true);
        
        const content = readFileSync(shimPath, "utf-8");
        expect(content).toContain("#!/bin/bash");
    });

    it("should have bvm-shim.js in dist directory", () => {
        const shimPath = join(distDir, "bvm-shim.js");
        expect(existsSync(shimPath)).toBe(true);
    });
});
