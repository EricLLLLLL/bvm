import { spawnSync } from "bun";
import { join } from "path";
import { existsSync, mkdirSync, writeFileSync, chmodSync, rmSync } from "fs";

const SANDBOX = join(process.cwd(), ".vs-sandbox");
if (existsSync(SANDBOX)) rmSync(SANDBOX, { recursive: true });
mkdirSync(SANDBOX, { recursive: true });

console.log("\n📦 Setting up vs-sandbox...");

// 1. Get NVM (Source version)
const nvmScript = await fetch("https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/nvm.sh").then(r => r.text());
writeFileSync(join(SANDBOX, "nvm.sh"), nvmScript);

// 2. Get BVM (Current dist)
const BVM_CLI = join(process.cwd(), "dist", "index.js");

// 3. Get Bum (Binary)
console.log("📥 Installing Bum...");
spawnSync(["bash", "-c", "curl -fsSL https://github.com/owenizedd/bum/raw/main/install.sh | bash"], {
    env: { ...process.env, HOME: SANDBOX },
});
const BUM_BIN = join(SANDBOX, ".bum", "bin", "bum");

const ITERATIONS = 10;

function bench(name: string, cmd: string, args: string[], isShell = false) {
    process.stdout.write(`Benchmarking ${name.padEnd(25)} ... `);
    
    // Warmup
    if (isShell) {
        spawnSync(["bash", "-c", `${cmd} ${args.join(" ")}`]);
    } else {
        spawnSync([cmd, ...args]);
    }

    const times: number[] = [];
    for (let i = 0; i < ITERATIONS; i++) {
        const start = Bun.nanoseconds();
        if (isShell) {
            spawnSync(["bash", "-c", `${cmd} ${args.join(" ")}`]);
        } else {
            spawnSync([cmd, ...args]);
        }
        const end = Bun.nanoseconds();
        times.push(end - start);
    }

    const avg = times.reduce((a, b) => a + b, 0) / times.length / 1_000_000;
    console.log(`${avg.toFixed(2)}ms`);
    return avg;
}

console.log("\n🔥 PERFORMANCE DUEL (Average of 10 runs)\n");

const results = [];

// BVM Test
results.push({ name: "BVM (Built with Bun)", time: bench("BVM", "bun", [BVM_CLI, "--version"]) });

// NVM Test (Mimic terminal startup overhead)
results.push({ name: "NVM (Source + Run)", time: bench("NVM", `source ${join(SANDBOX, "nvm.sh")} && nvm`, ["--version"], true) });

// Bum Test
if (existsSync(BUM_BIN)) {
    results.push({ name: "Bum (Rust Binary)", time: bench("Bum", BUM_BIN, ["--version"]) });
} else {
    console.log("Bum (Rust Binary)           : ❌ Not found");
}

console.log("\n🏆 RANKING:");
results.sort((a, b) => a.time - b.time).forEach((r, i) => {
    console.log(`${i + 1}. ${r.name.padEnd(25)} : ${r.time.toFixed(2)}ms`);
});

rmSync(SANDBOX, { recursive: true });

