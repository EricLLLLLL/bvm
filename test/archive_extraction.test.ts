import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { join } from "path";
import { extractArchive } from "../src/utils/archive";
import { ensureDir, removeDir, pathExists } from "../src/utils";
import { runCommand } from "../src/helpers/process";

const TEST_DIR = join(process.cwd(), ".test-extract");
const NPM_TGZ = join(TEST_DIR, "test-npm.tgz");
const GH_ZIP = join(TEST_DIR, "test-gh.zip");

describe("Archive Extraction & Path Discovery", () => {
  beforeAll(async () => {
    await ensureDir(TEST_DIR);
    // Create a mock .tgz simulating NPM structure: package/bin/bun
    const npmMockDir = join(TEST_DIR, "npm-mock");
    await ensureDir(join(npmMockDir, "package", "bin"));
    await Bun.write(join(npmMockDir, "package", "bin", "bun"), "mock binary");
    
    // Create .tgz
    await runCommand(["tar", "-czf", NPM_TGZ, "-C", npmMockDir, "package"]);
    await removeDir(npmMockDir);

    // Create a mock .zip simulating GitHub structure: bun-linux-x64/bun
    const ghMockDir = join(TEST_DIR, "gh-mock");
    await ensureDir(join(ghMockDir, "bun-linux-x64"));
    await Bun.write(join(ghMockDir, "bun-linux-x64", "bun"), "mock binary");

    // Create .zip
    if (process.platform === "win32") {
        await runCommand(["powershell", "-Command", `Compress-Archive -Path "${join(ghMockDir, "*")}" -DestinationPath "${GH_ZIP}"`]);
    } else {
        await runCommand(["zip", "-r", GH_ZIP, "bun-linux-x64"], { cwd: ghMockDir });
    }
    await removeDir(ghMockDir);
  });

  afterAll(async () => {
    await removeDir(TEST_DIR);
  });

  it("should extract .tgz and find bun in package/bin/bun", async () => {
    const dest = join(TEST_DIR, "out-npm");
    await ensureDir(dest);
    await extractArchive(NPM_TGZ, dest);

    // Manual simulation of the discovery logic we want to implement
    const possiblePaths = [
        join(dest, "bun"),
        join(dest, "bin", "bun"),
        join(dest, "package", "bin", "bun") // This is what we need to add
    ];
    
    let found = false;
    for (const p of possiblePaths) {
        if (await pathExists(p)) {
            found = true;
            break;
        }
    }
    expect(found).toBe(true);
  });
});
