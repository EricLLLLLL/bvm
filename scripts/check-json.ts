console.log("🔍 Checking JSON Parsing for large metadata...");

async function testJson(url: string, name: string) {
    process.stdout.write(`\nFetching & Parsing ${name}... `);
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        console.log(`(Download OK, size: ${res.headers.get('content-length') || 'unknown'})`);
        process.stdout.write(`   Parsing JSON... `);
        
        const data = await res.json();
        const versions = Object.keys(data.versions || {});
        console.log(`✅ Success! Found ${versions.length} versions.`);
    } catch (e: any) {
        console.log(`❌ FAILED`);
        console.error(`   Error details: ${e.message}`);
    }
}

async function main() {
    // 这个 URL 会返回完整的包元数据，数据量很大
    await testJson("https://registry.npmjs.org/bun", "Full Metadata");
}

main();
