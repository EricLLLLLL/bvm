import { spawnSync } from "bun";
import { join } from "path";
import { homedir } from "os";
import { existsSync, chmodSync, writeFileSync, symlinkSync, unlinkSync, mkdirSync } from "fs";

// --- Configuration ---
const ITERATIONS = 50;
const BVM_HOME = join(process.cwd(), ".sandbox-bench");
const REAL_BUN = process.execPath;

// --- Setup Sandbox ---
if (existsSync(BVM_HOME)) spawnSync(["rm", "-rf", BVM_HOME]);
mkdirSync(join(BVM_HOME, "bin"), { recursive: true });
mkdirSync(join(BVM_HOME, "versions/v1.0.0/bin"), { recursive: true });

// 1. Create a Fake Bun (The target)
const TARGET_BUN = join(BVM_HOME, "versions/v1.0.0/bin/bun");
// We make the target bun a simple shell script that prints 1.0.0 to minimalize target overhead
writeFileSync(TARGET_BUN, `#!/bin/sh\necho "1.0.0"`);
chmodSync(TARGET_BUN, 0o755);

// 2. Setup Current BVM Shim (Bash)
const BASH_SHIM = join(BVM_HOME, "bin/bun-bash");
writeFileSync(BASH_SHIM, `#!/bin/bash
# Simplified BVM Shim Logic
export BVM_DIR="${BVM_HOME}"
# Assume resolution logic happens here (costly)
VERSION="v1.0.0" 
exec "${BVM_HOME}/versions/$VERSION/bin/bun" "$@"
`);
chmodSync(BASH_SHIM, 0o755);

// 3. Setup Native Shim (C - Simulating Rust/Go/Bum)
const C_SOURCE = join(BVM_HOME, "shim.c");
const NATIVE_SHIM = join(BVM_HOME, "bin/bun-native");
writeFileSync(C_SOURCE, `
#include <unistd.h>
#include <stdio.h>
#include <string.h>
#include <stdlib.h>

int main(int argc, char *argv[]) {
    // Simulate minimal logic: effectively just exec
    char *target = "${TARGET_BUN}";
    execv(target, argv);
    return 0;
}
`);
// Compile C shim
spawnSync(["cc", "-O3", C_SOURCE, "-o", NATIVE_SHIM]);


// 4. Setup Symlink (Direct Path - Zero Overhead)
const SYMLINK_PATH = join(BVM_HOME, "bin/bun-symlink");
// In symlink mode, the PATH points directly to the version folder
// We simulate this by running the TARGET_BUN directly via a symlink
try { unlinkSync(SYMLINK_PATH); } catch(e){}
symlinkSync(TARGET_BUN, SYMLINK_PATH);


// --- Benchmark Runner ---
function runBench(name: string, cmd: string, args: string[]) {
    const times: number[] = [];
    // Warmup
    spawnSync([cmd, ...args]);

    for(let i=0; i<ITERATIONS; i++) {
        const start = Bun.nanoseconds();
        spawnSync([cmd, ...args]);
        const end = Bun.nanoseconds();
        times.push(end - start);
    }

    const avg = times.reduce((a,b)=>a+b,0) / times.length;
    return avg / 1_000_000; // ms
}

console.log(`\n🏎️  ULTIMATE ARCHITECTURE BENCHMARK (${ITERATIONS} runs)\n`);

const tBaseline = runBench("Target (Raw Script)", TARGET_BUN, []);
console.log(`🔹 Raw Execution Target: ${tBaseline.toFixed(2)}ms (Physical Limit)\n`);

const tBash = runBench("BVM (Bash Shim)", BASH_SHIM, []);
console.log(`🔸 BVM (Bash Shim):    ${tBash.toFixed(2)}ms  (Diff: +${(tBash - tBaseline).toFixed(2)}ms)`);

const tNative = runBench("Native (C/Rust Sim)", NATIVE_SHIM, []);
console.log(`🚀 Native (Bum/FNM):   ${tNative.toFixed(2)}ms  (Diff: +${(tNative - tBaseline).toFixed(2)}ms)`);

const tSymlink = runBench("Symlink (Volta Mode)", SYMLINK_PATH, []);
console.log(`⚡ Symlink (Direct):    ${tSymlink.toFixed(2)}ms  (Diff: +${(tSymlink - tBaseline).toFixed(2)}ms)`);

console.log("\n---------------------------------------------------");
console.log("🏆 WINNER ANALYSIS:");
if (tSymlink < tNative) {
    console.log("   SYMLINK Architecture is faster than Rust/Go binaries.");
} else {
    console.log("   Native Binary is the fastest.");
}
console.log("---------------------------------------------------\\n");
