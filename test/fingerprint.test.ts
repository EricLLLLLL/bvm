import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { execa } from "execa";

describe("Fingerprint Script", () => {
    const pkgPath = join(process.cwd(), "package.json");
    let originalPkg: string;

    beforeAll(() => {
        originalPkg = readFileSync(pkgPath, "utf-8");
    });

    afterAll(() => {
        writeFileSync(pkgPath, originalPkg);
    });

    it("should calculate fingerprints for all release assets", async () => {
        // Run the fingerprint script
        const result = await execa("bun", ["run", "scripts/fingerprint.ts"]);
        expect(result.exitCode).toBe(0);

        // Read updated package.json
        const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
        
        // Assert bvm_fingerprints structure
        expect(pkg.bvm_fingerprints).toBeDefined();
        expect(pkg.bvm_fingerprints.cli).toMatch(/^[a-f0-9]{32}$/); // MD5 hex
        expect(pkg.bvm_fingerprints.shim_win).toMatch(/^[a-f0-9]{32}$/);
        expect(pkg.bvm_fingerprints.shim_unix).toMatch(/^[a-f0-9]{32}$/);
        
        // Assert new assets are tracked
        expect(pkg.bvm_fingerprints.install_sh).toMatch(/^[a-f0-9]{32}$/);
        expect(pkg.bvm_fingerprints.install_ps1).toMatch(/^[a-f0-9]{32}$/);
    });
});
