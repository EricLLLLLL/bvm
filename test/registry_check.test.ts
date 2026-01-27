import { describe, expect, test, mock, spyOn } from "bun:test";
import { RegistrySpeedTester, REGISTRIES } from "../src/utils/registry-check";

describe("RegistrySpeedTester", () => {
  test("should identify the fastest registry", async () => {
    const tester = new RegistrySpeedTester();
    
    // Mock fetch to simulate latency
    const originalFetch = global.fetch;
    global.fetch = mock(async (url) => {
      if (url.toString().includes("npmmirror")) {
        await new Promise(r => setTimeout(r, 10)); // Fast
        return new Response("ok");
      }
      if (url.toString().includes("npmjs.org")) {
        await new Promise(r => setTimeout(r, 100)); // Slow
        return new Response("ok");
      }
      return new Response("error", { status: 404 });
    });

    try {
      const best = await tester.getFastestRegistry();
      expect(best).toBe(REGISTRIES.NPM_MIRROR);
    } finally {
      global.fetch = originalFetch;
    }
  });

  test("should fallback to official if mirror fails", async () => {
    const tester = new RegistrySpeedTester();
    
    const originalFetch = global.fetch;
    global.fetch = mock(async (url) => {
      if (url.toString().includes("npmmirror")) {
        throw new Error("Network Error");
      }
      return new Response("ok");
    });

    try {
      const best = await tester.getFastestRegistry();
      expect(best).toBe(REGISTRIES.NPM);
    } finally {
      global.fetch = originalFetch;
    }
  });
});
