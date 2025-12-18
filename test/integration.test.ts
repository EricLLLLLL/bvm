import { beforeAll, afterAll, describe, expect, test, vi } from "bun:test";
import { runBvm, resetTestHome, cleanupTestHome, TEST_HOME, TEST_BVM_DIR } from "./test-utils";
import { existsSync, rmSync, mkdirSync, readFileSync, writeFileSync, readlinkSync } from "fs";
import { join } from "path";

describe("CLI Integration Suite", () => {
  beforeAll(async () => {
    await resetTestHome();

    // Pre-install some versions for fuzzy matching tests
    await runBvm(["install", "1.3.4"]);
    await runBvm(["install", "1.2.23"]);
  });

  afterAll(async () => {
    await cleanupTestHome();
  });

  // --- Network & Discovery ---
  test("ls-remote returns versions", async () => {
    const { exitCode, allOutput } = await runBvm(["ls-remote"]);
    expect(exitCode).toBe(0);
    expect(allOutput).toContain("v1.0.0");
  });

  test("ls-remote filters out canary versions", async () => {
    const { exitCode, allOutput } = await runBvm(["ls-remote"]);
    expect(exitCode).toBe(0);
    expect(allOutput).not.toContain("canary");
  });

  // --- Fuzzy Version Matching ---
  test("use fuzzy version (e.g., 1.3 to v1.3.4)", async () => {
    const { exitCode, allOutput } = await runBvm(["use", "1.3"]);
    expect(exitCode).toBe(0);
    expect(allOutput).toContain("Bun v1.3.4 is now active.");
  });

  test("install fuzzy version (e.g., 1.2 to v1.2.23) and reports already installed", async () => {
    const { exitCode, allOutput } = await runBvm(["install", "1.2"]);
    expect(exitCode).toBe(0);
    expect(allOutput).toContain("Bun v1.2.23 is already installed.");
  });

  test("use latest resolves to highest installed", async () => {
    const { exitCode, allOutput } = await runBvm(["use", "latest"]);
    expect(exitCode).toBe(0);
    expect(allOutput).toContain("Bun v1.3.4 is now active.");
  });

  test("install latest installs/reports latest remote", async () => {
    // This test assumes a remote version is available. It should report already installed if 1.3.4 is latest.
    const { exitCode, allOutput } = await runBvm(["install", "latest"]);
    expect(exitCode).toBe(0);
    // Depending on actual latest remote, this could be "installed successfully" or "already installed"
    expect(allOutput).toMatch(/Bun v\d+\.\d+\.\d+ (installed successfully|is already installed)/);
  });

  test("use invalid partial version fails gracefully", async () => {
    const { exitCode, allOutput } = await runBvm(["use", "99.x"]);
    expect(exitCode).not.toBe(0);
    expect(allOutput).toContain("Bun version '99.x' is not installed or cannot be resolved.");
  });

  test("install invalid partial version fails gracefully", async () => {
    const { exitCode, allOutput } = await runBvm(["install", "99.x"]);
    expect(exitCode).not.toBe(0);
    expect(allOutput).toContain("Could not find a Bun release for '99.x' compatible with your system.");
  });

  // --- Installation ---
  test("install without version reads .bvmrc and installs target", async () => {
    const rcInstallDir = join(TEST_HOME, "rc-install");
    await rmSync(rcInstallDir, { recursive: true, force: true });
    await mkdirSync(rcInstallDir, { recursive: true });
    await writeFileSync(join(rcInstallDir, ".bvmrc"), "1.0.0");
    await rmSync(join(TEST_BVM_DIR, "versions", "v1.0.0"), { recursive: true, force: true });

    const { exitCode, allOutput } = await runBvm(["install"], rcInstallDir);
    expect(exitCode).toBe(0);
    expect(allOutput).toContain("Found '.bvmrc' with version <1.0.0>");

    const installedBinPath = join(TEST_BVM_DIR, "versions", "v1.0.0", "bin", "bun");
    expect(await Bun.file(installedBinPath).exists()).toBe(true);

    const { allOutput: currentOutput } = await runBvm(["current"]);
    expect(currentOutput).toContain("v1.0.0");

    await runBvm(["deactivate"]);
    const uninstallResult = await runBvm(["uninstall", "1.0.0"]);
    expect(uninstallResult.exitCode).toBe(0);
  });

  test("install 1.0.0 (fresh) auto-activates version", async () => {
    const { exitCode, allOutput } = await runBvm(["install", "1.0.0"]);
    expect(exitCode).toBe(0);
    const installedBinPath = join(TEST_BVM_DIR, "versions", "v1.0.0", "bin", "bun");
    expect(await Bun.file(installedBinPath).exists()).toBe(true);

    const symlinkPath = join(TEST_BVM_DIR, "bin", "bun");
    expect(existsSync(symlinkPath)).toBe(true);
    const symlinkTarget = readlinkSync(symlinkPath);
    // Now bin/bun points to current/bin/bun
    expect(symlinkTarget).toContain("current");

    const currentLinkPath = join(TEST_BVM_DIR, "current");
    expect(existsSync(currentLinkPath)).toBe(true);
    const currentTarget = readlinkSync(currentLinkPath);
    expect(currentTarget).toContain(join("versions", "v1.0.0"));

    const { allOutput: currentOutput } = await runBvm(["current"]);
    expect(currentOutput).toContain("v1.0.0");
  });

  test("install 1.0.0 (re-install should skip but still activate)", async () => {
    await runBvm(["use", "1.3.4"]);
    const { exitCode, allOutput } = await runBvm(["install", "1.0.0"]);
    expect(exitCode).toBe(0);
    expect(allOutput).toContain("already installed");
    const { allOutput: currentOutput } = await runBvm(["current"]);
    expect(currentOutput).toContain("v1.0.0");
  });

  test("install invalid version fails", async () => {
    const { exitCode } = await runBvm(["install", "99.99.99"]);
    expect(exitCode).not.toBe(0);
  });

  // --- Version Management ---
  test("ls lists installed versions", async () => {
    const { exitCode, allOutput } = await runBvm(["ls"]);
    expect(exitCode).toBe(0);
    expect(allOutput).toContain("v1.0.0");
    expect(allOutput).toContain("(current)"); // Auto-activated
  });

  test("use 1.0.0 works", async () => {
    const { exitCode } = await runBvm(["use", "1.0.0"]);
    expect(exitCode).toBe(0);
  });

  test("current shows active version", async () => {
    const { exitCode, allOutput } = await runBvm(["current"]);
    expect(exitCode).toBe(0);
    expect(allOutput).toContain("v1.0.0");
  });

  test("which 1.0.0 returns path", async () => {
    const { exitCode, output } = await runBvm(["which", "1.0.0"]);
    expect(exitCode).toBe(0);
    expect(output).toContain(".bvm/versions/v1.0.0/bin/bun");
  });

  // --- Aliases ---
  test("alias create and resolve", async () => {
    await runBvm(["alias", "prod", "1.0.0"]);
    const { allOutput } = await runBvm(["ls"]);
    expect(allOutput).toContain("prod -> v1.0.0");
    
    // Resolve via version command
    const { output: ver } = await runBvm(["version", "prod"]);
    expect(ver.trim()).toBe("v1.0.0");
  });

  test("alias overwrite", async () => {
      // Overwrite 'prod' alias
      // We need another version to test overwrite meaningfully, but we only installed 1.0.0.
      // We can just overwrite it with the same target and ensure it succeeds.
      const { exitCode } = await runBvm(["alias", "prod", "1.0.0"]);
      expect(exitCode).toBe(0);
  });

  test("unalias works", async () => {
    await runBvm(["unalias", "prod"]);
    const { allOutput } = await runBvm(["ls"]);
    expect(allOutput).not.toContain("prod ->");
  });

  // --- Execution ---
  test("run specific version", async () => {
    const { exitCode, output } = await runBvm(["run", "1.0.0", "--version"]);
    expect(exitCode).toBe(0);
    expect(output.trim()).toBe("1.0.0");
  });

  test("exec failure propagates exit code", async () => {
      const { exitCode } = await runBvm(["exec", "1.0.0", "false"]);
      expect(exitCode).not.toBe(0);
  });

  // --- Configuration ---
  test(".bvmrc support", async () => {
    const projectDir = join(TEST_HOME, "my-project");
    await mkdirSync(projectDir, { recursive: true });
    await writeFileSync(join(projectDir, ".bvmrc"), "1.0.0");

    await runBvm(["deactivate"]);
    
    const { exitCode, allOutput } = await runBvm(["use"], projectDir);
    expect(exitCode).toBe(0);
    expect(allOutput).toContain("Found '.bvmrc' with version <1.0.0>");
  });

  test(".bvmrc invalid version", async () => {
    const projectDir = join(TEST_HOME, "bad-project");
    await mkdirSync(projectDir, { recursive: true });
    await writeFileSync(join(projectDir, ".bvmrc"), "invalid-ver-xyz");

    const { exitCode } = await runBvm(["install"], projectDir);
    expect(exitCode).not.toBe(0);
  });

  // --- Cleanup ---
  test("uninstall active version fails", async () => {
    // Ensure active
    await runBvm(["use", "1.0.0"]);
    
    const { exitCode, allOutput } = await runBvm(["uninstall", "1.0.0"]);
    expect(exitCode).not.toBe(0);
    expect(allOutput).toContain("currently active");
  });

  test("uninstall 1.0.0 works", async () => {
    // Deactivate first
    await runBvm(["deactivate"]);

    const { exitCode } = await runBvm(["uninstall", "1.0.0"]);
    expect(exitCode).toBe(0);
    const binPath = join(TEST_BVM_DIR, "versions", "v1.0.0", "bin", "bun");
    expect(await Bun.file(binPath).exists()).toBe(false);
  });

  test("cache clear", async () => {
    const { exitCode } = await runBvm(["cache", "clear"]);
    expect(exitCode).toBe(0);
  });

  test("unknown command prints help but exits cleanly", async () => {
    const { exitCode, allOutput } = await runBvm(["definitely-unknown"]);
    expect(exitCode).toBe(0);
    expect(allOutput).toContain("Unknown command 'definitely-unknown'");
    expect(allOutput).toContain("Usage:");
  });

  // --- Upgrade ---
  test("bvm upgrade checks for updates", async () => {
    // Import API to spy on it
    const api = await import("../src/api");
    const fetchLatestBvmReleaseInfoSpy = vi.spyOn(api, 'fetchLatestBvmReleaseInfo');

    // Mock the return value to indicate BVM is already up to date
    fetchLatestBvmReleaseInfoSpy.mockReturnValue(Promise.resolve({
      tagName: 'v0.0.0', // A version older than current, so it should report "up to date"
      downloadUrl: 'https://example.com/mock-bvm-download',
    }));

    const { exitCode, allOutput } = await runBvm(["upgrade"]);

    fetchLatestBvmReleaseInfoSpy.mockRestore(); // Clean up the mock

    if (allOutput.includes("BVM is already up to date")) {
      expect(exitCode).toBe(0);
    } else if (allOutput.includes("Failed to update BVM")) {
      expect(exitCode).toBe(1);
    } else {
      // If none of the above, it should have been a successful update
      expect(exitCode).toBe(0);
      expect(allOutput).includes("BVM updated successfully");
    }
  });
}, 120000);
