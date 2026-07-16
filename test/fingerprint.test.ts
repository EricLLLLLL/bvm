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
        const result = await execa(process.execPath, ["run", "scripts/fingerprint.ts"]);
        expect(result.exitCode).toBe(0);

        // Read updated package.json
        const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
        
            // Assert SHA-256 artifact manifest structure
            expect(pkg.bvm_artifact_sha256).toBeDefined();
            expect(pkg.bvm_artifact_sha256.cli).toMatch(/^[a-f0-9]{64}$/);
            expect(pkg.bvm_artifact_sha256.shim_win).toMatch(/^[a-f0-9]{64}$/);
            expect(pkg.bvm_artifact_sha256.shim_unix).toMatch(/^[a-f0-9]{64}$/);
        
        // Assert new assets are tracked
            expect(pkg.bvm_artifact_sha256.install_sh).toMatch(/^[a-f0-9]{64}$/);
            expect(pkg.bvm_artifact_sha256.install_ps1).toMatch(/^[a-f0-9]{64}$/);
    });
});
