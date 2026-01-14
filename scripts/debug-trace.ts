import { join } from 'path';
// 注意：如果您的文件在 scripts 目录下，请确保 ../src/api 等路径正确
import { colors } from '../src/utils/ui';
import { fetchBunVersions, findBunDownloadUrl } from '../src/api';
import { normalizeVersion, resolveVersion } from '../src/utils';

console.log(colors.cyan("🚀 Starting Deep Trace of 'bvm install'..."));

async function trace() {
    const versionToInstall = "1.3.5";

    try {
        console.log("STEP 1: Fetching versions from remote..");
        const remoteVersions = await fetchBunVersions();
        console.log(`   ✅ Success: Found ${remoteVersions.length} versions.`);

        console.log("STEP 2: Filtering versions...");
        const filtered = remoteVersions
          .filter(v => !v.includes('canary'))
          .map(v => normalizeVersion(v));
        console.log(`   ✅ Success: ${filtered.length} versions after filter.`);

        console.log("STEP 3: Resolving version...");
        const resolvedVersion = resolveVersion(versionToInstall, filtered);
        console.log(`   ✅ Success: Resolved ${versionToInstall} -> ${resolvedVersion}`);

        if (!resolvedVersion) {
            console.log("   ❌ Error: Could not resolve version.");
            return;
        }

        console.log("STEP 4: Finding download URL...");
        const result = await findBunDownloadUrl(resolvedVersion);
        console.log(`   ✅ Success: Found URL: ${result?.url}`);

        if (!result) return;
        const { url, foundVersion } = result;

        console.log("STEP 5: Checking cache...");
        const { BVM_CACHE_DIR, BVM_VERSIONS_DIR } = await import('../src/constants');
        const { ensureDir, pathExists } = await import('../src/utils');
        const { basename } = await import('path');

        await ensureDir(BVM_CACHE_DIR);
        const cachedArchivePath = join(BVM_CACHE_DIR, `${foundVersion}-${basename(url)}`);
        const exists = await pathExists(cachedArchivePath);
        console.log(`   ℹ Cache status: ${exists ? 'EXISTS' : 'NOT FOUND'} at ${cachedArchivePath}`);

        if (!exists) {
            console.log("STEP 6: Simulating download (Real fetch to check connectivity)...");
            const response = await fetch(url);
            console.log(`   ✅ Success: Fetch status ${response.status} ${response.statusText}`);
            console.log(`   ℹ Content-Length: ${response.headers.get('content-length')}`);
            // Note: We don't actually write to disk here to keep it safe, 
            // but we've verified the network path.
        } else {
            console.log("STEP 6: Skipping download (Using cache).");
        }

        console.log("STEP 7: Full Extraction Test...");
        const { tmpdir } = await import('os');
        const testBase = join(tmpdir(), 'bvm-debug-' + Date.now());
        const testCache = join(testBase, 'cache');
        const testInstall = join(testBase, 'install');
        
        await ensureDir(testCache);
        await ensureDir(testInstall);
        
        const testArchivePath = join(testCache, basename(url));
        console.log(`   ℹ Testing download & extraction in: ${testBase}`);

        console.log("STEP 8: Downloading using Bun.write (Native)...");
        const response = await fetch(url);
        if (!response.ok) throw new Error("Download failed");
        
        const arrayBuffer = await response.arrayBuffer();
        console.log(`   ℹ Downloaded ${arrayBuffer.byteLength} bytes into memory.`);
        
        await Bun.write(testArchivePath, arrayBuffer);
        console.log(`   ✅ Success: File saved to ${testArchivePath}`);

        console.log("STEP 9: Testing 'tar' command availability...");
        console.log(`   ✅ Success: Partial file saved to ${testArchivePath}`);

        console.log("STEP 9: Testing 'tar' command availability...");
        const { runCommand } = await import('../src/helpers/process');
        try {
            await runCommand(['tar', '--version'], { stdout: 'ignore' });
            console.log("   ✅ Success: 'tar' is available.");
        } catch (e) {
            console.log("   ❌ Error: 'tar' not found in PATH.");
        }

        console.log("\n--- Trace Reached End of Critical Log ---");
        console.log(colors.yellow(`\nCleanup Tip: You might want to delete ${testBase} later.`));

    } catch (e: any) {
        console.log("\n❌ CRASHED during trace!");
        console.error(e);
        if (e.stack) console.error(e.stack);
    }
}

trace();
