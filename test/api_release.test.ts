import { describe, expect, test, vi, beforeEach, afterEach } from "bun:test";
import { fetchLatestBvmReleaseInfo } from "../src/api";
import { REPO_FOR_BVM_CLI, ASSET_NAME_FOR_BVM } from "../src/constants";
import * as networkUtils from "../src/utils/network-utils";

describe("BVM Release API (NPM primary)", () => {
    
    test("fetchLatestBvmReleaseInfo fetches from NPM registry", async () => {
        const spy = vi.spyOn(networkUtils, "getFastestRegistry").mockResolvedValue("https://registry.npmjs.org");
        
        // Mock global fetch
        const originalFetch = global.fetch;
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                "latest": "1.1.11"
            })
        });

        const info = await fetchLatestBvmReleaseInfo();
        
        expect(info).not.toBeNull();
        expect(info?.tagName).toBe("v1.1.11");
        expect(info?.downloadUrl).toContain("v1.1.11");
        
        spy.mockRestore();
        global.fetch = originalFetch;
    });

    test("fetchLatestBvmReleaseInfo handles NPM failure", async () => {
        const originalFetch = global.fetch;
        global.fetch = vi.fn().mockResolvedValue({
            ok: false,
            status: 500
        });

        const info = await fetchLatestBvmReleaseInfo();
        expect(info).toBeNull();

        global.fetch = originalFetch;
    });
});
