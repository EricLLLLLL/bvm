import { colors } from '../utils/ui';
import { valid, gt } from '../utils/semver-lite';
import { IS_TEST_MODE, BVM_SRC_DIR, BVM_COMPONENTS, BVM_CDN_ROOT, BVM_DIR, OS_PLATFORM, BVM_FINGERPRINTS_FILE, REPO_FOR_BVM_CLI } from '../constants';
import { fetchLatestBvmReleaseInfo } from '../api';
import { fetchWithTimeout, getFastestRegistry } from '../utils/network-utils';
import packageJson from '../../package.json';
import { withSpinner } from '../command-runner';
import { join } from 'path';
import { writeTextFile, ensureDir, pathExists, safeSwap, readTextFile } from '../utils';
import { configureShell } from './setup';
import { stat } from 'fs/promises';

const CURRENT_VERSION = packageJson.version;

export async function upgradeBvm(): Promise<void> {
  try {
    await withSpinner(
      'Checking for BVM updates...',
      async (spinner) => {
        const latest = IS_TEST_MODE
          ? {
              tagName: process.env.BVM_TEST_LATEST_VERSION || `v${CURRENT_VERSION}`,
              downloadUrl: 'https://example.com/bvm-test',
            }
          : await fetchLatestBvmReleaseInfo();

        if (!latest) {
          throw new Error('Unable to determine the latest BVM version.');
        }

        const latestVersion = latest.tagName.startsWith('v') ? latest.tagName.slice(1) : latest.tagName;
        if (!valid(latestVersion)) {
          throw new Error(`Unrecognized version received: ${latest.tagName}`);
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

        // --- Fetch Remote package.json for Fingerprints ---
        spinner.update('Fetching remote fingerprints...');
        
        const registry = await getFastestRegistry();
        let baseUrl = BVM_CDN_ROOT;
        
        if (IS_TEST_MODE) {
            // Respect test-provided CDN root
            baseUrl = BVM_CDN_ROOT.includes('jsdelivr.net') 
                ? `${BVM_CDN_ROOT}@${latest.tagName}`
                : BVM_CDN_ROOT;
        } else if (registry.includes('npmmirror.com')) {
            baseUrl = `https://npm.elemecdn.com/bvm-core@${latestVersion}`;
        } else if (registry.includes('npmjs.org')) {
            baseUrl = `https://unpkg.com/bvm-core@${latestVersion}`;
        } else {
            // Default to jsDelivr if something is weird
            baseUrl = `https://cdn.jsdelivr.net/gh/${REPO_FOR_BVM_CLI}@${latest.tagName}`;
        }

        const pkgUrl = `${baseUrl.replace(/\/$/, '')}/package.json`;
        const pkgRes = await fetchWithTimeout(pkgUrl, { timeout: 5000 });
        if (!pkgRes.ok) throw new Error(`Failed to fetch remote package.json`);
        
        const remotePkg = await pkgRes.json();
        const remoteFingerprints = remotePkg.bvm_fingerprints || {};

        // --- Load Local Fingerprints ---
        let localFingerprints: Record<string, string> = {};
        try {
            if (await pathExists(BVM_FINGERPRINTS_FILE)) {
                localFingerprints = JSON.parse(await readTextFile(BVM_FINGERPRINTS_FILE));
            }
        } catch (e) {}

        const components = BVM_COMPONENTS.filter(c => {
            if (!c.platform) return true;
            if (c.platform === 'win32') return OS_PLATFORM === 'win32';
            if (c.platform === 'posix') return OS_PLATFORM !== 'win32';
            return true;
        });

        const newLocalFingerprints = { ...localFingerprints };
        let updatedCount = 0;

        for (const component of components) {
            const remoteUrl = `${baseUrl.replace(/\/$/, '')}/dist/${component.remotePath}`;
            const localDest = join(BVM_DIR, component.localPath);
            
            const fpKey = component.name === 'CLI Core' ? 'cli' : 
                          component.name === 'Windows Shim' ? 'shim_win' : 'shim_unix';

            const remoteMd5 = remoteFingerprints[fpKey];
            const localMd5 = localFingerprints[fpKey];

            spinner.update(`Checking ${component.name}...`);

            if (remoteMd5 && localMd5 === remoteMd5 && await pathExists(localDest)) {
                // If matched, we still report it but count as not updated
                continue;
            }

            spinner.update(`Downloading ${component.name}...`);
            await downloadAndSwap(remoteUrl, localDest, component.name);
            
            if (remoteMd5) newLocalFingerprints[fpKey] = remoteMd5;
            updatedCount++;
        }

        // --- Finalize ---
        if (updatedCount > 0) {
            spinner.update('Saving fingerprints...');
            await ensureDir(BVM_DIR);
            await writeTextFile(BVM_FINGERPRINTS_FILE, JSON.stringify(newLocalFingerprints, null, 2));

            spinner.update('Finalizing environment...');
            await configureShell(false);
            
            spinner.succeed(colors.green(`BVM updated to v${latestVersion} successfully (${updatedCount} components updated).`));
        } else {
            spinner.succeed(colors.green(`BVM components are already at the latest fingerprints for v${latestVersion}.`));
        }
        
        console.log(colors.yellow(`Please restart your terminal to apply changes.`));
      },
      { failMessage: 'Failed to upgrade BVM' },
    );
  } catch (error: any) {
    throw new Error(`Failed to upgrade BVM: ${error.message}`);
  }
}

async function downloadAndSwap(url: string, dest: string, name: string) {
    const res = await fetchWithTimeout(url, { timeout: 10000 });
    if (!res.ok) throw new Error(`Failed to download ${name}`);
    const content = await res.arrayBuffer();
    if (content.byteLength < 10) throw new Error(`${name} invalid`);
    await safeSwap(dest, new Uint8Array(content));
}
