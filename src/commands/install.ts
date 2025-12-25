import { join, basename, dirname } from 'path';
import { BVM_VERSIONS_DIR, BVM_CACHE_DIR, EXECUTABLE_NAME, IS_TEST_MODE } from '../constants';
import { ensureDir, pathExists, removeDir, resolveVersion, normalizeVersion, readDir, getActiveVersion } from '../utils';
import { findBunDownloadUrl, fetchBunVersions } from '../api';
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
        const remoteVersions = await fetchBunVersions();
        const filteredRemoteVersions = remoteVersions
          .filter(v => !v.includes('canary'))
          .map(v => normalizeVersion(v));

        const resolvedVersion = resolveVersion(versionToInstall!, filteredRemoteVersions);

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
                spinner.update(`Initiating download for Bun ${foundVersion}...`);
                await ensureDir(BVM_CACHE_DIR);
                const cachedArchivePath = join(BVM_CACHE_DIR, `${foundVersion}-${basename(url)}`);
        
                if (await pathExists(cachedArchivePath)) {
                    spinner.succeed(colors.green(`Using cached Bun ${foundVersion} archive.`));
                } else {
                    spinner.stop();
                    console.log(colors.cyan(`Downloading Bun ${foundVersion} to cache...`));
                    
                    let response: Response;
                    try {
                        // Strategy 1: Direct Download with 10s timeout
                        const controller = new AbortController();
                        const timeoutId = setTimeout(() => controller.abort(), 10000);
                        
                        response = await fetch(url, { signal: controller.signal });
                        clearTimeout(timeoutId);
                        
                        if (!response.ok) {
                            throw new Error(`Direct download failed with status ${response.status}`);
                        }
                    } catch (error: any) {
                        // Strategy 2: Failover to Mirror if available
                        if (mirrorUrl) {
                            const mirrorHost = new URL(mirrorUrl).hostname;
                            console.log(colors.yellow(`Direct download failed or timed out. Retrying via mirror ${mirrorHost}...`));
                            response = await fetch(mirrorUrl);
                            if (!response.ok) {
                                throw new Error(`Mirror download failed too: ${response.statusText} (${response.status})`);
                            }
                        } else {
                            throw error;
                        }
                    }

                    if (!response.ok || !response.body) throw new Error(`Download failed: ${response.statusText}`);
        
                    const totalBytes = parseInt(response.headers.get('content-length') || '0', 10);
                    const progressBar = totalBytes > 0 ? new ProgressBar(totalBytes) : null;
                    if (progressBar) progressBar.start();
        
                    const writer = Bun.file(cachedArchivePath).writer();
                    const reader = response.body.getReader();
                    let loaded = 0; let lastLoaded = 0; let lastTime = Date.now(); let lastRenderTime = 0;
        
                    try {
                        while (true) {
                            const { done, value } = await reader.read();
                            if (done) break;
                            writer.write(value);
                            loaded += value.length;
                            if (progressBar) {
                                const now = Date.now();
                                if (now - lastTime >= 500) {
                                    const speed = (loaded - lastLoaded) / (now - lastTime) * 1000 / 1024;
                                    progressBar.update(loaded, { speed: speed.toFixed(2) });
                                    lastLoaded = loaded; lastTime = now; lastRenderTime = now;
                                } else if (now - lastRenderTime >= 100) {
                                    progressBar.update(loaded); lastRenderTime = now;
                                }
                            }
                        }
                    } finally { writer.end(); }
                    if (progressBar) progressBar.stop();
                }
        
                spinner.start(`Extracting Bun ${foundVersion}...`);
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
                    await runCommand(['mv', foundSourceBunPath, bunExecutablePath]);
                    const pDir = dirname(foundSourceBunPath);
                    if (pDir !== installDir && pDir !== installBinDir) await removeDir(pDir);
                }
                await chmod(bunExecutablePath, 0o755);
                spinner.succeed(colors.green(`Bun ${foundVersion} installed successfully.`));
                installedVersion = foundVersion;
                shouldConfigureShell = true;
            }
        }

        if (installedVersion) {
            const currentlyInstalledVersions = await getInstalledVersions();
            const activeInfo = await getActiveVersion();
            if (!activeInfo.version && currentlyInstalledVersions.length === 1) {
                await createAlias('default', foundVersion);
                console.log(colors.cyan(`✓ Bun ${foundVersion} is now your default version.`));
            } else {
                console.log(colors.cyan(`✓ Bun ${foundVersion} installed and is active for this session.`));
                console.log(colors.dim(`  To make it the default for new shells, run: bvm default ${foundVersion}`));
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
  await rehash();
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
