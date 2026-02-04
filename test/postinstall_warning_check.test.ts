import { describe, it, expect } from "bun:test";
import { readFileSync } from "fs";
import { join } from "path";

describe("Postinstall Script Safety", () => {
  it("should NOT use shell: IS_WINDOWS with arguments array (DEP0190)", () => {
    const postinstallPath = join(__dirname, "../scripts/postinstall.js");
    const content = readFileSync(postinstallPath, "utf-8");
    
    // The problematic pattern currently in the file:
    // return spawnSync(cmd, args, Object.assign({ encoding: 'utf-8', shell: IS_WINDOWS }, opts));
    
    // We match roughly the structure
    const badPattern = /shell:\s*IS_WINDOWS/;
    
    // We expect this to FAIL currently because the pattern IS there.
    expect(content).not.toMatch(badPattern);
  });
});