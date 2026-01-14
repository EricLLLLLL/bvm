import { colors, Spinner, ProgressBar } from '../src/utils/ui';

console.log("🔍 Checking UI/ANSI Compatibility...");

function testColors() {
    console.log("\n1. Testing Colors...");
    console.log(colors.red("   Red Text"));
    console.log(colors.green("   Green Text"));
    console.log(colors.cyan("   Cyan Text (Brand)"));
    console.log("   ✅ Colors OK");
}

async function testSpinner() {
    console.log("\n2. Testing Spinner (Manual animation)...");
    const s = new Spinner("Processing...");
    s.start();
    
    await new Promise(r => setTimeout(r, 1000));
    s.update("Updating message...");
    await new Promise(r => setTimeout(r, 1000));
    
    s.succeed("Spinner Success");
}

async function testProgressBar() {
    console.log("\n3. Testing Progress Bar...");
    const p = new ProgressBar(100);
    p.start();
    
    for (let i = 0; i <= 100; i += 20) {
        p.update(i, { speed: "1024" });
        await new Promise(r => setTimeout(r, 200));
    }
    p.stop();
    console.log("   ✅ Progress Bar OK");
}

async function main() {
    testColors();
    await testSpinner();
    await testProgressBar();
    console.log("\n✨ UI Test Finished!");
}

main().catch(e => console.error("❌ UI Test Failed:", e));
