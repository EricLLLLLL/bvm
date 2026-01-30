import path, { join, basename, dirname } from 'path';
import { BVM_VERSIONS_DIR, BVM_CACHE_DIR, EXECUTABLE_NAME, IS_TEST_MODE, OS_PLATFORM, BVM_ALIAS_DIR, BVM_DIR, BVM_CURRENT_DIR } from '../constants';
import { ensureDir, pathExists, removeDir, resolveVersion, normalizeVersion, readDir, getActiveVersion, createSymlink, linkToRegistry } from '../utils';
import { findBunDownloadUrl, fetchBunVersions, checkBunVersionExists, fetchBunDistTags } from '../api';
import { colors, ProgressBar } from '../utils/ui';
import { extractArchive } from '../utils/archive';
import { chmod, rename, rm, symlink, unlink } from 'fs/promises';
import { configureShell } from './setup';
import { getRcVersion } from '../rc';
import { getInstalledVersions } from '../utils';
import { createAlias } from './alias';
import { withSpinner } from '../command-runner';
import { runCommand } from '../helpers/process';
import { useBunVersion } from './use';
import { rehash } from './rehash';
import { RegistrySpeedTester, REGISTRIES } from '../utils/registry-check';
import { BunfigManager } from '../utils/bunfig';
import { fixWindowsShims } from '../utils/windows-shim-fixer';

/**
 * Generates a bunfig.toml using the LOGICAL current path as an anchor.
 * This is the secret to zero-drift execution on Windows.
 */
export async function generateBunfig(versionPhysicalDir: string) {
    const bunfigPath = join(versionPhysicalDir, "bunfig.toml");
    
    // We use the PHYSICAL path to anchor Bun's internal logic.
    let globalDir = versionPhysicalDir;
    let globalBinDir = join(versionPhysicalDir, "bin");
    
    // Correctly escape backslashes for TOML on Windows
    // Also normalize forward slashes to backslashes for consistency on Windows
    if (OS_PLATFORM === 'win32') {
        globalDir = globalDir.replace(/\//g, "\\").replace(/\\/g, "\\\\");
        globalBinDir = globalBinDir.replace(/\//g, "\\").replace(/\\/g, "\\\\");
    }
    
    let content = `[install]\nglobalDir = "${globalDir}"\nglobalBinDir = "${globalBinDir}"\n`;

    // Inject fastest registry
    try {
        const fastestRegistry = await RegistrySpeedTester.getFastestRegistry();
        if (fastestRegistry) {
            content += `\n[install.registry]\nurl = "${fastestRegistry}"\n`;
        }
    } catch (e) {
        // Fallback to default if check fails
    }

    await Bun.write(bunfigPath, content);
}

async function ensureBunx(binDir: string, bunPath: string) {
  const bunxName = EXECUTABLE_NAME.replace('bun', 'bunx');
  const bunxPath = join(binDir, bunxName);
  if (await pathExists(bunxPath)) return;
  try {
    await symlink(EXECUTABLE_NAME, bunxPath);
  } catch (e) {
    await Bun.write(Bun.file(bunxPath), Bun.file(bunPath));
    await chmod(bunxPath, 0o755);
  }
}

async function safeRename(src: string, dest: string) {
  try { await rename(src, dest); } catch (e) {
    await Bun.write(Bun.file(dest), Bun.file(src));
    await rm(src, { force: true });
  }
}

export async function downloadFileWithProgress(url: string, destPath: string, spinner: any, versionLabel: string) {
    const maxRetries = 3;
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Status ${response.status}`);
            
            const total = +(response.headers.get('Content-Length') || 0);
            let loaded = 0;
            const reader = response.body?.getReader();
            if (!reader) throw new Error("Could not get response body reader");

            const writer = Bun.file(destPath).writer();
            const isWindows = OS_PLATFORM === 'win32';
            
            if (spinner) spinner.stop();
            if (isWindows && attempt === 1) console.log(`Downloading Bun ${versionLabel}...`);
            else if (attempt > 1) console.log(`Retry ${attempt}/${maxRetries} for Bun ${versionLabel}...`);

            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    writer.write(value);
                    loaded += value.length;
                }
                await writer.end();
                if (spinner) spinner.start();
                return; // Success
            } catch (e) {
                try { await writer.end(); } catch(e2) {}
                throw e;
            }
        } catch (e) {
            lastError = e;
            // Cleanup partial file
            try { await rm(destPath, { force: true }); } catch (e2) {}
            
            if (attempt < maxRetries) {
                // Wait before retry
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
        }
    }

    if (spinner) spinner.start();
    throw lastError || new Error("Download failed after multiple attempts");
}

export async function installBunVersion(targetVersion?: string, options: { global?: boolean } = {}): Promise<void> {
  let versionToInstall = targetVersion || await getRcVersion() || undefined;
  if (!versionToInstall) {
    console.error(colors.red('No version specified.'));
    return;
  }

  let installedVersion: string | null = null;
  let shouldConfigureShell = false;

  try {
    await withSpinner(`Finding Bun ${versionToInstall}...`, async (spinner) => {
        let resolvedVersion: string | null = null;
        const normVersion = normalizeVersion(versionToInstall!);

        if (/^v?\d+\.\d+\.\d+$/.test(versionToInstall!) && !versionToInstall!.includes('canary')) {
             if (await checkBunVersionExists(normVersion)) resolvedVersion = normVersion;
             else throw new Error(`Version ${normVersion} not found.`);
        } else if (versionToInstall === 'latest') {
             const tags = await fetchBunDistTags();
             if (tags.latest) resolvedVersion = normalizeVersion(tags.latest);
        }

        if (!resolvedVersion) throw new Error(`Could not resolve version.`);
        const result = await findBunDownloadUrl(resolvedVersion);
        if (!result) throw new Error(`Incompatible system.`);
        const { url, mirrorUrl, foundVersion } = result;

        const installDir = join(BVM_VERSIONS_DIR, foundVersion);
        const installBinDir = join(installDir, 'bin');
        const bunExecutablePath = join(installBinDir, EXECUTABLE_NAME);

        if (!(await pathExists(bunExecutablePath))) {
            await ensureDir(installBinDir);
            if (normalizeVersion(Bun.version) === foundVersion && !IS_TEST_MODE) {
                await Bun.write(Bun.file(bunExecutablePath), Bun.file(process.execPath));
            } else if (IS_TEST_MODE) {
                await writeTestBunBinary(bunExecutablePath, foundVersion);
            } else {
                await ensureDir(BVM_CACHE_DIR);
                const cachedArchivePath = join(BVM_CACHE_DIR, `${foundVersion}-${basename(url)}`);
                if (!(await pathExists(cachedArchivePath))) {
                    const tmp = `${cachedArchivePath}.tmp`;
                    try { await downloadFileWithProgress(url, tmp, spinner, foundVersion); await safeRename(tmp, cachedArchivePath); } 
                    catch (e) { 
                        if (mirrorUrl) { await downloadFileWithProgress(mirrorUrl, tmp, spinner, foundVersion); await safeRename(tmp, cachedArchivePath); } 
                        else throw e;
                    }
                }
                spinner.update(`Extracting...`);
                await extractArchive(cachedArchivePath, installDir);
                const possible = [join(installDir, EXECUTABLE_NAME), join(installDir, 'bin', EXECUTABLE_NAME), join(installDir, 'package', 'bin', EXECUTABLE_NAME)];
                let found = '';
                for (const p of possible) { if (await pathExists(p)) { found = p; break; } }
                if (found && found !== bunExecutablePath) await safeRename(found, bunExecutablePath);
            }
            await chmod(bunExecutablePath, 0o755);
            await generateBunfig(installDir);
            await ensureBunx(installBinDir, bunExecutablePath);
            await fixWindowsShims(installBinDir);
        }
        
        spinner.succeed(colors.green(`Bun ${foundVersion} physically installed.`));
        installedVersion = foundVersion;
        shouldConfigureShell = true;
    });
  } catch (e: any) { throw new Error(`Failed: ${e.message}`); }

  if (shouldConfigureShell) await configureShell(false);
  if (installedVersion) {
      await useBunVersion(installedVersion, { silent: true });
      if (!(await pathExists(join(BVM_ALIAS_DIR, 'default')))) await createAlias('default', installedVersion, { silent: true });
  }
  await rehash();
}

async function writeTestBunBinary(targetPath: string, version: string) {
  const v = version.replace(/^v/, '');
  const script = `#!/usr/bin/env bash\nif [[ $# -gt 0 && "$1" == "--version" ]]; then echo "${v}"; exit 0; fi\nexit 0\n`;
  await Bun.write(targetPath, script);
  await chmod(targetPath, 0o755);
}
