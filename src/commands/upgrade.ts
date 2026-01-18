import { colors } from '../utils/ui';
import { valid, gt } from '../utils/semver-lite';
import { IS_TEST_MODE, BVM_DIR, OS_PLATFORM, BVM_FINGERPRINTS_FILE } from '../constants';
import { fetchLatestBvmReleaseInfo } from '../api';
import { fetchWithTimeout } from '../utils/network-utils';
import packageJson from '../../package.json';
import { withSpinner } from '../command-runner';
import { join } from 'path';
import { writeTextFile, ensureDir, pathExists, safeSwap, readTextFile } from '../utils';
import { configureShell } from './setup';
import { tmpdir } from 'os';
import { rm, mkdir } from 'fs/promises';
import { runCommand } from '../helpers/process';

const CURRENT_VERSION = packageJson.version;

export async function upgradeBvm(): Promise<void> {
  try {
    await withSpinner(
      'Checking for BVM updates...',
      async (spinner) => {
        const latest = IS_TEST_MODE
          ? {
              version: process.env.BVM_TEST_LATEST_VERSION?.replace('v', '') || CURRENT_VERSION,
              tarball: 'https://example.com/bvm-test.tgz',
              shasum: 'mock',
              integrity: 'mock'
            }
          : await fetchLatestBvmReleaseInfo();

        if (!latest) {
          throw new Error('Unable to determine the latest BVM version from NPM Registry.');
        }

        const latestVersion = latest.version;
        if (!valid(latestVersion)) {
          throw new Error(`Unrecognized version received: ${latestVersion}`);
        }

        if (!gt(latestVersion, CURRENT_VERSION)) {
          spinner.succeed(colors.green(`BVM is already up to date (v${CURRENT_VERSION}).`));
          console.log(colors.blue(`You are using the latest version.`));
          return;
        }

        spinner.text = `Updating BVM to v${latestVersion}...`;
        if (IS_TEST_MODE && !process.env.BVM_TEST_REAL_UPGRADE) {
          spinner.succeed(colors.green('BVM updated successfully (test mode).'));
          return;
        }

        // --- Download Tarball ---
        spinner.update('Downloading update package...');
        const tempDir = join(tmpdir(), `bvm-upgrade-${Date.now()}`);
        await mkdir(tempDir, { recursive: true });
        
        const tarballPath = join(tempDir, 'bvm-core.tgz');
        
        if (IS_TEST_MODE) {
            // Mock tarball creation for tests
            await writeTextFile(tarballPath, 'mock-tarball');
            // Mock extraction result
            const mockExtractDir = join(tempDir, 'package', 'dist');
            await mkdir(mockExtractDir, { recursive: true });
            await writeTextFile(join(mockExtractDir, 'index.js'), '// new cli');
            await writeTextFile(join(mockExtractDir, 'bvm-shim.sh'), '# new shim');
            await writeTextFile(join(mockExtractDir, 'bvm-shim.js'), '// new shim');
        } else {
            const res = await fetchWithTimeout(latest.tarball, { timeout: 30000 });
            if (!res.ok) throw new Error(`Failed to download tarball: ${res.statusText}`);
            const buffer = await res.arrayBuffer();
            await safeSwap(tarballPath, new Uint8Array(buffer));
        
            // --- Extract Tarball ---
            spinner.update('Extracting update...');
            // NPM tarballs usually contain a 'package' root folder
            try {
                await runCommand(['tar', '-xzf', tarballPath, '-C', tempDir]);
            } catch (e) {
                throw new Error('Failed to extract update package. Ensure "tar" is available.');
            }
        }

        // --- Update Components ---
        spinner.update('Applying updates...');
        const extractedDist = join(tempDir, 'package', 'dist');
        
        // 1. CLI Core
        if (await pathExists(join(extractedDist, 'index.js'))) {
            await safeSwap(join(BVM_DIR, 'src', 'index.js'), await readTextFile(join(extractedDist, 'index.js')));
        }
        
        // 2. Unix Shim
        if (OS_PLATFORM !== 'win32' && await pathExists(join(extractedDist, 'bvm-shim.sh'))) {
            await safeSwap(join(BVM_DIR, 'bin', 'bvm-shim.sh'), await readTextFile(join(extractedDist, 'bvm-shim.sh')));
        }
        
        // 3. Windows Shim
        if (OS_PLATFORM === 'win32' && await pathExists(join(extractedDist, 'bvm-shim.js'))) {
            await safeSwap(join(BVM_DIR, 'bin', 'bvm-shim.js'), await readTextFile(join(extractedDist, 'bvm-shim.js')));
        }

        // Cleanup
        try {
            await rm(tempDir, { recursive: true, force: true });
        } catch (e) {}

        // Reset fingerprints file as we are now managing updates via Tarball integrity
        // But we can keep it if we want to track something else. For now, let's clear it to avoid confusion.
        try {
            await rm(BVM_FINGERPRINTS_FILE, { force: true });
        } catch (e) {}

        spinner.update('Finalizing environment...');
        await configureShell(false);
        
        spinner.succeed(colors.green(`BVM updated to v${latestVersion} successfully.`));
        console.log(colors.yellow(`Please restart your terminal to apply changes.`));
      },
      { failMessage: 'Failed to upgrade BVM' },
    );
  } catch (error: any) {
    throw new Error(`Failed to upgrade BVM: ${error.message}`);
  }
}

