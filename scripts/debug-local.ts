import { join } from 'path';
import { homedir } from 'os';

console.log("DEBUG: Starting local system test...");

try {
    // 1. Memory/CPU Test
    console.log("DEBUG: Testing CPU/Memory...");
    const arr = new Array(1000).fill(0).map((_, i) => i * 2);
    console.log(`DEBUG: Calculation complete. Last item: ${arr[999]}`);

    // 2. File Write Test
    console.log("DEBUG: Testing File Write...");
    const tmpFile = join(homedir(), '.bvm_debug_test.txt');
    await Bun.write(tmpFile, "test content");
    console.log(`DEBUG: Wrote to ${tmpFile}`);
    
    // 3. File Read Test
    const content = await Bun.file(tmpFile).text();
    console.log(`DEBUG: Read back: "${content}"`);

    console.log("DEBUG: ✅ Local test PASSED.");

} catch (e: any) {
    console.error("DEBUG: ❌ Local test FAILED:", e.message);
}
