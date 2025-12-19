import { join, basename, dirname } from 'path';
import { BVM_VERSIONS_DIR, BVM_BIN_DIR, BVM_CACHE_DIR, EXECUTABLE_NAME, IS_TEST_MODE } from '../constants';
import { ensureDir, pathExists, createSymlink, removeDir, resolveVersion, normalizeVersion, readDir } from '../utils';
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
export async function installBunVersion(targetVersion?: string): Promise<void> {
  let versionToInstall = targetVersion;
  let installedVersion: string | null = null;
  let shouldConfigureShell = false;

  if (!versionToInstall) {
    versionToInstall = await getRcVersion() || undefined;
    if (versionToInstall) {
        console.log(colors.dim(`Found '.bvmrc' with version <${versionToInstall}>`));
    }
  }

  if (!versionToInstall) {
    console.error(colors.red('No version specified and no .bvmrc found. Usage: bvm install <version>'));
    return;
  }

  try {
    await withSpinner(
      `Finding Bun ${versionToInstall} release...`,
      async (spinner) => {
    // Fetch all remote versions for resolution
    const remoteVersions = await fetchBunVersions();
    // Filter out 'canary' versions as they are not stable for installation
    const filteredRemoteVersions = remoteVersions
      .filter(v => !v.includes('canary'))
      .map(v => normalizeVersion(v)); // Normalize versions before passing to resolveVersion

    // Resolve the target version using fuzzy matching against remote versions
    const resolvedVersion = resolveVersion(versionToInstall, filteredRemoteVersions);

    if (!resolvedVersion) {
        spinner.fail(colors.red(`Could not find a Bun release for '${versionToInstall}' compatible with your system.`));
        console.log(colors.cyan(`Available remote versions: ${filteredRemoteVersions.length > 0 ? filteredRemoteVersions.join(', ') : 'None'}`));
        throw new Error(`Could not find a Bun release for '${versionToInstall}' compatible with your system.`);
    }

    // 1. Find download URL using the resolved version
    const result = await findBunDownloadUrl(resolvedVersion);
    if (!result) {
      // This case should ideally not be hit if resolvedVersion came from findBunDownloadUrl itself
      spinner.fail(colors.red(`Could not find a Bun release for ${resolvedVersion} compatible with your system.`));
      throw new Error(`Could not find a Bun release for ${resolvedVersion} compatible with your system.`);
    }
    const { url, foundVersion } = result;

    const installDir = join(BVM_VERSIONS_DIR, foundVersion);
    const installBinDir = join(installDir, 'bin');
    const bunExecutablePath = join(installBinDir, EXECUTABLE_NAME);

    if (await pathExists(bunExecutablePath)) {
      spinner.succeed(colors.green(`Bun ${foundVersion} is already installed.`));
      installedVersion = foundVersion;
      shouldConfigureShell = true;
      return;
    }

    // Optimization: If the requested version matches the current runtime version, copy it!
    const currentRuntimeVersion = normalizeVersion(Bun.version);
    
    if (currentRuntimeVersion === foundVersion && !IS_TEST_MODE) {
        const currentBunPath = process.execPath;
        spinner.info(colors.cyan(`Requested version ${foundVersion} matches current BVM runtime. Copying local files...`));
        await ensureDir(installBinDir);
        
        const destFile = Bun.file(bunExecutablePath);
        const srcFile = Bun.file(currentBunPath);
        await Bun.write(destFile, srcFile);
        await chmod(bunExecutablePath, 0o755);
        
        spinner.succeed(colors.green(`Bun ${foundVersion} installed from local runtime.`));
        installedVersion = foundVersion;
        shouldConfigureShell = true;
    }

    if (!installedVersion) {
        if (IS_TEST_MODE) {
          await ensureDir(installBinDir);
          await writeTestBunBinary(bunExecutablePath, foundVersion);
        } else {
          spinner.update(`Initiating download for Bun ${foundVersion}...`);
          await ensureDir(BVM_CACHE_DIR);
          const filename = `${foundVersion}-${basename(url)}`;
          const cachedArchivePath = join(BVM_CACHE_DIR, filename);
    
          if (await pathExists(cachedArchivePath)) {
            spinner.succeed(colors.green(`Using cached Bun ${foundVersion} archive.`));
          } else {
            spinner.stop();
            console.log(colors.cyan(`Downloading Bun ${foundVersion} to cache...`));
            const response = await fetch(url);
            if (!response.ok) {
              throw new Error(`Failed to download Bun: ${response.statusText} (${response.status})`);
            }
    
            if (!response.body) {
              throw new Error('Download stream is not available.');
            }
    
            const contentLength = response.headers.get('content-length');
            const totalBytes = contentLength ? parseInt(contentLength, 10) : 0;
    
            let progressBar: ProgressBar | null = null;
            if (totalBytes > 0) {
              progressBar = new ProgressBar(totalBytes);
              progressBar.start();
            } else {
              console.log(colors.cyan(`Downloading Bun ${foundVersion} (size unknown)...`));
            }
    
            const writer = Bun.file(cachedArchivePath).writer();
            const reader = response.body.getReader();
            let loaded = 0;
            let lastLoaded = 0;
            let lastTime = Date.now();
    
            let lastRenderTime = 0;
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
                    lastLoaded = loaded;
                    lastTime = now;
                    lastRenderTime = now;
                  } 
                  else if (now - lastRenderTime >= 100) {
                    progressBar.update(loaded);
                    lastRenderTime = now;
                  }
                }
              }
            } finally {
              writer.end();
            }
    
            if (progressBar) {
              progressBar.stop();
            }
          }
    
          spinner.start(`Extracting Bun ${foundVersion}...`);
          await ensureDir(installDir); // We extract to the version root
    
          try {
            await extractArchive(cachedArchivePath, installDir);
          } catch (e: any) {
            throw new Error(`Extraction failed: ${e.message}`);
          }
    
          // Find the actual binary within extracted content
          let foundSourceBunPath = '';
          const possiblePaths = [
            join(installDir, EXECUTABLE_NAME),
            join(installDir, 'bin', EXECUTABLE_NAME),
            join(installDir, `bun-${process.platform}-${process.arch}`, EXECUTABLE_NAME),
            join(installDir, `bun-${process.platform}-${process.arch}`, 'bin', EXECUTABLE_NAME),
          ];

          // Add dynamic subdirectories to search
          const dirEntries = await readDir(installDir);
          for (const entry of dirEntries) {
              if (entry.startsWith('bun-')) {
                  possiblePaths.push(join(installDir, entry, EXECUTABLE_NAME));
                  possiblePaths.push(join(installDir, entry, 'bin', EXECUTABLE_NAME));
              }
          }
    
          for (const p of possiblePaths) {
            if (await pathExists(p)) {
              foundSourceBunPath = p;
              break;
            }
          }
    
          if (!foundSourceBunPath) {
            throw new Error(`Could not find bun executable in ${installDir}`);
          }
    
          // Ensure target bin directory exists
          await ensureDir(installBinDir);

          // Move binary to ~/.bvm/versions/vX.Y.Z/bin/bun
          if (foundSourceBunPath !== bunExecutablePath) {
            await runCommand(['mv', foundSourceBunPath, bunExecutablePath]);
            // Clean up extraction artifacts if they are in a subfolder
            const parentDir = dirname(foundSourceBunPath);
            if (parentDir !== installDir && parentDir !== installBinDir) {
                await removeDir(parentDir);
            }
          }
    
          await chmod(bunExecutablePath, 0o755);
        }
    
        // Note: We DO NOT delete cachedArchivePath here. That's the point of caching.
    
        spinner.succeed(colors.green(`Bun ${foundVersion} installed successfully.`));
    
        // Auto-set as default if this is the first installed version
        const currentlyInstalledVersions = await getInstalledVersions();
        // After install, the newly installed version will be in the list, so if size is 1, it's the first.
        if (currentlyInstalledVersions.length === 1 && currentlyInstalledVersions[0] === foundVersion) {
            console.log(colors.cyan(`This is the first Bun version installed. Setting 'default' alias to ${foundVersion}.`));
            // Use the alias creation logic
            await createAlias('default', foundVersion); 
        }
            installedVersion = foundVersion;
            shouldConfigureShell = true;
    }
      },
      { failMessage: `Failed to install Bun ${versionToInstall}` },
    );
  } catch (error: any) {
    throw new Error(`Failed to install Bun: ${error.message}`);
  }

  if (shouldConfigureShell) {
    await configureShell(false); // Suppress the prompt here
  }

      if (installedVersion) {
      await useBunVersion(installedVersion);
    }
    
    await rehash();
  }
async function writeTestBunBinary(targetPath: string, version: string): Promise<void> {
  const plainVersion = version.replace(/^v/, '');
  const script = `#!/usr/bin/env bash
set -euo pipefail

if [[ $# -gt 0 ]]; then
  if [[ "$1" == "--version" ]]; then
    echo "${plainVersion}"
    exit 0
  fi
fi

echo "Bun ${plainVersion} stub invoked with: $@"
exit 0
`;
  await Bun.write(targetPath, script);
  await chmod(targetPath, 0o755);
}