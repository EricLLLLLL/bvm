import { test } from "bun:test";

test("check process.platform", () => {
    console.log("process.platform inside test is:", process.platform);
});
