import { describe, it, expect, mock, afterAll } from "bun:test";
import { generateBunfig } from "../src/commands/install";

describe("Bunfig Generation", () => {
    const originalWrite = Bun.write;

    afterAll(() => {
        Bun.write = originalWrite;
    });

    it("should escape backslashes on Windows", async () => {
        const mockWrite = mock(() => Promise.resolve(0));
        Bun.write = mockWrite;

        const testPath = "C:\\Users\\User\\.bvm\\versions\\v1.0.0";
        await generateBunfig(testPath, { platform: "win32", registryUrl: "https://registry.npmmirror.com" });

        const callArgs = mockWrite.mock.calls[0];
        const content = callArgs[1] as string;

        // Expect double backslashes in the output content
        expect(content).toContain('globalDir = "C:\\\\Users\\\\User\\\\.bvm\\\\versions\\\\v1.0.0"');
        expect(content).toContain('globalBinDir = "C:\\\\Users\\\\User\\\\.bvm\\\\versions\\\\v1.0.0\\\\bin"');
    });

    it("should include the fastest registry in bunfig.toml", async () => {
        const mockWrite = mock(() => Promise.resolve(0));
        Bun.write = mockWrite;

        const testPath = "C:\\Users\\User\\.bvm\\versions\\v1.0.0";
        await generateBunfig(testPath, { platform: "win32", registryUrl: "https://registry.npmmirror.com" });

        const content = mockWrite.mock.calls[0][1] as string;
        
        // This is the new requirement
        expect(content).toContain('[install.registry]');
        expect(content).toContain('url = "https://registry.npmmirror.com"');
    });
});
