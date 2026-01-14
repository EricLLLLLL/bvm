import { join, basename } from 'path';
import { createWriteStream } from 'fs';
import { unlink } from 'fs/promises';
import { homedir } from 'os';

// Mock constants/utils to keep this script standalone
const BVM_DIR = join(homedir(), '.bvm');
const CACHE_DIR = join(BVM_DIR, 'cache');
const TIMEOUT_MS = 10000;

console.log('🔍 Starting BVM Install Diagnosis...');
console.log(`📂 BVM Directory: ${BVM_DIR}`);
console.log(`🖥️  Platform: ${process.platform}, Arch: ${process.arch}`);

async function step(name: string, fn: () => Promise<void>) {
    process.stdout.write(`\nTesting ${name}... `);
    try {
        await fn();
        console.log('✅ OK');
    } catch (e: any) {
        console.log('❌ FAILED');
        console.error(`   Error: ${e.message}`);
        if (e.cause) console.error(`   Cause: ${e.cause}`);
        process.exit(1);
    }
}

async function main() {
    // 1. Check Internet & Registry Access
    await step('NPM Registry Access', async () => {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
        try {
            const res = await fetch('https://registry.npmjs.org/bun', { signal: controller.signal });
            if (!res.ok) throw new Error(`Status ${res.status}`);
            const data = await res.json();
            if (!data.versions) throw new Error('Invalid JSON response');
            console.log(`(Found ${Object.keys(data.versions).length} versions)`);
        } finally {
            clearTimeout(id);
        }
    });

    // 2. Check File System Write Permissions
    const testFile = join(CACHE_DIR, 'write_test.tmp');
    await step('Cache Directory Write Access', async () => {
        const fs = await import('fs/promises');
        await fs.mkdir(CACHE_DIR, { recursive: true });
        await fs.writeFile(testFile, 'test');
        await fs.unlink(testFile);
    });

    // 3. Test Download Stream (Small File)
    await step('Download Stream Capability', async () => {
        // Downloading a small icon or text file to test fetch + stream
        const url = 'https://registry.npmjs.org/bun/-/bun-1.0.0.tgz'; 
        const dest = join(CACHE_DIR, 'stream_test.tgz');
        
        console.log(`\n   Attempting download from: ${url}`);
        
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Download failed: ${res.status} ${res.statusText}`);
        if (!res.body) throw new Error('No response body');

        const fileStream = createWriteStream(dest);
        const reader = res.body.getReader();
        let total = 0;

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                fileStream.write(value);
                total += value.length;
                process.stdout.write(`\r   Downloaded: ${total} bytes`);
            }
        } finally {
            fileStream.end();
        }
        
        // Wait for stream to finish
        await new Promise((resolve, reject) => {
            fileStream.on('finish', resolve);
            fileStream.on('error', reject);
        });

        console.log('\n   Download finished.');
        await unlink(dest);
    });

    console.log('\n✨ Diagnosis Complete! Your system capabilities seem fine.');
    console.log('If "bvm install" still fails silently, it is likely a UI/Spinner issue in the CLI code.');
}

main().catch(e => {
    console.error('\n💥 Unexpected Diagnosis Crash:', e);
});
