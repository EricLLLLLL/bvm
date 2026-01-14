// Hardcoded version to avoid path issues
const version = "1.0.0"; 

// 模拟 BVM 真实使用的常量
const USER_AGENT = `bvm/${version} bun/${Bun.version} ${process.platform}-${process.arch}`;
console.log(`🔍 Checking Headers with UA: "${USER_AGENT}"`);

async function testHeaders() {
    console.log("\nTesting fetch with full headers...");
    try {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), 10000);

        const res = await fetch("https://registry.npmjs.org/bun", {
            headers: {
                'User-Agent': USER_AGENT,
                'Accept': 'application/vnd.npm.install-v1+json'
            },
            signal: controller.signal
        });
        
        console.log(`✅ Status: ${res.status}`);
        if (!res.ok) {
            console.log(`❌ Request Failed: ${res.statusText}`);
            return;
        }

        const data = await res.json();
        const verCount = Object.keys(data.versions || {}).length;
        console.log(`✅ Success! Found ${verCount} versions.`);
        
    } catch (e: any) {
        console.log("❌ CRASHED/FAILED");
        console.error(`   Error: ${e.message}`);
    }
}

testHeaders();