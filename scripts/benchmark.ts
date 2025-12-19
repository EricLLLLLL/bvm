import { spawnSync } from "bun";
import { join } from "path";
import { homedir } from "os";
import { existsSync, chmodSync } from "fs";

// Configuration
const ITERATIONS = 20; // Run each test 20 times for average
const BVM_HOME = join(homedir(), ".bvm");
const SHIM_PATH = join(BVM_HOME, "shims", "bun");
const NATIVE_PATH = process.execPath; // The bun binary running this script
const BVM_CLI = join(process.cwd(), "dist", "index.js");

// Colors
const dim = (s: string) => `\x1b[2m${s}\x1b[0m`;
const bold = (s: string) => `\x1b[1m${s}\x1b[0m`;
const green = (s: string) => `\x1b[32m${s}\x1b[0m`;
const cyan = (s: string) => `\x1b[36m${s}\x1b[0m`;
const yellow = (s: string) => `\x1b[33m${s}\x1b[0m`;

function formatTime(ns: number) {
  const ms = ns / 1_000_000;
  return `${ms.toFixed(2)}ms`;
}

function runBenchmark(name: string, cmd: string, args: string[]) {
  process.stdout.write(`${cyan("Running:")} ${name} ${dim(`(${cmd} ${args.join(" ")})`)} `);
  
  const times: number[] = [];

  // Warmup
  spawnSync([cmd, ...args], { env: { ...process.env, NO_COLOR: "1" } });

  for (let i = 0; i < ITERATIONS; i++) {
    const start = Bun.nanoseconds();
    const result = spawnSync([cmd, ...args], { 
        env: { ...process.env, NO_COLOR: "1", BVM_TEST_MODE: "false" } 
    });
    const end = Bun.nanoseconds();
    
    if (result.exitCode !== 0) {
        console.error(`\n❌ Error in ${name}:`, result.stderr.toString());
        return null;
    }
    times.push(end - start);
    process.stdout.write(".");
  }

  const total = times.reduce((a, b) => a + b, 0);
  const avg = total / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);

  console.log(" ✅");
  return { name, avg, min, max };
}

console.log(bold("\n🏎️  BVM Performance Benchmark\n"));

// 1. Ensure Shim exists and executable
if (!existsSync(SHIM_PATH)) {
    console.error("Shim not found. Please run 'bvm rehash' first.");
    process.exit(1);
}

// 2. Define Tests
const results = [];

// Test A: Native Bun (Baseline)
results.push(runBenchmark("Native Bun", NATIVE_PATH, ["--version"]));

// Test B: BVM Shim (The Proxy)
results.push(runBenchmark("BVM Shim (Bash)", SHIM_PATH, ["--version"]));

// Test B2: Compiled Shim (The Future?)
const COMPILED_SHIM = join(process.cwd(), "shim-binary");
results.push(runBenchmark("BVM Shim (Binary)", COMPILED_SHIM, ["--version"]));

// Test C: BVM CLI (Command parsing, startup)
// We use 'bun run dist/index.js' to simulate the wrapper overhead
results.push(runBenchmark("BVM CLI (ls)", NATIVE_PATH, ["run", BVM_CLI, "ls"]));

// 3. Report
console.log(bold("\n📊 Results (Average of " + ITERATIONS + " runs):"));
console.table(results.map(r => {
    if (!r) return null;
    return {
        "Test Name": r.name,
        "Average Time": formatTime(r.avg),
        "Min Time": formatTime(r.min),
        "Max Time": formatTime(r.max),
    };
}).filter(Boolean));

// 4. Analysis
if (results[0] && results[1]) {
    const nativeAvg = results[0].avg;
    const shimAvg = results[1].avg;
    const overhead = shimAvg - nativeAvg;
    
    console.log(bold("\n🧐 Analysis:"));
    console.log(`BVM Overhead: ${yellow(formatTime(overhead))} per command.`);
    
    if (overhead < 30_000_000) { // < 30ms
        console.log(green("✅ Result: EXCELLENT. The overhead is imperceptible to humans."));
    } else if (overhead < 100_000_000) {
        console.log(yellow("⚠️ Result: ACCEPTABLE. Noticeable in loops, but fine for interactive use."));
    } else {
        console.log("❌ Result: POOR. Optimization needed.");
    }
}
