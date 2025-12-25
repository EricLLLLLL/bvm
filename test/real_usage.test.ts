import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { join } from "path";
import { resetTestHome, runBvm, TEST_BVM_DIR, TEST_HOME } from "./test-utils";
import { mkdirSync, writeFileSync, chmodSync } from "fs";

describe("Real Usage E2E (Based on User Session)", () => {
  beforeAll(async () => {
    await resetTestHome();
    
    // Setup: Pre-install v1.3.4 and v1.3.5 (stubs)
    const v134bin = join(TEST_BVM_DIR, "versions", "v1.3.4", "bin");
    const v135bin = join(TEST_BVM_DIR, "versions", "v1.3.5", "bin");
    mkdirSync(v134bin, { recursive: true });
    mkdirSync(v135bin, { recursive: true });
    
    // Create bun executable stubs
    const createStub = (path: string, version: string) => {
        writeFileSync(path, `#!/usr/bin/env bash\nif [ "$1" == "--version" ]; then echo "${version}"; else echo "Bun ${version} stub invoked with: $@"; fi`);
        chmodSync(path, 0o755);
    };
    
    createStub(join(v134bin, "bun"), "1.3.4");
    createStub(join(v135bin, "bun"), "1.3.5");
    
    // Initial state: 1.3.5 is default
    await runBvm(["alias", "default", "1.3.5"]);
    await runBvm(["use", "1.3.5"]);
    await runBvm(["rehash"]);
  });

  it("should follow the recorded user test sequence", async () => {
    // 1. bvm ls -> shows 1.3.5 (current)
    let res = await runBvm(["ls"]);
    expect(res.output).toContain("* v1.3.5 (current)");
    expect(res.output).toContain("v1.3.4");
    expect(res.output).toContain("default -> v1.3.5");

    // 2. Mock 'bun install -g yarn'
    // In real life this creates 'yarn' in v1.3.5/bin
    const yarn135 = join(TEST_BVM_DIR, "versions", "v1.3.5", "bin", "yarn");
    writeFileSync(yarn135, "#!/usr/bin/env bash\necho 'yarn install v1.22.22'");
    chmodSync(yarn135, 0o755);
    
    // 3. rehash to pick up the new 'yarn'
    await runBvm(["rehash"]);

    // 4. bvm which yarn
    res = await runBvm(["which", "yarn"]);
    expect(res.output).toContain("v1.3.5/bin/yarn");

    // 5. bvm use 1.3.4
    res = await runBvm(["use", "1.3.4"]);
    expect(res.output).toContain("Now using Bun v1.3.4");

    // 6. bvm which yarn (Should FAIL or return empty because we don't auto-alias yarn in 1.3.4)
    res = await runBvm(["which", "yarn"]);
    expect(res.output).toContain("Command 'yarn' not found");

    // 7. bvm use 1.3.5
    await runBvm(["use", "1.3.5"]);

    // 8. bvm default 1.3.4
    res = await runBvm(["default", "1.3.4"]);
    expect(res.output).toContain("Default set to v1.3.4");

    // 9. bvm uninstall 1.3.5
    // Note: It's currently active (via current symlink), uninstall should now handle this
    res = await runBvm(["uninstall", "1.3.5"]);
    expect(res.output).toContain("Bun v1.3.5 uninstalled successfully");

    // 10. bvm ls (Should not crash and should fallback to default 1.3.4)
    res = await runBvm(["ls"]);
    expect(res.output).toContain("* v1.3.4 (current)");
    expect(res.output).not.toContain("v1.3.5");
  });
});
