// scripts/check-integrity.ts
import { readFileSync, statSync } from "fs";
import { join } from "path";

console.log("🔍 Running Integrity Checks...");

const pkgPath = join(process.cwd(), "package.json");
const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));

// 1. Check for 'private' flag (EPRIVATE error)
if (pkg.private) {
    console.error("❌ ERROR: 'private': true found in package.json. This will block NPM publishing.");
    process.exit(1);
}

// 2. Check for build sync
const distPath = join(process.cwd(), "dist", "index.js");
try {
    const distStat = statSync(distPath);
    const srcStat = statSync(join(process.cwd(), "src", "index.ts"));
    if (distStat.mtime < srcStat.mtime) {
        console.error("❌ ERROR: Build artifacts are older than source code. Run 'npm run build' first.");
        process.exit(1);
    }
} catch (e) {
    console.error("❌ ERROR: Build artifacts (dist/index.js) missing.");
    process.exit(1);
}

// 3. Check for mandatory files in package.json
const requiredFiles = ["dist/index.js", "scripts/postinstall.js", "install.sh", "install.ps1"];
for (const file of requiredFiles) {
    if (!pkg.files.includes(file)) {
        console.error(`❌ ERROR: Mandatory file '${file}' missing from package.json 'files' array.`);
        process.exit(1);
    }
}

console.log("✅ Integrity checks passed.");
process.exit(0);
