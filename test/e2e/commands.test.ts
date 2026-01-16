import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { getSandboxDir, setupSandbox, cleanupSandbox, runBvm, getInstalledVersions, getAlias } from "./e2e-utils";
import { join } from "path";

describe("BVM E2E: Commands", () => {
    let sandboxDir: string;

    beforeAll(() => {
        sandboxDir = getSandboxDir();
        setupSandbox(sandboxDir);
    });

    afterAll(() => {
        cleanupSandbox(sandboxDir);
    });

    it("should list remote versions", async () => {
        const result = await runBvm(["ls-remote", "--limit", "5"], sandboxDir);
        expect(result.exitCode).toBe(0);
        expect(result.all).toContain("Available remote Bun versions");
    });

    it("should install a version", async () => {
        const result = await runBvm(["install", "1.2.23"], sandboxDir);
        
        if (result.exitCode !== 0) {
            console.log("Install Error Output:", result.all);
        }

        expect(result.exitCode).toBe(0);
        expect(result.all).toContain("installed and active");

        const versions = getInstalledVersions(sandboxDir);
        expect(versions).toContain("v1.2.23");
    }, 60000);

    it("should show current version", async () => {
        const result = await runBvm(["current"], sandboxDir);
        expect(result.exitCode).toBe(0);
        expect(result.all).toContain("v1.2.23");
    });

    it("should show which bun", async () => {
        const result = await runBvm(["which", "1.2.23"], sandboxDir);
        expect(result.exitCode).toBe(0);
        const expectedPath = join(sandboxDir, ".bvm", "versions", "v1.2.23", "bin", "bun");
        expect(result.all).toContain(expectedPath);
    });

    it("should create and use an alias", async () => {
        // Create alias
        const aliasResult = await runBvm(["alias", "prod", "1.2.23"], sandboxDir);
        expect(aliasResult.exitCode).toBe(0);
        expect(getAlias(sandboxDir, "prod")).toBe("v1.2.23");

        // Use alias
        const result = await runBvm(["use", "prod"], sandboxDir);
        expect(result.exitCode).toBe(0);
        expect(result.all).toContain("Now using Bun v1.2.23");
    });

    it("should unalias", async () => {
        const result = await runBvm(["unalias", "prod"], sandboxDir);
        expect(result.exitCode).toBe(0);
        expect(getAlias(sandboxDir, "prod")).toBeNull();
    });

    it("should list installed versions", async () => {
        const result = await runBvm(["ls"], sandboxDir);
        expect(result.exitCode).toBe(0);
        expect(result.all).toContain("v1.2.23");
    });

    it("should uninstall a version", async () => {
        // First install another version to set as default
        await runBvm(["install", "1.0.0"], sandboxDir);
        await runBvm(["alias", "default", "1.0.0"], sandboxDir);

        const result = await runBvm(["uninstall", "1.2.23"], sandboxDir);
        
        if (result.exitCode !== 0) {
            console.log("Uninstall Error Output:", result.all);
        }

        expect(result.exitCode).toBe(0);
        expect(result.all).toContain("uninstalled successfully");

        const versions = getInstalledVersions(sandboxDir);
        expect(versions).not.toContain("v1.2.23");
    }, 60000);
});
