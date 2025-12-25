import { describe, expect, test, mock } from "bun:test";
import { fetchBunVersionsFromNpm, findBunDownloadUrl } from "../src/api";

describe("API", () => {
  test("fetchBunVersionsFromNpm returns versions", async () => {
    // Mock fetch
    const mockFetch = mock(async () => new Response(JSON.stringify({
      versions: {
        "1.0.0": {},
        "1.1.0": {}
      }
    })));
    
    // We can't easily mock global fetch in Bun test directly for the module unless we inject it, 
    // but for now let's rely on the real network or skip if offline.
    // Actually, Bun test usually allows mocking.
    // Let's try a real request to npmjs (it's stable).
    
    const versions = await fetchBunVersionsFromNpm();
    expect(versions).toBeInstanceOf(Array);
    expect(versions.length).toBeGreaterThan(0);
    expect(versions).toContain("1.0.0"); // Bun 1.0.0 exists
  });



  test("findBunDownloadUrl resolves specific version", async () => {
    const result = await findBunDownloadUrl("1.0.0");
    expect(result).not.toBeNull();
    // New NPM format check
    // e.g. https://registry.npmjs.org/@oven/bun-darwin-aarch64/-/bun-darwin-aarch64-1.0.0.tgz
    expect(result?.url).toContain("registry.npmjs.org");
    expect(result?.url).toContain("bun");
    expect(result?.url).toContain("1.0.0.tgz");
    expect(result?.foundVersion).toBe("v1.0.0");
  });

  test("findBunDownloadUrl respects BVM_REGISTRY", async () => {
    const oldEnv = process.env.BVM_REGISTRY;
    process.env.BVM_REGISTRY = "https://custom.registry.com";
    
    try {
        const result = await findBunDownloadUrl("1.0.0");
        expect(result?.url).toContain("https://custom.registry.com");
    } finally {
        process.env.BVM_REGISTRY = oldEnv;
    }
  });
});
