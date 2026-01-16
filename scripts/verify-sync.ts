import { fetch } from 'bun';

const pkgName = process.argv[2];
const version = process.argv[3];
const maxRetries = 30; // 30 * 10s = 5 mins
const interval = 10000;

if (!pkgName || !version) {
    console.error("Usage: verify-sync <pkg> <version>");
    process.exit(1);
}

console.log(`🔍 Verifying mirror sync for ${pkgName}@${version} on npmmirror.com...`);

async function check() {
    for (let i = 0; i < maxRetries; i++) {
        try {
            // Check specific version existence
            const res = await fetch(`https://registry.npmmirror.com/${pkgName}/${version}`, {
                method: "HEAD"
            });
            if (res.status === 200) {
                console.log(`✅ Sync successful! ${pkgName}@${version} is available on mirror.`);
                return true;
            }
            console.log(`⏳ Attempt ${i+1}/${maxRetries}: Version not found yet (Status ${res.status})...`);
        } catch (e: any) {
            console.error(`⚠️ Error checking mirror: ${e.message}`);
        }
        await new Promise(r => setTimeout(r, interval));
    }
    return false;
}

if (await check()) {
    process.exit(0);
} else {
    console.error(`❌ Sync verification failed after ${maxRetries * interval / 1000}s.`);
    process.exit(1);
}
