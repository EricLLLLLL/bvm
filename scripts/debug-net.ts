console.log("DEBUG: Starting Network Diagnostics...");

async function testUrl(url: string, description: string) {
    process.stdout.write(`\nTesting ${description} (${url})... `);
    try {
        const res = await fetch(url);
        console.log(`✅ OK (Status: ${res.status})`);
        const text = await res.text(); // Ensure body can be read
    } catch (e: any) {
        console.log("❌ CRASHED/FAILED");
        console.error(`   Error: ${e.message}`);
    }
}

async function main() {
    // 1. Test Plain HTTP (No SSL/TLS) - Rules out firewall blocking all traffic
    await testUrl("http://example.com", "Plain HTTP");

    // 2. Test Standard HTTPS (SSL) - Checks basic SSL handling
    await testUrl("https://example.com", "Standard HTTPS");

    // 3. Test NPM Registry (Target) - Checks specific connection to Registry
    await testUrl("https://registry.npmjs.org", "NPM Registry");
    
    console.log("\n--- Diagnosis End ---");
}

main();
