import ora from 'ora';
import chalk from 'chalk';
import { fetchLatestBvmReleaseInfo } from '../api';
import { EXECUTABLE_NAME } from '../constants';
import { readFileSync, writeFileSync, chmodSync, renameSync, unlinkSync } from 'fs';
import { join } from 'path';
import semver from 'semver';
import { homedir } from 'os';

export async function upgradeBvm(): Promise<void> {
  const spinner = ora('Checking for BVM updates...').start();
  try {
    const currentBvmPath = process.execPath;
    const currentBvmVersion = require(join(process.cwd(), 'package.json')).version; // Get version from package.json

    const latestRelease = await fetchLatestBvmReleaseInfo();
    if (!latestRelease) {
      spinner.fail(chalk.red('Failed to fetch latest BVM release information.'));
      process.exit(1);
    }

    const latestTagName = latestRelease.tagName;
    const latestVersion = latestTagName.startsWith('v') ? latestTagName.substring(1) : latestTagName;

    if (semver.gte(currentBvmVersion, latestVersion)) {
      spinner.succeed(chalk.green(`BVM is already up to date (v${currentBvmVersion}).`));
      process.exit(0);      return;
    }

    spinner.text = `Found new version: v${latestVersion}. Downloading...`;
    
    // Determine download URL (already in latestRelease.downloadUrl)
    const downloadUrl = latestRelease.downloadUrl;
    
    // Download new binary
    const response = await fetch(downloadUrl);
    if (!response.ok) {
      throw new Error(`Failed to download new BVM binary: ${response.statusText} (${response.status})`);
    }

    const tempDir = join(homedir(), '.bvm', 'tmp');
    await require('fs/promises').mkdir(tempDir, { recursive: true });
    const tempBvmPath = join(tempDir, `bvm_new_${Date.now()}${EXECUTABLE_NAME === 'bun.exe' ? '.exe' : ''}`);

    const arrayBuffer = await response.arrayBuffer();
    writeFileSync(tempBvmPath, Buffer.from(arrayBuffer));
    chmodSync(tempBvmPath, 0o755);

    spinner.text = 'Installing update...';

    // Replace the currently running binary
    // On Unix, this works fine by moving the new file over the old one.
    // On Windows, the running executable might be locked.
    // A common workaround is to download to a temp location, then replace.
    
    // For simplicity, we'll try direct replacement. If it fails on Windows, we can add a more complex workaround.
    renameSync(tempBvmPath, currentBvmPath);

    spinner.succeed(chalk.green(`BVM updated successfully to v${latestVersion}!`));
    // Clean up temp dir (optional, but good practice)
    await require('fs/promises').rm(tempDir, { recursive: true, force: true });

  } catch (error: any) {
    spinner.fail(chalk.red(`Failed to update BVM: ${error.message}`));
    console.error(error);
    process.exit(1);
  }
}