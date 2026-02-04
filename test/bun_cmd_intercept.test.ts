import { describe, it, expect } from "bun:test";
import { readFileSync } from "fs";
import { join } from "path";

describe("bun.cmd Interceptor Template", () => {
    const templatePath = join(__dirname, "../src/templates/win/bun.cmd");
    const content = readFileSync(templatePath, "utf-8");

    it("should delegate to bvm-shim.js", () => {
        expect(content).toContain('set "BVM_DIR=__BVM_DIR__"');
        expect(content).toContain('%BVM_DIR%\\bin\\bvm-shim.js');
        expect(content).toContain('"bun" %*');
    });

    it("should execute the bvm runtime bun binary", () => {
        expect(content).toContain('%BVM_DIR%\\runtime\\current\\bin\\bun.exe');
        expect(content).toContain('exit /b %errorlevel%');
    });
});
