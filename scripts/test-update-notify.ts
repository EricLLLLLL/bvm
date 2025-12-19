import { join } from 'path';
import { homedir } from 'os';
import { writeFileSync, mkdirSync, rmSync, readFileSync } from 'fs';
import { spawnSync } from 'child_process';

const TEST_HOME = join(process.cwd(), '.sandbox-update-test');
const BVM_CACHE_DIR = join(TEST_HOME, '.bvm', 'cache');
const UPDATE_CHECK_FILE = join(BVM_CACHE_DIR, 'update-check.json');

console.log("🧪 Testing Update Notification Logic...");

// 1. Prepare Sandbox
rmSync(TEST_HOME, { recursive: true, force: true });
mkdirSync(BVM_CACHE_DIR, { recursive: true });

// 2. Mock a NEWER version in cache (v9.9.9)
const fakeUpdate = {
    lastChecked: Date.now(),
    latestVersion: "9.9.9"
};
writeFileSync(UPDATE_CHECK_FILE, JSON.stringify(fakeUpdate));

// 3. Run BVM current in sandbox
// We use npx bun run src/index.ts directly
const res = spawnSync("npx", ["bun", "run", "src/index.ts", "current"], {
    env: {
        ...process.env,
        HOME: TEST_HOME,
        NO_COLOR: "1"
    },
    encoding: "utf8"
});

console.log("--- BVM Output Start ---");
console.log(res.stdout);
console.log("--- BVM Output End ---");

if (res.stdout.includes("Update available!") && res.stdout.includes("9.9.9")) {
    console.log("✅ Update Notification Test: PASSED");
} else {
    console.error("❌ Update Notification Test: FAILED (Box not found or version mismatch)");
    process.exit(1);
}

// 4. Test background check (mocking old cache)
const oldCheck = {
    lastChecked: Date.now() - (48 * 60 * 60 * 1000), // 2 days ago
    latestVersion: "1.0.0"
};
writeFileSync(UPDATE_CHECK_FILE, JSON.stringify(oldCheck));

console.log("\n🧪 Testing Background Refresh Logic...");
const res2 = spawnSync("npx", ["bun", "run", "src/index.ts", "current"], {
    env: {
        ...process.env,
        HOME: TEST_HOME,
        NO_COLOR: "1"
    },
    encoding: "utf8"
});

// Give it a moment to potentially write (though we awaited it in index.ts)
const updatedContent = JSON.parse(readFileSync(UPDATE_CHECK_FILE, 'utf8'));
if (updatedContent.lastChecked > oldCheck.lastChecked) {
    console.log(`✅ Background Refresh Test: PASSED (lastChecked updated from ${oldCheck.lastChecked} to ${updatedContent.lastChecked})`);
} else {
    console.error("❌ Background Refresh Test: FAILED (lastChecked was not updated)");
    process.exit(1);
}

rmSync(TEST_HOME, { recursive: true, force: true });
console.log("\n✨ All Update Checker tests passed!");
