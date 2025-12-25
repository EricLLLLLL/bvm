import { describe, it, expect } from "bun:test";
import { getBunNpmPackage, getBunDownloadUrl } from "../src/utils/npm-lookup";

describe("getBunNpmPackage", () => {
  it("should map darwin arm64", () => {
    expect(getBunNpmPackage("darwin", "arm64")).toBe("@oven/bun-darwin-aarch64");
  });

  it("should map darwin x64", () => {
    expect(getBunNpmPackage("darwin", "x64")).toBe("@oven/bun-darwin-x64");
  });

  it("should map linux arm64", () => {
    expect(getBunNpmPackage("linux", "arm64")).toBe("@oven/bun-linux-aarch64");
  });

  it("should map linux x64", () => {
    expect(getBunNpmPackage("linux", "x64")).toBe("@oven/bun-linux-x64");
  });

  it("should map windows x64", () => {
    expect(getBunNpmPackage("win32", "x64")).toBe("@oven/bun-windows-x64");
  });

  it("should return null for unknown", () => {
    expect(getBunNpmPackage("unknown", "x64")).toBeNull();
  });
});

describe("getBunDownloadUrl", () => {
  it("should generate URL for scoped package on npmmirror", () => {
    const url = getBunDownloadUrl("@oven/bun-darwin-aarch64", "1.1.0", "https://registry.npmmirror.com");
    expect(url).toBe("https://registry.npmmirror.com/@oven/bun-darwin-aarch64/-/bun-darwin-aarch64-1.1.0.tgz");
  });

  it("should generate URL for scoped package on npmjs", () => {
    const url = getBunDownloadUrl("@oven/bun-darwin-aarch64", "1.1.0", "https://registry.npmjs.org");
    expect(url).toBe("https://registry.npmjs.org/@oven/bun-darwin-aarch64/-/bun-darwin-aarch64-1.1.0.tgz");
  });

  it("should generate URL for unscoped package", () => {
    const url = getBunDownloadUrl("bun", "1.1.0", "https://registry.npmjs.org");
    expect(url).toBe("https://registry.npmjs.org/bun/-/bun-1.1.0.tgz");
  });

  it("should handle trailing slash in registry", () => {
    const url = getBunDownloadUrl("bun", "1.1.0", "https://registry.npmjs.org/");
    expect(url).toBe("https://registry.npmjs.org/bun/-/bun-1.1.0.tgz");
  });
});
