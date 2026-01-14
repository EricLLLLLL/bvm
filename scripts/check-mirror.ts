console.log("🔍 Checking Mirror Connectivity via Bun...");

async function test(url: string, name: string) {
    process.stdout.write(`Testing ${name} (${url})... `);
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000); // 10s
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timeout);
        console.log(`✅ OK (${res.status})`);
    } catch (e: any) {
        console.log(`❌ FAILED: ${e.message}`);
    }
}

async function main() {
    // 测试国内镜像
    await test("https://registry.npmmirror.com/bun", "Taobao Mirror");
    // 测试官方源（再次确认是否崩溃）
    await test("https://registry.npmjs.org/bun", "Official Registry");
}

main();
