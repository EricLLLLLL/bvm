import { beforeAll, afterAll, describe, expect, test } from "bun:test";
import { runBvm, resetTestHome, cleanupTestHome, TEST_HOME, TEST_BVM_DIR, CURRENT_BUN_EXECUTABLE } from "./test-utils";
import { mkdirSync, writeFileSync, chmodSync } from "fs";
import { join } from "path";

describe("Shim Logic Integration", () => {
  beforeAll(async () => {
    await resetTestHome();
    // Install a version to test against
    const installRes = await runBvm(["install", "1.3.4"]); // Use 1.3.4 for testing
    if (installRes.exitCode !== 0) {
      console.error("Install failed:", installRes.allOutput);
    }
    await runBvm(["rehash"]); // Ensure shims are generated
  });

  afterAll(async () => {
    // await cleanupTestHome(); 
  });

  test("shim recursively finds .bvmrc in parent directory", async () => {
    // Check if version dir exists
    const versionDir = join(TEST_BVM_DIR, "versions", "v1.3.4");
    console.log("Checking version dir:", versionDir);
    console.log("Exists?", await Bun.file(versionDir).exists(), "or dir?", await Bun.file(join(versionDir, "bin", "bun")).exists());
    
    // List versions dir
    const versionsDir = join(TEST_BVM_DIR, "versions");
    try {
        const files = await import("fs").then(fs => fs.readdirSync(versionsDir));
        console.log("Versions installed:", files);
    } catch (e) { console.log("Could not list versions dir", e); }

    const parentDir = join(TEST_HOME, "parent");
    const childDir = join(parentDir, "child");
    
    await mkdirSync(childDir, { recursive: true });
    await writeFileSync(join(parentDir, ".bvmrc"), "1.3.4");

    const shimPath = join(TEST_BVM_DIR, "shims", "bun");
    
    // Ensure shim exists
    expect(await Bun.file(shimPath).exists()).toBe(true);

    // Execute shim from child directory
    const proc = Bun.spawn([shimPath, "--version"], {
      cwd: childDir,
      env: {
        ...process.env,
        HOME: TEST_HOME,
        BVM_DIR: TEST_BVM_DIR,
        // We must ensure the shim can find 'bvm' command if it needs it (it might not for basic version check)
        // But the shim sets PATH to include version bin.
      },
      stdout: "pipe",
      stderr: "pipe"
    });

    const output = await new Response(proc.stdout).text();
    const error = await new Response(proc.stderr).text();
    await proc.exited;

    expect(proc.exitCode).toBe(0);
    expect(output.trim()).toBe("1.3.4");
  });
});
