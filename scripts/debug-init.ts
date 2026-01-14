import { join } from 'path';
import { existsSync, readFileSync } from 'fs';

console.log("🔍 Checking BVM Core Initialization Logic...");

// 1. Simulate .bvmrc Recursive Search
function findRc(dir: string): string | null {
    console.log(`   Searching in: ${dir}`);
    try {
        const rcPath = join(dir, '.bvmrc');
        if (existsSync(rcPath)) {
            console.log(`   ✅ Found .bvmrc at ${rcPath}`);
            return readFileSync(rcPath, 'utf8').trim();
        }
        const parent = join(dir, '..');
        if (parent === dir) return null; // Root reached
        return findRc(parent);
    } catch (e: any) {
        console.error(`   ❌ Crash during search: ${e.message}`);
        return null;
    }
}

// 2. Test Timezone Detection
function testChina() {
    console.log("\nTesting isChina() logic...");
    try {
        const opts = Intl.DateTimeFormat().resolvedOptions();
        console.log(`   Timezone: ${opts.timeZone}`);
        console.log(`   Locale: ${opts.locale}`);
        const isChina = opts.timeZone === 'Asia/Shanghai' || opts.locale === 'zh-CN';
        console.log(`   Result: User is in China? ${isChina}`);
    } catch (e: any) {
        console.error(`   ❌ Crash during Intl check: ${e.message}`);
    }
}

async function main() {
    console.log("1. Starting recursive path search test...");
    findRc(process.cwd());
    
    testChina();
    
    console.log("\n✨ Initialization tests finished.");
}

main();
