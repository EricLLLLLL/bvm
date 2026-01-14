console.log("🔍 Checking AbortController & Intl API...");

async function testAbort() {
    console.log("\n1. Testing fetch with AbortController...");
    const controller = new AbortController();
    const timeout = setTimeout(() => {
        console.log("   (Timer fired - aborting)");
        controller.abort();
    }, 10000);

    try {
        const res = await fetch("https://registry.npmjs.org/bun", { signal: controller.signal });
        console.log(`   ✅ Fetch finished (Status: ${res.status})`);
        const data = await res.json();
        console.log(`   ✅ JSON parsed (${Object.keys(data.versions).length} versions)`);
    } catch (e: any) {
        console.log(`   ❌ Caught: ${e.name} - ${e.message}`);
    } finally {
        clearTimeout(timeout);
    }
}

function testIntl() {
    console.log("\n2. Testing Intl/Timezone API...");
    try {
        const options = Intl.DateTimeFormat().resolvedOptions();
        console.log(`   Timezone: ${options.timeZone}`);
        console.log(`   Locale: ${options.locale}`);
        console.log("   ✅ Intl API OK");
    } catch (e: any) {
        console.log(`   ❌ Intl API Failed: ${e.message}`);
    }
}

async function main() {
    testIntl();
    await testAbort();
    console.log("\n--- Test Finished ---");
}

main();
