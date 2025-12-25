import { describe, it, expect, mock, beforeAll, afterAll } from "bun:test";
import { installBunVersion } from "../src/commands/install";
import * as api from "../src/api";
import * as ui from "../src/utils/ui";
import { join } from "path";
import { ensureDir, removeDir, pathExists } from "../src/utils";
import { BVM_VERSIONS_DIR, BVM_CACHE_DIR, EXECUTABLE_NAME } from "../src/constants";
import { runCommand } from "../src/helpers/process";

// Mock environment
const TEST_VERSION = "1.99.99";
const MOCK_CACHE_FILE = join(BVM_CACHE_DIR, `v${TEST_VERSION}-bun-mock.tgz`);

describe("Install Flow (Mocked)", () => {
    beforeAll(async () => {
        // Create mock .tgz
        const mockSrc = join(process.cwd(), ".test-install-mock");
        await ensureDir(join(mockSrc, "package", "bin"));
        await Bun.write(join(mockSrc, "package", "bin", EXECUTABLE_NAME), "mock binary content");
        
        await ensureDir(BVM_CACHE_DIR);
        await runCommand(["tar", "-czf", MOCK_CACHE_FILE, "-C", mockSrc, "package"]);
        await removeDir(mockSrc);
    });

    afterAll(async () => {
        await removeDir(join(BVM_VERSIONS_DIR, `v${TEST_VERSION}`));
        await removeDir(MOCK_CACHE_FILE);
    });

    it("should install from local cache correctly flattening package/bin", async () => {
        // Mock API to return our test version info
        mock.module("../src/api", () => ({
            fetchBunVersions: async () => [`v${TEST_VERSION}`],
            findBunDownloadUrl: async () => ({
                url: "https://mock.registry/bun.tgz",
                foundVersion: `v${TEST_VERSION}`
            })
        }));

        // Mock fetch to simulate downloading (even though we put file in cache, logic might try to fetch if not found)
        // Actually, install logic checks cache first. If we place file correctly, it skips download.
        // We named mock file: v1.99.99-bun-mock.tgz.
        // The install logic expects: `${foundVersion}-${basename(url)}`
        // url is https://mock.registry/bun.tgz -> basename is bun.tgz
        // So cache file should be v1.99.99-bun.tgz
        
        const REAL_CACHE_NAME = join(BVM_CACHE_DIR, `v${TEST_VERSION}-bun.tgz`);
        await runCommand(["mv", MOCK_CACHE_FILE, REAL_CACHE_NAME]);

        // Run install
        await installBunVersion(TEST_VERSION);

        // Verify installation
        const installedBin = join(BVM_VERSIONS_DIR, `v${TEST_VERSION}`, "bin", EXECUTABLE_NAME);
        expect(await pathExists(installedBin)).toBe(true);
        
        const content = await Bun.file(installedBin).text();
        expect(content).toBe("mock binary content");
        
        // Clean up
        await runCommand(["rm", REAL_CACHE_NAME]);
    });
});
