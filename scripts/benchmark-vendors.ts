import { spawnSync } from "bun";
import { join } from "path";
import { existsSync, mkdirSync, rmSync, writeFileSync, chmodSync } from "fs";

// --- Configuration ---
const BENCH_DIR = join(process.cwd(), ".bench-vendors");
const ITERATIONS = 10;

// Setup directories
if (existsSync(BENCH_DIR)) rmSync(BENCH_DIR, { recursive: true, force: true });
mkdirSync(BENCH_DIR, { recursive: true });

console.log(`\n🏎️  PREPARING VENDOR BENCHMARK (Sandbox: ${BENCH_DIR})`);

// --- 1. Install BVM (Local Build) ---
console.log("📦 Setup BVM...");
const BVM_HOME = join(BENCH_DIR, "bvm");
mkdirSync(join(BVM_HOME, "bin"), { recursive: true });
// Use the dist/index.js we just built
const BVM_JS = join(process.cwd(), "dist", "index.js");
// Create a wrapper similar to the real one
const BVM_BIN = join(BVM_HOME, "bin", "bvm");
writeFileSync(BVM_BIN, `#!/bin/bash
export BVM_DIR="${BVM_HOME}"
# Mock the shim/runtime logic slightly for pure CLI speed test
exec bun "${BVM_JS}" "$@"
`);
chmodSync(BVM_BIN, 0o755);


// --- 2. Install NVM (Node Version Manager) ---
console.log("📦 Downloading & Installing NVM...");
const NVM_DIR = join(BENCH_DIR, "nvm");
mkdirSync(NVM_DIR, { recursive: true });
// Download nvm.sh directly to avoid running their complex install script which touches profile
const NVM_URL = "https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/nvm.sh";
const nvmScript = await fetch(NVM_URL).then(r => r.text());
writeFileSync(join(NVM_DIR, "nvm.sh"), nvmScript);


// --- 3. Install Bum (Rust Bun Manager) ---
console.log("📦 Downloading & Installing Bum...");
const BUM_HOME = join(BENCH_DIR, "bum");
mkdirSync(BUM_HOME, { recursive: true });
// We try to fetch the binary directly if possible, or use their script confined
// Bum install script usually downloads to $HOME/.bum
const BUM_INSTALLER = join(BENCH_DIR, "install_bum.sh");
const bumInstallScript = await fetch("https://github.com/owenizedd/bum/raw/main/install.sh").then(r => r.text());
writeFileSync(BUM_INSTALLER, bumInstallScript);
chmodSync(BUM_INSTALLER, 0o755);

// Run bum installer with modified HOME
spawnSync(["bash", BUM_INSTALLER], {
    env: { ...process.env, HOME: BENCH_DIR, CARGO_HOME: join(BENCH_DIR, ".cargo") },
    stdout: "ignore", // Hide install logs
    stderr: "ignore"
});
const BUM_BIN = join(BENCH_DIR, ".bum", "bin", "bum");


// --- Benchmark Helpers ---

function formatTime(ns: number) {
    return (ns / 1_000_000).toFixed(2) + "ms";
}

function runTest(name: string, cmd: string, args: string[], env: any = {}) {
    process.stdout.write(`running ${name}... `);
    const times = [];
    
    // Warmup
    try {
        spawnSync([cmd, ...args], { env: { ...process.env, ...env } });
    } catch(e) {
        console.log("❌ Failed to run (missing?)");
        return null;
    }

    for (let i = 0; i < ITERATIONS; i++) {
        const start = Bun.nanoseconds();
        // Shell true for NVM sourcing, false for binaries
        if (name.includes("NVM")) {
            spawnSync(["bash", "-c", `${cmd} ${args.join(" ")}`], { env: { ...process.env, ...env } });
        } else {
            spawnSync([cmd, ...args], { env: { ...process.env, ...env } });
        }
        const end = Bun.nanoseconds();
        times.push(end - start);
    }
    
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    console.log(formatTime(avg));
    return avg;
}

console.log("\n🔥 STARTING BENCHMARK (Average of " + ITERATIONS + " runs)\n");

// --- TEST CASES ---

// 1. CLI Startup Speed (How fast to see help/version?)
console.log(dim("Test 1: CLI Startup / Help (Responsiveness)"));

const t_bvm = runTest("BVM (bvm --version)", BVM_BIN, ["--version"], { NO_COLOR: 1 });

let t_bum = null;
if (existsSync(BUM_BIN)) {
    t_bum = runTest("Bum (bum --version)", BUM_BIN, ["--version"]);
} else {
    console.log("⚠️ Bum binary not found (install failed?), skipping.");
}

// NVM is a shell function, so we measure "Source + Run"
// This mimics the delay a user feels when opening a terminal or running nvm command
const t_nvm = runTest("NVM (source + nvm --version)", `source ${join(NVM_DIR, "nvm.sh")} && nvm`, ["--version"]);


// 2. Shim Overhead (If possible)
// BVM has shims. Bum links. NVM modifies PATH.
// Since we don't want to install Bun/Node versions fully in this ephemeral test,
// we compare the "Manager Overhead".

console.log("\n📊 SUMMARY:");
const results = [
    { name: "BVM", time: t_bvm },
    { name: "Bum (Rust)", time: t_bum },
    { name: "NVM (Shell)", time: t_nvm }
].filter(r => r.time !== null).sort((a, b) => a.time - b.time);

console.table(results.map(r => ({
    "Manager": r.name,
    "Time": formatTime(r.time!),
    "vs BVM": r.name === "BVM" ? "-" : (r.time! / t_bvm!).toFixed(1) + "x"
})));

// Colors
function dim(s: string) { return `\x1b[2m${s}\x1b[0m`; }
