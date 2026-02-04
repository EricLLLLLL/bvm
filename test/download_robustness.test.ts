import { describe, it, expect, mock, beforeAll, afterAll } from "bun:test";
import { downloadFileWithProgress } from "../src/commands/install";
import { rm, exists } from "fs/promises";
import { join } from "path";

describe("Download Robustness", () => {
    const testDest = join(process.cwd(), "test-download.tmp");

    afterAll(async () => {
        try { await rm(testDest, { force: true }); } catch(e) {}
    });

    it("should retry on failure and eventually succeed", async () => {
        let callCount = 0;
        
        // Mock global fetch
        const originalFetch = global.fetch;
        global.fetch = mock(async (url) => {
            callCount++;
            if (callCount < 2) {
                return { ok: false, status: 500 };
            }
            return {
                ok: true,
                headers: new Map([["Content-Length", "10"]]),
                body: {
                    getReader: () => ({
                        read: mock()
                            .mockResolvedValueOnce({ done: false, value: Buffer.from("hello") })
                            .mockResolvedValueOnce({ done: true })
                    })
                }
            };
        }) as any;

        try {
            await downloadFileWithProgress("http://example.com", testDest, null, "v1.0.0");
            expect(callCount).toBe(2);
            expect(await exists(testDest)).toBe(true);
        } finally {
            global.fetch = originalFetch;
        }
    });

    it("should cleanup partial file on failure", async () => {
        // Mock fetch to fail during reading
        const originalFetch = global.fetch;
        global.fetch = mock(async () => {
            return {
                ok: true,
                headers: new Map(),
                body: {
                    getReader: () => ({
                        read: async () => { throw new Error("Stream error"); }
                    })
                }
            };
        }) as any;

        try {
            await expect(downloadFileWithProgress("http://example.com", testDest, null, "v1.0.0"))
                .rejects.toThrow("Stream error");
            
            expect(await exists(testDest)).toBe(false);
        } finally {
            global.fetch = originalFetch;
        }
    });
});
