import { describe, it, expect } from "bun:test";
import { readFileSync } from "fs";
import { join } from "path";

describe("bvm-shim.js Interceptor", () => {
    const templatePath = join(__dirname, "../src/templates/win/bvm-shim.js");
    const content = readFileSync(templatePath, "utf-8");

    it("should intercept installation commands", () => {
        expect(content).toContain("const installCmds = ['install', 'i', 'add', 'a', 'remove', 'rm', 'uninstall', 'upgrade', 'link', 'unlink'];");
        expect(content).toContain("needRehash = hasGlobalFlag;");
    });

    it("should trigger rehash after successful global install", () => {
        expect(content).toContain("spawnSync(bvmCmd, ['rehash', '--silent']");
        expect(content).toContain("Updating command registry");
        expect(content).toContain("New commands are now available");
    });
});
