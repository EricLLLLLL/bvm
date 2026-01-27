import { join, basename, dirname } from 'path';
import { BVM_VERSIONS_DIR, BVM_CACHE_DIR, EXECUTABLE_NAME, IS_TEST_MODE, OS_PLATFORM, BVM_ALIAS_DIR } from '../constants';
import { ensureDir, pathExists, removeDir, resolveVersion, normalizeVersion, readDir, getActiveVersion } from '../utils';
import { findBunDownloadUrl, fetchBunVersions, checkBunVersionExists, fetchBunDistTags } from '../api';
import { colors, ProgressBar } from '../utils/ui';
import { extractArchive } from '../utils/archive';
import { chmod } from 'fs/promises';
import { configureShell } from './setup';
import { getRcVersion } from '../rc';
import { getInstalledVersions } from '../utils';
import { createAlias } from './alias';
import { withSpinner } from '../command-runner';
import { runCommand } from '../helpers/process';
import { useBunVersion } from './use';
import { rehash } from './rehash';
import { rename, rm } from 'fs/promises';
import { RegistrySpeedTester, REGISTRIES } from '../utils/registry-check';
import { BunfigManager } from '../utils/bunfig';

async function safeRename(src: string, dest: string) {
  try {
    await rename(src, dest);
  } catch (e) {
    await Bun.write(Bun.file(dest), Bun.file(src));
    await rm(src, { force: true });
  }
}

async function downloadFileWithProgress(url: string, destPath: string, spinner: any, versionLabel: string) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Status ${response.status}`);
    
    const total = +(response.headers.get('Content-Length') || 0);
    let loaded = 0;
    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');
    
    const writer = Bun.file(destPath).writer();
    const isWindows = OS_PLATFORM === 'win32';
    
    // Stop spinner to hand over to specific progress handler
    spinner.stop();
    
    let bar: any = null;
    let lastReportedPct = -1;

    if (!isWindows) {
        // Mac/Linux: Use fancy progress bar
        bar = new ProgressBar(total || 40 * 1024 * 1024);
        bar.start();
    } else {
        // Windows: Use ancient stable method (console.log)
        console.log(`Downloading Bun ${versionLabel}...`);
    }
    
    try {
        const startTime = Date.now();
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            writer.write(value);
            loaded += value.length;
            
            if (!isWindows && bar) {
                const elapsed = (Date.now() - startTime) / 1000;
                const speed = elapsed > 0 ? (loaded / 1024 / elapsed).toFixed(0) : '0';
                bar.update(loaded, { speed });
            } else if (isWindows && total) {
                const pct = Math.floor((loaded / total) * 10); // report every 10%
                if (pct > lastReportedPct) {
                    console.log(`  > ${pct * 10}%`);
                    lastReportedPct = pct;
                }
            }
        }
        await writer.end();
        
        if (!isWindows && bar) {
            bar.stop();
        } else {
            console.log(`  > 100% [Done]`);
        }
    } catch (e) {
        try { writer.end(); } catch(e2) {} 
        if (!isWindows && bar) bar.stop();
        else console.log(`  > Download Failed`);
        spinner.start(); 
        throw e;
    }
    
    spinner.start(); 
}

/**
 * Installs a specific Bun version.
 * @param targetVersion The version to install (e.g., "1.0.0", "latest"). Optional if .bvmrc exists.
 */
export async function installBunVersion(targetVersion?: string, options: { global?: boolean } = {}): Promise<void> {
  let versionToInstall = targetVersion;
  let installedVersion: string | null = null;
  let shouldConfigureShell = false;

  if (!versionToInstall) {
    versionToInstall = await getRcVersion() || undefined;
  }

  if (!versionToInstall) {
    console.error(colors.red('No version specified and no .bvmrc found. Usage: bvm install <version>'));
    return;
  }

  try {
    await withSpinner(
      `Finding Bun ${versionToInstall} release...`,
      async (spinner) => {
        let resolvedVersion: string | null = null;
        const normVersion = normalizeVersion(versionToInstall!);

        // Strategy 0: Direct Lookup (Fastest, Crash-safe)
        // If the user requests an exact version (e.g., "1.1.20"), check it directly.
        if (/^v?\d+\.\d+\.\d+$/.test(versionToInstall!) && !versionToInstall!.includes('canary')) {
             spinner.update(`Checking if Bun ${normVersion} exists...`);
             if (await checkBunVersionExists(normVersion)) {
                 resolvedVersion = normVersion;
             } else {
                 spinner.fail(colors.red(`Bun version ${normVersion} not found on registry.`));
                 throw new Error(`Bun version ${normVersion} not found on registry.`);
             }
        }
        
        // Strategy 1: Handle 'latest' via dist-tags (Fast, Small JSON)
        else if (versionToInstall === 'latest') {
             spinner.update('Checking latest version...');
             const tags = await fetchBunDistTags();
             if (tags.latest) {
                 resolvedVersion = normalizeVersion(tags.latest);
             } else {
                 throw new Error('Could not resolve "latest" version.');
             }
        }

        // Strategy 2: Block Fuzzy Matching to prevent crashes
        // We do NOT fetch the full list (1200+ items) automatically anymore.
        else {
            spinner.fail(colors.yellow(`Fuzzy matching (e.g. "1.1") is disabled for stability.`));
            console.log(colors.dim(`  Please specify the exact version (e.g. "1.1.20") or "latest".`));
            console.log(colors.dim(`  To see available versions, run: bvm ls-remote`));
            throw new Error('Fuzzy matching disabled');
        }

        if (!resolvedVersion) {
            spinner.fail(colors.red(`Could not find a Bun release for '${versionToInstall}' compatible with your system.`));
            throw new Error(`Could not find a Bun release for '${versionToInstall}' compatible with your system.`);
        }

        const result = await findBunDownloadUrl(resolvedVersion);
        if (!result) {
          throw new Error(`Could not find a Bun release for ${resolvedVersion} compatible with your system.`);
        }
        const { url, mirrorUrl, foundVersion } = result;

        const installDir = join(BVM_VERSIONS_DIR, foundVersion);
        const installBinDir = join(installDir, 'bin');
        const bunExecutablePath = join(installBinDir, EXECUTABLE_NAME);

        if (await pathExists(bunExecutablePath)) {
          spinner.succeed(colors.green(`Bun ${foundVersion} is already installed.`));
          installedVersion = foundVersion;
          shouldConfigureShell = true;
        } else {
            const currentRuntimeVersion = normalizeVersion(Bun.version);
            if (currentRuntimeVersion === foundVersion && !IS_TEST_MODE) {
                spinner.info(colors.cyan(`Requested version ${foundVersion} matches current BVM runtime. Creating symlink...`));
                await ensureDir(installBinDir);
                // Create a relative symlink to avoid disk duplication
                const runtimeBinPath = process.execPath;
                try {
                  const { symlink } = await import('fs/promises');
                  await symlink(runtimeBinPath, bunExecutablePath);
                } catch (e) {
                  // Fallback to copy if symlink fails (e.g., on Windows without admin)
                  await Bun.write(Bun.file(bunExecutablePath), Bun.file(runtimeBinPath));
                  await chmod(bunExecutablePath, 0o755);
                }
                spinner.succeed(colors.green(`Bun ${foundVersion} linked from local runtime.`));
                installedVersion = foundVersion;
                shouldConfigureShell = true;
            } else if (IS_TEST_MODE) {
                await ensureDir(installBinDir);
                await writeTestBunBinary(bunExecutablePath, foundVersion);
                installedVersion = foundVersion;
                shouldConfigureShell = true;
            } else {
                // Bun.write doesn't support progress events, so we update spinner text
                spinner.update(`Downloading Bun ${foundVersion} to cache...`);
                
                await ensureDir(BVM_CACHE_DIR);
                const cachedArchivePath = join(BVM_CACHE_DIR, `${foundVersion}-${basename(url)}`);

                if (await pathExists(cachedArchivePath)) {
                    spinner.succeed(colors.green(`Using cached Bun ${foundVersion} archive.`));
                } else {
                    const tempDownloadPath = `${cachedArchivePath}.${Date.now()}.tmp`;
                    
                    try {
                        await downloadFileWithProgress(url, tempDownloadPath, spinner, foundVersion);
                        
                        // Rename .tmp to actual file
                        await safeRename(tempDownloadPath, cachedArchivePath);
                    } catch (error: any) {
                        try { await rm(tempDownloadPath, { force: true }); } catch {}
                        
                        spinner.update(`Download failed, trying mirror...`);
                        console.log(colors.dim(`
Debug: ${error.message}`)); // Visible if spinner fails

                        // Strategy 2: Failover to Mirror
                        if (mirrorUrl) {
                            const mirrorHost = new URL(mirrorUrl).hostname;
                            spinner.update(`Downloading from mirror (${mirrorHost})...`);
                            await downloadFileWithProgress(mirrorUrl, tempDownloadPath, spinner, foundVersion);
                            await safeRename(tempDownloadPath, cachedArchivePath);
                        } else {
                            throw error;
                        }
                    }

                    // Progress bar logic removed as Bun.write is atomic
                }

                spinner.update(`Extracting Bun ${foundVersion}...`);
                await ensureDir(installDir);
                await extractArchive(cachedArchivePath, installDir);
        
                let foundSourceBunPath = '';
                // Updated Path Discovery for NPM packages (package/bin/bun) and GitHub zips (bun-xxx/bun)
                const possiblePaths = [
                    join(installDir, EXECUTABLE_NAME),
                    join(installDir, 'bin', EXECUTABLE_NAME),
                    join(installDir, 'package', 'bin', EXECUTABLE_NAME) // NPM .tgz structure
                ];
                const dirEntries = await readDir(installDir);
                for (const entry of dirEntries) {
                    if (entry.startsWith('bun-')) {
                        possiblePaths.push(join(installDir, entry, EXECUTABLE_NAME));
                        possiblePaths.push(join(installDir, entry, 'bin', EXECUTABLE_NAME));
                    }
                }
                for (const p of possiblePaths) { if (await pathExists(p)) { foundSourceBunPath = p; break; } }
                
                if (!foundSourceBunPath) throw new Error(`Could not find bun executable in ${installDir}`);
                
                // If found in package/bin/bun, we might want to move it or keep the structure?
                // For simplicity and consistency with old BVM, let's move it to installBinDir and clean up.
                await ensureDir(installBinDir);
                if (foundSourceBunPath !== bunExecutablePath) {
                    await safeRename(foundSourceBunPath, bunExecutablePath);
                    
                    const pDir = dirname(foundSourceBunPath);
                    if (pDir !== installDir && pDir !== installBinDir) await removeDir(pDir);
                }
                await chmod(bunExecutablePath, 0o755);
                spinner.succeed(colors.green(`Bun ${foundVersion} installed successfully.`));
                installedVersion = foundVersion;
                shouldConfigureShell = true;
            }
        }
      },
      { failMessage: `Failed to install Bun ${versionToInstall}` },
    );
  } catch (error: any) {
    throw new Error(`Failed to install Bun: ${error.message}`);
  }

  if (shouldConfigureShell) {
    await configureShell(false);
  }

  // Auto-switch to the newly installed version (unless global/alias logic overrides in future)
  if (installedVersion) {
      try {
          await useBunVersion(installedVersion, { silent: true });
          
          // Auto-set default alias if it doesn't exist (first install)
          const defaultAliasPath = join(BVM_ALIAS_DIR, 'default');
          if (!(await pathExists(defaultAliasPath))) {
              await createAlias('default', installedVersion, { silent: true });
          }
      } catch (e) {
          // Ignore if switch fails (though unlikely if installed)
      }
  }

  await rehash();

  // --- Smart Registry Auto-Config ---
  if (installedVersion && !IS_TEST_MODE) {
    try {
      const bunfig = new BunfigManager();
      // Only auto-configure if no registry is explicitly set
      if (!bunfig.getRegistry()) {
        await withSpinner('Checking network speed for registry optimization...', async (spinner) => {
             const tester = new RegistrySpeedTester(3000); // 3s timeout
             const fastest = await tester.getFastestRegistry();
             
             if (fastest === REGISTRIES.NPM_MIRROR) {
               bunfig.setRegistry(REGISTRIES.NPM_MIRROR);
               spinner.succeed(colors.green('⚡ Auto-configured global bunfig.toml to use npmmirror.com for faster installs.'));
             } else {
               spinner.stop(); // Official is fast enough or wins
             }
        }, { failMessage: 'Registry check failed (harmless)' });
      }
    } catch (e) {
      // Ignore errors silently
    }
  }

  // Final success messages (moved here to appear after Rehash log)
  if (installedVersion) {
      console.log(colors.cyan(`\n✓ Bun ${installedVersion} installed and active.`));
      console.log(colors.dim(`  To verify, run: bun --version or bvm ls`));
  }
}

async function writeTestBunBinary(targetPath: string, version: string): Promise<void> {
  const plainVersion = version.replace(/^v/, '');
  const script = `#!/usr/bin/env bash
set -euo pipefail
if [[ $# -gt 0 && "$1" == "--version" ]]; then echo "${plainVersion}"; exit 0; fi
echo "Bun ${plainVersion} stub invoked with: $@"
exit 0
`;
  await Bun.write(targetPath, script);
  await chmod(targetPath, 0o755);
}