import { getBunNpmPackage, getBunDownloadUrl } from "../src/utils/npm-lookup";

const VERSIONS = ["1.1.0", "1.1.20", "1.1.34"];
const ITERATIONS = 3;

async function measureDownload(url: string, name: string) {
  console.log(`  Testing ${name}...`);
  const start = performance.now();
  try {
    const response = await fetch(url, { method: "GET" });
    if (!response.ok) throw new Error(`Status ${response.status}`);
    const data = await response.arrayBuffer();
    const end = performance.now();
    const duration = end - start;
    const sizeMb = data.byteLength / 1024 / 1024;
    console.log(`    Done: ${duration.toFixed(0)}ms (${sizeMb.toFixed(2)}MB)`);
    return { duration, sizeMb, success: true };
  } catch (err: any) {
    console.log(`    Failed: ${err.message}`);
    return { duration: 0, sizeMb: 0, success: false };
  }
}

async function runBenchmark() {
  const os_platform = process.platform;
  const cpu_arch = process.arch;
  
  // Match src/constants.ts logic
  const platform = os_platform === "win32" ? "windows" : os_platform;
  const arch = cpu_arch === "arm64" ? "aarch64" : "x64";
  const assetName = `bun-${platform}-${arch}.zip`;
  
  // Match src/utils/npm-lookup.ts logic (needs raw platform/arch)
  const npmPackage = getBunNpmPackage(os_platform, cpu_arch);

  if (!npmPackage) {
    console.error(`Unsupported platform/arch: ${platform}-${arch}`);
    return;
  }

  console.log(`Benchmark Environment: ${platform}-${arch} (${npmPackage})`);
  console.log("---------------------------------------------------------");

  const results: any[] = [];

  for (const version of VERSIONS) {
    console.log(`
Version: ${version}`);
    
    // 1. GitHub (Official logic from src/api.ts)
    const tagName = `bun-v${version}`;
    const ghUrl = `https://github.com/oven-sh/bun/releases/download/${tagName}/${assetName}`;
    const ghResult = await measureDownload(ghUrl, "GitHub (Official)");

    // 2. NPM Registry
    const npmUrl = getBunDownloadUrl(npmPackage, version, "https://registry.npmjs.org");
    const npmResult = await measureDownload(npmUrl, "NPM Registry");

    // 3. NPM Mirror (npmmirror.com)
    const mirrorUrl = getBunDownloadUrl(npmPackage, version, "https://registry.npmmirror.com");
    const mirrorResult = await measureDownload(mirrorUrl, "NPM Mirror (npmmirror.com)");

    results.push({
      version,
      gh: ghResult,
      npm: npmResult,
      mirror: mirrorResult
    });
  }

  console.log("\nSummary Table (Average Time)");
  console.log("Version | GitHub | NPM | Mirror");
  console.log("--------|--------|-----|-------");
  for (const r of results) {
    const ghTime = r.gh.success ? `${r.gh.duration.toFixed(0)}ms` : "FAILED";
    const npmTime = r.npm.success ? `${r.npm.duration.toFixed(0)}ms` : "FAILED";
    const mirrorTime = r.mirror.success ? `${r.mirror.duration.toFixed(0)}ms` : "FAILED";
    console.log(`${r.version} | ${ghTime} | ${npmTime} | ${mirrorTime}`);
  }
}

runBenchmark();
