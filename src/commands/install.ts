import path, { join, basename, dirname } from 'path';
import { BVM_VERSIONS_DIR, BVM_CACHE_DIR, EXECUTABLE_NAME, IS_TEST_MODE, OS_PLATFORM, BVM_ALIAS_DIR, BVM_DIR } from '../constants';
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

/**
 * Generates a bunfig.toml to lock global installation paths.
 */
async function generateBunfig(dir: string, binDir: string) {
    const bunfigPath = join(dir, "bunfig.toml");
    const versionDirAbs = path.resolve(dir);
    const binDirAbs = path.resolve(binDir); // This is versionDir/bin
    
    // Cross-platform backslash handling
    const winDir = versionDirAbs.replace(/\\/g, "\\\\");
    const winBinDir = binDirAbs.replace(/\\/g, "\\\\");
    
    // We lock Bun's internal output to the version's own bin directory.
    // This ensures Bun's native shims work perfectly within their expected physical layout.
    const content = `[install]\nglobalDir = "${winDir}"\nglobalBinDir = "${winBinDir}"\n`;
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
    
    spinner.stop();
    
    let bar: any = null;
    let lastReportedPct = -1;

    if (!isWindows) {
        bar = new ProgressBar(total || 40 * 1024 * 1024);
        bar.start();
    } else {
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
                const pct = Math.floor((loaded / total) * 10);
                if (pct > lastReportedPct) {
                    console.log(`  > ${pct * 10}%`);
                    lastReportedPct = pct;
                }
            }
        }
        await writer.end();
        if (!isWindows && bar) bar.stop();
        else console.log(`  > 100% [Done]`);
    } catch (e) {
        try { writer.end(); } catch(e2) {} 
        if (!isWindows && bar) bar.stop();
        else console.log(`  > Download Failed`);
        spinner.start(); 
        throw e;
    }
    
    spinner.start(); 
}

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

        if (/^v?\d+\.\d+\.\d+$/.test(versionToInstall!) && !versionToInstall!.includes('canary')) {
             if (await checkBunVersionExists(normVersion)) {
                 resolvedVersion = normVersion;
             } else {
                 throw new Error(`Bun version ${normVersion} not found on registry.`);
             }
        } else if (versionToInstall === 'latest') {
             const tags = await fetchBunDistTags();
             if (tags.latest) resolvedVersion = normalizeVersion(tags.latest);
             else throw new Error('Could not resolve "latest" version.');
        } else {
            throw new Error('Fuzzy matching disabled');
        }

        const result = await findBunDownloadUrl(resolvedVersion!);
        if (!result) throw new Error(`Incompatible system.`);
        const { url, mirrorUrl, foundVersion } = result;

        const installDir = join(BVM_VERSIONS_DIR, foundVersion);
        const installBinDir = join(installDir, 'bin');
        const bunExecutablePath = join(installBinDir, EXECUTABLE_NAME);

        if (await pathExists(bunExecutablePath)) {
          spinner.succeed(colors.green(`Bun ${foundVersion} is already installed physically.`));
          await generateVersionBunfig(installDir); // Ensure config exists
          installedVersion = foundVersion;
          shouldConfigureShell = true;
        } else {
            await ensureDir(installBinDir);
            
            const currentRuntimeVersion = normalizeVersion(Bun.version);
            if (currentRuntimeVersion === foundVersion && !IS_TEST_MODE) {
                spinner.info(colors.cyan(`Reusing current BVM runtime for ${foundVersion}...`));
                await Bun.write(Bun.file(bunExecutablePath), Bun.file(process.execPath));
                await chmod(bunExecutablePath, 0o755);
            } else if (IS_TEST_MODE) {
                await writeTestBunBinary(bunExecutablePath, foundVersion);
            } else {
                await ensureDir(BVM_CACHE_DIR);
                const cachedArchivePath = join(BVM_CACHE_DIR, `${foundVersion}-${basename(url)}`);
                if (!(await pathExists(cachedArchivePath))) {
                    const tempDownloadPath = `${cachedArchivePath}.tmp`;
                    try {
                        await downloadFileWithProgress(url, tempDownloadPath, spinner, foundVersion);
                        await safeRename(tempDownloadPath, cachedArchivePath);
                    } catch (error: any) {
                        if (mirrorUrl) {
                            await downloadFileWithProgress(mirrorUrl, tempDownloadPath, spinner, foundVersion);
                            await safeRename(tempDownloadPath, cachedArchivePath);
                        } else throw error;
                    }
                }
                spinner.update(`Extracting Bun ${foundVersion}...`);
                await extractArchive(cachedArchivePath, installDir);
                
                let foundSourceBunPath = '';
                const possiblePaths = [
                    join(installDir, EXECUTABLE_NAME),
                    join(installDir, 'bin', EXECUTABLE_NAME),
                    join(installDir, 'package', 'bin', EXECUTABLE_NAME)
                ];
                for (const p of possiblePaths) { if (await pathExists(p)) { foundSourceBunPath = p; break; } }
                if (!foundSourceBunPath) throw new Error(`Executable not found.`);
                
                if (foundSourceBunPath !== bunExecutablePath) {
                    await safeRename(foundSourceBunPath, bunExecutablePath);
                }
                await chmod(bunExecutablePath, 0o755);
            }
            
            await generateVersionBunfig(installDir);
            await ensureBunx(installBinDir, bunExecutablePath);
            spinner.succeed(colors.green(`Bun ${foundVersion} installed successfully.`));
            installedVersion = foundVersion;
            shouldConfigureShell = true;
        }
      },
      { failMessage: `Failed to install Bun ${versionToInstall}` },
    );
  } catch (error: any) {
    throw new Error(`Failed to install Bun: ${error.message}`);
  }

  if (shouldConfigureShell) await configureShell(false);
  if (installedVersion) {
      try {
          await useBunVersion(installedVersion, { silent: true });
          const defaultAliasPath = join(BVM_ALIAS_DIR, 'default');
          if (!(await pathExists(defaultAliasPath))) {
              await createAlias('default', installedVersion, { silent: true });
          }
      } catch (e) {}
  }
  await rehash();
}

async function writeTestBunBinary(targetPath: string, version: string): Promise<void> {
  const plainVersion = version.replace(/^v/, '');
  const script = `#!/usr/bin/env bash\nif [[ $# -gt 0 && "$1" == "--version" ]]; then echo "${plainVersion}"; exit 0; fi\necho "Bun ${plainVersion} stub"\nexit 0\n`;
  await Bun.write(targetPath, script);
  await chmod(targetPath, 0o755);
}
