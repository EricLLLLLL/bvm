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
    console.log(`📡 Mirror Registry: https://registry.npmmirror.com/${pkgName}/${version}`);
    for (let i = 0; i < maxRetries; i++) {
        try {
            const start = Date.now();
            const res = await fetch(`https://registry.npmmirror.com/${pkgName}/${version}`, {
                method: "GET",
                headers: { "Accept": "application/json" }
            });
            const duration = Date.now() - start;

            if (res.status === 200) {
                const data = await res.json();
                if (data.version === version) {
                    console.log(`✅ [${duration}ms] Sync successful! ${pkgName}@${version} is live.`);
                    return true;
                }
            }
            
            if (res.status === 404) {
                console.log(`⏳ [${duration}ms] Attempt ${i+1}/${maxRetries}: Not found yet...`);
            } else {
                console.log(`⚠️ [${duration}ms] Attempt ${i+1}/${maxRetries}: Unexpected status ${res.status}`);
            }
        } catch (e: any) {
            console.error(`❌ Network Error: ${e.message}`);
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
