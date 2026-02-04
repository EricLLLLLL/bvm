import path, { join, basename, dirname } from 'path';
import { BVM_VERSIONS_DIR, BVM_CACHE_DIR, EXECUTABLE_NAME, isTestMode, OS_PLATFORM, BVM_ALIAS_DIR, BVM_DIR, BVM_CURRENT_DIR, BVM_RUNTIME_DIR } from '../constants';
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
import { BunfigManager } from '../utils/bunfig';
import { fixWindowsShims } from '../utils/windows-shim-fixer';
import { getFastestRegistry } from '../utils/network-utils';

/**
 * Generates a bunfig.toml using the LOGICAL current path as an anchor.
 * This is the secret to zero-drift execution on Windows.
 * Also configures cache directory for version isolation.
 */
export async function generateBunfig(
    versionPhysicalDir: string,
    options: { platform?: string; registryUrl?: string } = {},
) {
    const bunfigPath = join(versionPhysicalDir, "bunfig.toml");

    // We use the PHYSICAL path to anchor Bun's internal logic.
    let globalDir = versionPhysicalDir;
    let globalBinDir = join(versionPhysicalDir, "bin");
    let cacheDir = join(versionPhysicalDir, "install", "cache");

    // Correctly escape backslashes for TOML on Windows
    // Also normalize forward slashes to backslashes for consistency on Windows
    const platform = options.platform || OS_PLATFORM;
    if (platform === 'win32') {
        globalDir = globalDir.replace(/\//g, "\\").replace(/\\/g, "\\\\");
        globalBinDir = globalBinDir.replace(/\//g, "\\").replace(/\\/g, "\\\\");
        cacheDir = cacheDir.replace(/\//g, "\\").replace(/\\/g, "\\\\");
    }

    let content = `[install]
globalDir = "${globalDir}"
globalBinDir = "${globalBinDir}"

[install.cache]
dir = "${cacheDir}"`;

    // Inject fastest registry
    try {
        const fastestRegistry = options.registryUrl || await getFastestRegistry();
        if (fastestRegistry) {
            content += `\n\n[install.registry]\nurl = "${fastestRegistry}"\n`;
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
            let nextPercentLog = 0;
            
            if (spinner) spinner.stop();
            if (isWindows && attempt === 1) console.log(`Downloading Bun ${versionLabel}...`);
            else if (attempt > 1) console.log(`Retry ${attempt}/${maxRetries} for Bun ${versionLabel}...`);

            // Create progress bar if we know the total size
            let progressBar: ProgressBar | null = null;
            if (total > 0 && !isWindows) {
                progressBar = new ProgressBar(total);
                progressBar.start();
            } else if (!isWindows) {
                console.log(`Downloading Bun ${versionLabel}...`);
            }

            try {
                if (isWindows && total > 0) {
                    console.log('> 0%');
                    nextPercentLog = 10;
                }
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    writer.write(value);
                    loaded += value.length;
                    
                    // Update progress bar
                    if (progressBar) {
                        progressBar.update(loaded);
                    }

                    // Windows: print coarse progress in 10% increments (robust across consoles)
                    if (isWindows && total > 0) {
                        const percent = Math.floor((loaded / total) * 100);
                        while (percent >= nextPercentLog && nextPercentLog <= 100) {
                            console.log(`> ${nextPercentLog}%`);
                            nextPercentLog += 10;
                        }
                    }
                }
                await writer.end();
                
                if (progressBar) {
                    progressBar.stop();
                }

                if (isWindows && total > 0 && nextPercentLog <= 100) {
                    console.log('> 100%');
                }
                
                if (spinner) spinner.start();
                return; // Success
            } catch (e) {
                try { await writer.end(); } catch(e2) {}
                if (progressBar) {
                    progressBar.stop();
                }
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

	        // Safety: do not allow partial/range installs (fuzzy matching) for install.
	        // Only exact x.y.z, explicit "latest", or fully qualified canary tags are supported.
	        const raw = versionToInstall!.trim();
	        const isPartial = /^v?\d+\.\d+$/.test(raw);
	        const looksLikeRange = /[xX\*\^\~\<\>\=]/.test(raw);
	        if (isPartial || looksLikeRange) {
	            throw new Error('Fuzzy matching (e.g. "1.1") is disabled for install. Please specify a full version like "1.1.20".');
	        }

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

	        // On Windows, install to runtime/ first, then create versions/ as junction
	        // This ensures global packages go to runtime/ and shims work correctly
	        const runtimeDir = join(BVM_RUNTIME_DIR, foundVersion);
	        const versionsDir = join(BVM_VERSIONS_DIR, foundVersion);
        const runtimeBinDir = join(runtimeDir, 'bin');
        const bunExecutablePath = join(runtimeBinDir, EXECUTABLE_NAME);

	        if (!(await pathExists(bunExecutablePath))) {
	            await ensureDir(runtimeBinDir);
	            if (normalizeVersion(Bun.version) === foundVersion && !isTestMode()) {
	                await Bun.write(Bun.file(bunExecutablePath), Bun.file(process.execPath));
	            } else if (isTestMode()) {
	                await writeTestBunBinary(bunExecutablePath, foundVersion);
	            } else {
                await ensureDir(BVM_CACHE_DIR);
                const cachedArchivePath = join(BVM_CACHE_DIR, `${foundVersion}-${basename(url)}`);
                if (!(await pathExists(cachedArchivePath))) {
                    const tmp = `${cachedArchivePath}.tmp`;
                    // Log download source for debugging
                    console.log(colors.dim(`  Downloading from: ${url.replace(/\/[^\/]*$/, '/...')}`));
                    try { 
                        await downloadFileWithProgress(url, tmp, spinner, foundVersion); 
                        await safeRename(tmp, cachedArchivePath); 
                    }
                    catch (e) {
                        if (mirrorUrl) { 
                            console.log(colors.yellow(`  Primary source failed, trying mirror...`));
                            await downloadFileWithProgress(mirrorUrl, tmp, spinner, foundVersion); 
                            await safeRename(tmp, cachedArchivePath); 
                        }
                        else throw e;
                    }
                }
                spinner.update(`Extracting...`);
                await extractArchive(cachedArchivePath, runtimeDir);
                const possible = [join(runtimeDir, EXECUTABLE_NAME), join(runtimeDir, 'bin', EXECUTABLE_NAME), join(runtimeDir, 'package', 'bin', EXECUTABLE_NAME)];
                let found = '';
                for (const p of possible) { if (await pathExists(p)) { found = p; break; } }
                if (found && found !== bunExecutablePath) await safeRename(found, bunExecutablePath);
            }
            await chmod(bunExecutablePath, 0o755);

            // Create cache directory for version isolation (Bun 1.3.8+)
            const cacheDir = join(runtimeDir, 'install', 'cache');
            await ensureDir(cacheDir);

            // Generate bunfig in runtime directory
            await generateBunfig(runtimeDir);
            await ensureBunx(runtimeBinDir, bunExecutablePath);
            await fixWindowsShims(runtimeBinDir);

	        }

	        // Always ensure versions/ link exists (even if runtime was already present).
	        await ensureDir(BVM_VERSIONS_DIR);

	        // Create versions/vX.X.X as a junction to runtime/vX.X.X on Windows
	        // On Unix, create a relative symlink
	        if (!(await pathExists(versionsDir))) {
	            if (OS_PLATFORM === 'win32') {
	                await createSymlink(runtimeDir, versionsDir);
	            } else {
	                await symlink('../runtime/' + foundVersion, versionsDir, 'dir');
	            }
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
  // Note: rehash() is called by useBunVersion, no need to call again here
}

async function writeTestBunBinary(targetPath: string, version: string) {
  const v = version.replace(/^v/, '');
  const script = `#!/usr/bin/env bash\nif [[ $# -gt 0 && "$1" == "--version" ]]; then echo "${v}"; exit 0; fi\nexit 0\n`;
  await Bun.write(targetPath, script);
  await chmod(targetPath, 0o755);
}
