import { describe, expect, test } from "bun:test";
import packageJson from "../package.json";

describe("Version Check", () => {
  test("package.json version should be 1.1.36", () => {
    expect(packageJson.version).toBe("1.1.36");
  });
});
