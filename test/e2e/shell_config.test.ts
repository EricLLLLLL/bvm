import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { getSandboxDir, setupSandbox, cleanupSandbox, runInstallScript, runBvm } from "./e2e-utils";
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { updatePowerShellProfile } from "../../src/commands/setup";
import { execa } from "execa";

describe("BVM E2E: Shell Configuration", () => {
    let sandboxDir: string;
    const isWindows = process.platform === "win32";

    beforeEach(() => {
        sandboxDir = getSandboxDir();
        setupSandbox(sandboxDir);
    });

    afterEach(() => {
        cleanupSandbox(sandboxDir);
    });

    // ... (Existing bash/zsh/fish tests) ...

    it("should update .bashrc when installing with SHELL=/bin/bash", async () => {
        if (isWindows) return;
        
        const bashrcPath = join(sandboxDir, ".bashrc");
        writeFileSync(bashrcPath, "# Existing bashrc\n");

        // Force SHELL to bash
        const result = await runInstallScript(sandboxDir, { SHELL: "/bin/bash" });
        expect(result.exitCode).toBe(0);

        const content = readFileSync(bashrcPath, "utf-8");
        expect(content).toContain("export BVM_DIR=");
        expect(content).toContain("# >>> bvm initialize >>>");
    }, 60000);

    it("should update .zshrc when installing with SHELL=/bin/zsh", async () => {
        if (isWindows) return;

        const zshrcPath = join(sandboxDir, ".zshrc");
        writeFileSync(zshrcPath, "# Existing zshrc\n");

        // Force SHELL to zsh
        const result = await runInstallScript(sandboxDir, { SHELL: "/bin/zsh" });
        expect(result.exitCode).toBe(0);

        const content = readFileSync(zshrcPath, "utf-8");
        expect(content).toContain("export BVM_DIR=");
        expect(content).toContain("# >>> bvm initialize >>>");
    }, 60000);

    it("should update config.fish when installing with SHELL=/usr/bin/fish", async () => {
        if (isWindows) return;

        const fishConfigPath = join(sandboxDir, ".config", "fish", "config.fish");
        mkdirSync(dirname(fishConfigPath), { recursive: true });
        writeFileSync(fishConfigPath, "# Existing fish config\n");

        // Force SHELL to fish
        const result = await runInstallScript(sandboxDir, { SHELL: "/usr/bin/fish" });
        expect(result.exitCode).toBe(0);

        const content = readFileSync(fishConfigPath, "utf-8");
        expect(content).toContain("set -Ux BVM_DIR");
        expect(content).toContain("# >>> bvm initialize >>>");
    }, 60000);

    it("should generate valid PowerShell profile (verified by pwsh)", async () => {
        // This test runs on macOS/Linux too if pwsh is installed!
        const hasPwsh = await execa("which", ["pwsh"], { reject: false }).then(r => r.exitCode === 0);
        if (!hasPwsh && !isWindows) {
            console.log("Skipping PowerShell test (pwsh not found)");
            return;
        }

        const profileDir = join(sandboxDir, "PowerShell");
        const profilePath = join(profileDir, "Microsoft.PowerShell_profile.ps1");
        mkdirSync(profileDir, { recursive: true });
        writeFileSync(profilePath, "# Existing Profile\r\n");

        // Call the extracted function directly
        await updatePowerShellProfile(profilePath, false);

        const content = readFileSync(profilePath, "utf-8");
        expect(content).toContain("$env:BVM_DIR =");
        expect(content).toContain("$env:PATH =");

        // Verify syntax using pwsh
        // We wrap the content in a try/catch block in PowerShell to detect parse errors
        const verifyCmd = `
            try {
                $script = Get-Content "${profilePath}" -Raw
                $scriptBlock = [ScriptBlock]::Create($script)
                Write-Host "Syntax OK"
            } catch {
                Write-Error $_
                exit 1
            }
        `;
        
        const result = await execa("pwsh", ["-Command", verifyCmd], { reject: false });
        if (result.exitCode !== 0) {
            console.error("PowerShell Syntax Error:", result.stderr);
        }
        expect(result.exitCode).toBe(0);
        expect(result.stdout).toContain("Syntax OK");
    });

    it("should run 'bvm setup' idempotently", async () => {
        if (isWindows) return;

        const zshrcPath = join(sandboxDir, ".zshrc");
        writeFileSync(zshrcPath, "");

        // Run setup once (simulating install)
        await runBvm(["setup"], sandboxDir, { SHELL: "/bin/zsh" });
        let content = readFileSync(zshrcPath, "utf-8");
        expect(content).toContain("export BVM_DIR=");

        // Run setup again
        const result = await runBvm(["setup"], sandboxDir, { SHELL: "/bin/zsh" });
        expect(result.exitCode).toBe(0);
        expect(result.all).toContain("Configuration is already up to date");
        
        // Content should not be duplicated (checked by simple count or manual check)
        content = readFileSync(zshrcPath, "utf-8");
        const occurrences = (content.match(/# >>> bvm initialize >>>/g) || []).length;
        expect(occurrences).toBe(1);
    });
});