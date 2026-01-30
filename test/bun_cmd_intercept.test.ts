import { describe, it, expect } from "bun:test";
import { readFileSync } from "fs";
import { join } from "path";

describe("bun.cmd Interceptor Template", () => {
    const templatePath = join(__dirname, "../src/templates/win/bun.cmd");
    const content = readFileSync(templatePath, "utf-8");

    it("should intercept installation commands", () => {
        expect(content).toContain('if "%1"=="install" set "NEED_REHASH=1"');
        expect(content).toContain('if "%1"=="add" set "NEED_REHASH=1"');
        expect(content).toContain('if "%1"=="upgrade" set "NEED_REHASH=1"');
        expect(content).toContain('if "%1"=="link" set "NEED_REHASH=1"');
    });

    it("should call bvm rehash after successful execution", () => {
        expect(content).toContain(':check_rehash');
        expect(content).toContain('if "%EXIT_CODE%"=="0"');
        expect(content).toContain('if "%NEED_REHASH%"=="1"');
        // Escape backslashes for the test string literal
        expect(content).toContain('call "%BVM_DIR%\\bin\\bvm.cmd" rehash --silent');
    });
});
