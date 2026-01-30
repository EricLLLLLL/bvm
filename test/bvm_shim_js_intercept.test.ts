import { describe, it, expect } from "bun:test";
import { readFileSync } from "fs";
import { join } from "path";

describe("bvm-shim.js Interceptor", () => {
    const templatePath = join(__dirname, "../src/templates/win/bvm-shim.js");
    const content = readFileSync(templatePath, "utf-8");

    it("should intercept installation commands", () => {
        expect(content).toContain("const installCmds = ['install', 'i', 'add', 'a', 'remove', 'rm', 'upgrade', 'link', 'unlink'];");
        expect(content).toContain("if (installCmds.includes(ARGS[0])) isInstall = true;");
    });

    it("should trigger background rehash", () => {
        expect(content).toContain("spawn(bvmCmd, ['rehash', '--silent']");
        expect(content).toContain("detached: true");
        expect(content).toContain("stdio: 'ignore'");
    });
});
