import { describe, it, expect } from "bun:test";
import { readFileSync } from "fs";
import { join } from "path";

describe("bvm-shim.sh Interceptor", () => {
    const templatePath = join(__dirname, "../src/templates/unix/bvm-shim.sh");
    const content = readFileSync(templatePath, "utf-8");

    it("should intercept installation commands", () => {
        expect(content).toContain('if [ "$CMD_NAME" = "bun" ] && [ $EXIT_CODE -eq 0 ]; then');
        expect(content).toContain('install|i|add|a|remove|rm|upgrade|link|unlink)');
    });

    it("should trigger background rehash", () => {
        expect(content).toMatch(/"\$BVM_DIR\/bin\/bvm" rehash --silent >\/dev\/null 2>&1 &/);
    });
});
