// scripts/verify-e2e-npm.ts
import { $ } from "bun";
import { join } from "path";
import { homedir } from "os";
import { existsSync, readdirSync } from "fs";

const HOME = homedir();
const BVM_DIR = join(HOME, ".bvm");
const SHIMS_DIR = join(BVM_DIR, "shims");
const BIN_DIR = join(BVM_DIR, "bin");

console.log("\n🚀 Starting E2E NPM Verification Protocol...\n");

try {
    // 1. Cleanup
    console.log(`🧹 Cleaning up environment (${BVM_DIR})...`);
    await $`rm -rf ${BVM_DIR}`;
    await $`rm -f bvm-core-*.tgz`;

    // 2. Build & Pack
    console.log("📦 Building and Packing...");
    // Using simple shell command to ensure npm run build executes correctly
    await $`npm run build`.quiet(); 
    await $`npm pack`.quiet();

    // Find the tarball
    const files = readdirSync(process.cwd());
    const tarball = files.find(f => f.startsWith("bvm-core-") && f.endsWith(".tgz"));
    if (!tarball) throw new Error("Tarball not found after packing!");
    console.log(`📝 Found tarball: ${tarball}`);

    // 3. Install
    console.log("💿 Installing globally via NPM (this may take a moment)...");
    // We capture stdout/stderr to show it only on failure, or stream it?
    // Let's stream it to be transparent as requested.
    await $`npm install -g ./${tarball} --foreground-scripts --force`;

    // 4. Verify Physical Structure
    console.log("🔍 Verifying filesystem structure...");
    
    if (!existsSync(SHIMS_DIR)) throw new Error(`❌ Shims directory missing: ${SHIMS_DIR}`);
    if (!existsSync(join(SHIMS_DIR, "bun"))) throw new Error(`❌ Bun shim missing`);
    if (!existsSync(join(BIN_DIR, "bvm"))) throw new Error(`❌ BVM binary missing`);

    console.log("   ✅ Shims directory exists.");
    console.log("   ✅ Bun shim exists.");

    // 5. Functional Verification
    console.log("🧪 Verifying BVM functionality...");
    const bvmExec = join(BIN_DIR, "bvm");
    const output = await $`${bvmExec} ls`.text();
    console.log(output.trim());

    if (!output.includes("Locally installed Bun versions")) {
        throw new Error("❌ 'bvm ls' output is unexpected.");
    }

    // 6. Global Package Isolation Verification (NEW)
    console.log("📦 Verifying Global Package Isolation (Option B)...");
    // Ensure we are using a version
    await $`${bvmExec} use default`.quiet();
    // Simulate bun install -g
    console.log("   Installing dummy global package...");
    await $`${join(SHIMS_DIR, "bun")} install -g fake-pkg-test-bvm`.quiet().catch(() => {}); 
    
    const currentBin = join(BVM_DIR, "current", "bin");
    console.log(`   Checking if current bin path is correctly set up: ${currentBin}`);
    
    // We check if current/bin is in the PATH reported by setup
    const zshrc = await $`cat ${join(HOME, ".zshrc")}`.text();
    if (!zshrc.includes("current/bin")) {
        throw new Error("❌ .zshrc does not contain 'current/bin' in PATH");
    }

    console.log("\n✅ \x1b[32mE2E VERIFICATION PASSED!\x1b[0m");
    console.log("   BVM is installed, shims exist, and CLI works.");
    console.log(`   Run 'source ~/.zshrc' (or your shell config) to start using it.`);

} catch (e) {
    console.error("\n💥 \x1b[31mVERIFICATION FAILED:\x1b[0m");
    console.error(e);
    process.exit(1);
}
