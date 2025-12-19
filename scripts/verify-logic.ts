import { join } from "path";
import { rmSync, mkdirSync, writeFileSync, chmodSync, existsSync } from "fs";
import { spawnSync } from "child_process";

const SANDBOX_DIR = join(process.cwd(), ".sandbox-logic");
const BVM_BINARY = join(process.cwd(), "src/index.ts");

function runBvm(...args: string[]) {
    return spawnSync("npx", ["bun", "run", BVM_BINARY, ...args], {
        env: {
            ...process.env,
            HOME: SANDBOX_DIR,
            BVM_TEST_MODE: "true",
            NO_COLOR: "1"
        },
        encoding: "utf8"
    });
}

console.log("🚀 Starting Logic Verification Sandbox...");

// 1. Reset Sandbox
if (existsSync(SANDBOX_DIR)) rmSync(SANDBOX_DIR, { recursive: true, force: true });
mkdirSync(SANDBOX_DIR, { recursive: true });

// 2. Mock Installations
const versionsDir = join(SANDBOX_DIR, ".bvm", "versions");
mkdirSync(join(versionsDir, "v1.3.4", "bin"), { recursive: true });
mkdirSync(join(versionsDir, "v1.3.5", "bin"), { recursive: true });

const createBunStub = (ver: string) => {
    const path = join(versionsDir, `v${ver}`, "bin", "bun");
    writeFileSync(path, `#!/usr/bin/env bash\necho "${ver}"`);
    chmodSync(path, 0o755);
};
createBunStub("1.3.4");
createBunStub("1.3.5");

// 3. Test: Initial setup
console.log("📝 Setting up aliases and versions...");
runBvm("alias", "default", "1.3.5");
runBvm("use", "1.3.5");
runBvm("rehash");

// 4. Test: bvm which yarn (Should succeed due to auto-rehash)
console.log("🔍 Testing 'bvm which yarn'...");
const whichYarn = runBvm("which", "yarn");
if (whichYarn.stdout.includes("v1.3.5/bin/yarn")) {
    console.log("✅ which yarn: Passed (Path correctly resolved)");
} else {
    console.error("❌ which yarn: Failed\n", whichYarn.stdout);
    process.exit(1);
}

// 5. Test: Version switching
console.log("🔄 Switching to v1.3.4...");
runBvm("use", "1.3.4");
const current = runBvm("current");
if (current.stdout.includes("v1.3.4")) {
    console.log("✅ use 1.3.4: Passed");
} else {
    console.error("❌ use 1.3.4: Failed\n", current.stdout);
    process.exit(1);
}

// 6. Test: which yarn should now point to 1.3.4
const whichYarn4 = runBvm("which", "yarn");
if (whichYarn4.stdout.includes("v1.3.4/bin/yarn")) {
    console.log("✅ which yarn (after switch): Passed");
} else {
    console.error("❌ which yarn (after switch): Failed\n", whichYarn4.stdout);
    process.exit(1);
}

// 7. Test: Uninstall active version
console.log("🗑️ Testing uninstall of active version...");
runBvm("default", "1.3.4"); // Ensure 1.3.5 is not default
runBvm("use", "1.3.5");
const uninst = runBvm("uninstall", "1.3.5");
if (uninst.status === 0 && uninst.stdout.includes("uninstalled successfully")) {
    console.log("✅ uninstall 1.3.5: Passed");
} else {
    console.error("❌ uninstall 1.3.5: Failed\n", uninst.stdout || uninst.stderr);
    process.exit(1);
}

// 8. Test: Environment stability after uninstall
const ls = runBvm("ls");
if (ls.stdout.includes("* v1.3.4 (current)")) {
    console.log("✅ Sandbox stability: Passed (Fallback to default worked)");
} else {
    console.error("❌ Sandbox stability: Failed (Environment broken?)\n", ls.stdout);
    process.exit(1);
}

console.log("\n✨ All logic verifications passed in sandbox!");
rmSync(SANDBOX_DIR, { recursive: true, force: true });
