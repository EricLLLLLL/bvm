import { describe, expect, test } from "bun:test";
import { checkBunVersionExists } from "../src/api";

describe("checkBunVersionExists", () => {
    test("returns true for a known version", async () => {
        const result = await checkBunVersionExists("1.1.0");
        expect(result).toBe(true);
    });

    test("returns false for a non-existent version", async () => {
        const result = await checkBunVersionExists("999.999.999");
        expect(result).toBe(false);
    });
});
