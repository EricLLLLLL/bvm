import { colors } from '../utils/ui';
import { valid, gt } from '../utils/semver-lite';
import { IS_TEST_MODE, BVM_SRC_DIR, BVM_COMPONENTS, BVM_CDN_ROOT, BVM_DIR, OS_PLATFORM } from '../constants';
import { fetchLatestBvmReleaseInfo } from '../api';
import { fetchWithTimeout } from '../utils/network-utils';
import packageJson from '../../package.json';
import { withSpinner } from '../command-runner';
import { join } from 'path';
import { writeTextFile, ensureDir, pathExists, safeSwap } from '../utils';
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

        // --- Smart Component Upgrade ---
        const components = BVM_COMPONENTS.filter(c => {
            if (!c.platform) return true;
            if (c.platform === 'win32') return OS_PLATFORM === 'win32';
            if (c.platform === 'posix') return OS_PLATFORM !== 'win32';
            return true;
        });

        for (const component of components) {
            const remoteUrl = `${BVM_CDN_ROOT}@${latest.tagName}/dist/${component.remotePath}`;
            const localDest = join(BVM_DIR, component.localPath);
            
            spinner.update(`Checking component: ${component.name}...`);

            try {
                // 1. HEAD request to check size
                const headRes = await fetchWithTimeout(remoteUrl, { method: 'HEAD', timeout: 5000 });
                if (!headRes.ok) {
                    // Fallback to direct download if HEAD fails (some CDNs might block it)
                    spinner.update(`Downloading ${component.name}...`);
                    await downloadAndSwap(remoteUrl, localDest, component.name);
                    continue;
                }

                const remoteSize = +(headRes.headers.get('Content-Length') || 0);
                
                // 2. Compare with local size
                if (await pathExists(localDest)) {
                    const localStat = await stat(localDest);
                    if (localStat.size === remoteSize && remoteSize > 0) {
                        spinner.update(`Component ${component.name} is already up-to-date (skipped).`);
                        continue;
                    }
                }

                // 3. Download and swap
                spinner.update(`Downloading ${component.name}...`);
                await downloadAndSwap(remoteUrl, localDest, component.name);

            } catch (error: any) {
                console.log(colors.yellow(`  ! Failed to update ${component.name}: ${error.message}`));
                // We continue with other components, but maybe we should fail?
                // CLI Core is critical.
                if (component.name === 'CLI Core') throw error;
            }
        }

        spinner.update('Finalizing environment...');
        // Refresh shims and wrappers locally using the NEW code
        await configureShell(true);

        spinner.succeed(colors.green(`BVM updated to v${latestVersion} successfully.`));
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
    if (!res.ok) throw new Error(`Failed to download ${name} (${res.status})`);
    
    const content = await res.arrayBuffer();
    if (content.byteLength < 10) throw new Error(`${name} content too small, likely invalid.`);
    
    await safeSwap(dest, new Uint8Array(content));
}