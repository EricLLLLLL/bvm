import { describe, it, expect } from "bun:test";
import packageJson from "../package.json";

describe("NPM Global Install Configuration", () => {
    it("should have bin field pointing to bin/bvm-npm.js", () => {
        expect(packageJson.bin).toBeDefined();
        // @ts-ignore
        expect(packageJson.bin.bvm).toBe("bin/bvm-npm.js");
    });

    it("should include necessary files in files field", () => {
        expect(packageJson.files).toContain("dist/index.js");
        expect(packageJson.files).toContain("dist/bvm-shim.sh");
        expect(packageJson.files).toContain("dist/bvm-shim.js");
        expect(packageJson.files).toContain("install.sh");
        expect(packageJson.files).toContain("install.ps1");
    });

    it("should have postinstall.js in scripts directory", () => {
        const { existsSync } = require("fs");
        const { join } = require("path");
        const postInstallPath = join(process.cwd(), "scripts", "postinstall.js");
        expect(existsSync(postInstallPath)).toBe(true);
    });

    it("should have postinstall script in package.json", () => {
        expect(packageJson.scripts.postinstall).toBe("node scripts/postinstall.js");
    });
});
