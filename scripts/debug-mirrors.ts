console.log("DEBUG: Testing Mirrors...");

async function testUrl(url: string, description: string) {
    process.stdout.write(`\nTesting ${description} (${url})... `);
    try {
        const controller = new AbortController();
        setTimeout(() => controller.abort(), 5000); // 5s timeout
        
        const res = await fetch(url, { signal: controller.signal });
        console.log(`✅ OK (Status: ${res.status})`);
    } catch (e: any) {
        console.log("❌ FAILED");
        console.error(`   Error: ${e.message}`);
    }
}

async function main() {
    // 1. Official Registry (Already failed, but testing again for control)
    // await testUrl("https://registry.npmjs.org", "Official NPM");

    // 2. Taobao Mirror (Likely to succeed)
    await testUrl("https://registry.npmmirror.com", "Taobao Mirror");
    
    // 3. Bun Mirror (If applicable)
    await testUrl("https://npm.d.ws", "D.WS Mirror");
}

main();

