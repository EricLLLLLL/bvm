console.log("DEBUG: Starting basic fetch test...");

try {
    console.log("DEBUG: Executing fetch('https://registry.npmjs.org/bun')...");
    const response = await fetch("https://registry.npmjs.org/bun");
    
    console.log(`DEBUG: Response received. Status: ${response.status}`);
    
    if (response.ok) {
        console.log("DEBUG: Reading text body...");
        const text = await response.text();
        console.log(`DEBUG: Body read success. Length: ${text.length} chars`);
    } else {
        console.log("DEBUG: Response not OK");
    }

} catch (e: any) {
    console.error("DEBUG: Caught JS Error:", e.message);
}

console.log("DEBUG: Script finished.");
