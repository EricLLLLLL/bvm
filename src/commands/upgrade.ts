import { colors } from '../utils/ui';
import { valid, gt } from '../utils/semver-lite';
import { IS_TEST_MODE, BVM_SRC_DIR } from '../constants';
import { fetchLatestBvmReleaseInfo } from '../api';
import packageJson from '../../package.json';
import { withSpinner } from '../command-runner';
import { join } from 'path';
import { writeTextFile, ensureDir } from '../utils';

const CURRENT_VERSION = packageJson.version;
const REPO_OWNER = 'EricLLLLLL';
const REPO_NAME = 'bvm';

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

        // --- Core Upgrade Logic ---
        // We download the pre-built index.js from jsDelivr for the specific tag
        const cdnUrl = `https://cdn.jsdelivr.net/gh/${REPO_OWNER}/${REPO_NAME}@${latest.tagName}/dist/index.js`;
        
        const response = await fetch(cdnUrl);
        if (!response.ok) {
          throw new Error(`Failed to download BVM source from CDN: ${response.statusText} (${response.status})`);
        }
        
        const newCode = await response.text();
        if (!newCode || newCode.length < 100) {
           throw new Error('Downloaded BVM source seems invalid or empty.');
        }

        const srcDir = BVM_SRC_DIR;
        const destFile = join(srcDir, 'index.js');
        const tempFile = join(srcDir, `index.js.new-${Date.now()}`);

        await ensureDir(srcDir);
        
        // Write to temp file first
        await writeTextFile(tempFile, newCode);
        
        // Atomic rename (replace)
        // Note: Bun/Node fs.rename handles replacement on POSIX, 
        // on Windows it might fail if file is locked, but usually safe for running script to replace itself in memory? 
        // Actually, replacing the running script file works on Unix, but on Windows it might be locked if it's currently executing via `bun run index.js`.
        // However, BVM is usually loaded into memory by Bun. Let's try.
        // If rename fails, we might need a wrapper.
        
        try {
            const { rename } = await import('fs/promises');
            await rename(tempFile, destFile);
        } catch (e: any) {
            // Fallback for Windows if locked: try to overwrite content directly
             await writeTextFile(destFile, newCode);
             // Cleanup temp
             const { unlink } = await import('fs/promises');
             await unlink(tempFile).catch(() => {});
        }

        spinner.succeed(colors.green(`BVM updated to v${latestVersion} successfully.`));
        console.log(colors.yellow(`Please restart your terminal to apply changes.`));
      },
      { failMessage: 'Failed to upgrade BVM' },
    );
  } catch (error: any) {
    throw new Error(`Failed to upgrade BVM: ${error.message}`);
  }
}
