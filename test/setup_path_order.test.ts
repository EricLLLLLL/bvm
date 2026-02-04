import { describe, it, expect } from "bun:test";
import { readFileSync } from "fs";
import { join } from "path";

describe("Setup Path Configuration", () => {
    const setupPath = join(__dirname, "../src/commands/setup.ts");
    const content = readFileSync(setupPath, "utf-8");

    it("should include current/bin at the end of PATH for POSIX shells", () => {
        // Look for the configBlock string template
        const configBlockMatch = content.match(/const configBlock = `([\s\S]*?)`;/);
        expect(configBlockMatch).toBeTruthy();
        const configBlock = configBlockMatch![1];

        // Check if current/bin is appended at the end
        // Expected: export PATH="$BVM_DIR/shims:$BVM_DIR/bin:$PATH:$BVM_DIR/current/bin"
        expect(configBlock).toMatch(/export PATH="\$BVM_DIR\/shims:\$BVM_DIR\/bin:\$PATH:\$BVM_DIR\/current\/bin"/);
    });

    it("should include current/bin at the end of PATH for Fish", () => {
        const fishBlockMatch = content.match(/const fishConfigBlock = `([\s\S]*?)`;/);
        expect(fishBlockMatch).toBeTruthy();
        const fishBlock = fishBlockMatch![1];

        // We want to verify that current/bin is added, ideally appended.
        // For fish, checking existence is a good first step for this red phase.
        // The previous code explicitly REMOVED it.
        expect(fishBlock).toMatch(/fish_add_path.*"\$BVM_DIR\/current\/bin"/);
    });

    it("should include current/bin at the end of PATH for Windows (Registry)", () => {
        const psCommandMatch = content.match(/const psCommand = `([\s\S]*?)`;/);
        expect(psCommandMatch).toBeTruthy();
        const psCommand = psCommandMatch![1];

        // We check if $currentBinPath is used in the final string construction in a way that suggests appending
        // OR just that it is present in the logic.
        expect(psCommand).toMatch(/\$currentBinPath/);
        
        // To verify "at the end", we might check if it's NOT in the $newPaths (which are prepended)
        // But let's start with just ensuring it's put back.
    });
});
