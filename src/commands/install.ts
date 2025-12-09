import { join, basename } from 'path';
import { BVM_VERSIONS_DIR, BVM_BIN_DIR, BVM_CACHE_DIR } from '../constants';
import { ensureDir, pathExists, createSymlink, removeDir } from '../utils';
import { findBunDownloadUrl } from '../api';
import ora from 'ora';
import chalk from 'chalk';
import { chmod } from 'fs/promises';
import { createWriteStream } from 'fs';
import cliProgress from 'cli-progress';
import { configureShell } from './setup';
import { getRcVersion } from '../rc';

/**
 * Installs a specific Bun version.
 * @param targetVersion The version to install (e.g., "1.0.0", "latest"). Optional if .bvmrc exists.
 */
export async function installBunVersion(targetVersion?: string): Promise<void> {
  let versionToInstall = targetVersion;

  if (!versionToInstall) {
    versionToInstall = await getRcVersion() || undefined;
    if (versionToInstall) {
        console.log(chalk.blue(`Found '.bvmrc' with version <${versionToInstall}>`));
    }
  }

  if (!versionToInstall) {
    console.error(chalk.red('No version specified and no .bvmrc found. Usage: bvm install <version>'));
    return;
  }

  const spinner = ora(`Finding Bun ${versionToInstall} release...`).start();
  try {
    // 1. Find download URL
    const result = await findBunDownloadUrl(versionToInstall);
    if (!result) {
      spinner.fail(chalk.red(`Could not find a Bun release for ${versionToInstall} compatible with your system.`));
      process.exit(1);
    }
    const { url, foundVersion } = result;
    const installDir = join(BVM_VERSIONS_DIR, foundVersion);
    const bunExecutablePath = join(installDir, 'bun');

    if (await pathExists(bunExecutablePath)) {
      spinner.info(chalk.blue(`Bun ${foundVersion} is already installed.`));
      await configureShell();
      return;
    }

    spinner.text = `Initiating download for Bun ${foundVersion}...`;
    
    // Prepare Cache
    await ensureDir(BVM_CACHE_DIR);
    // Fix: Prefix filename with version to avoid cache collisions since Bun asset names are identical (bun-darwin-aarch64.zip) across versions
    const filename = `${foundVersion}-${basename(url)}`;
    const cachedArchivePath = join(BVM_CACHE_DIR, filename);
    let downloaded = false;

    // Check Cache
    if (await pathExists(cachedArchivePath)) {
        spinner.succeed(chalk.green(`Using cached Bun ${foundVersion} archive.`));
        downloaded = true;
    } else {
        spinner.stop(); // Stop spinner to show progress bar

        // 2. Download to Cache
        console.log(chalk.cyan(`Downloading Bun ${foundVersion} to cache...`));
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to download Bun: ${response.statusText} (${response.status})`);
        }

        const contentLength = response.headers.get('content-length');
        const totalBytes = contentLength ? parseInt(contentLength, 10) : 0;
        
        let progressBar: cliProgress.SingleBar | null = null;
        if (totalBytes > 0) {
            progressBar = new cliProgress.SingleBar({
                format: ` {bar} | ${chalk.green('{percentage}%')} | {value}/{total} Bytes | ETA: {eta}s | Speed: {speed} kbit`,
                barCompleteChar: '\u2588',
                barIncompleteChar: '\u2591',
                hideCursor: true
            }, cliProgress.Presets.shades_classic);
            progressBar.start(totalBytes, 0, { speed: "N/A" });
        } else {
            console.log(chalk.cyan(`Downloading Bun ${foundVersion} (size unknown)...`));
        }

        const fileWriter = createWriteStream(cachedArchivePath);
        
        if (response.body) {
            const reader = response.body.getReader();
            let loaded = 0;
            let lastLoaded = 0;
            let lastTime = Date.now();
            
            const pump = async () => {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    fileWriter.write(value);
                    loaded += value.length;
                    if (progressBar) {
                        const now = Date.now();
                        const diffTime = now - lastTime;
                        if (diffTime >= 500) {
                             const speed = (loaded - lastLoaded) / diffTime * 1000 / 1024 * 8; // kbps
                             progressBar.update(loaded, { speed: speed.toFixed(2) });
                             lastLoaded = loaded;
                             lastTime = now;
                        } else {
                             progressBar.update(loaded);
                        }
                    }
                }
                fileWriter.end();
            };
            await pump();
        }

        if (progressBar) {
            progressBar.stop();
            console.log('');
        }
    }

    spinner.start(`Extracting Bun ${foundVersion}...`);
    await ensureDir(installDir);

    // 3. Extract from Cache
    if (cachedArchivePath.endsWith('.zip')) {
      const extractZip = await import('extract-zip');
      const extract = extractZip.default || extractZip;
      // @ts-ignore
      await extract(cachedArchivePath, { dir: installDir });
    } else if (cachedArchivePath.endsWith('.tar.gz')) {
      const process = Bun.spawnSync(['tar', '-xzf', cachedArchivePath, '-C', installDir]);
      if (process.exitCode !== 0) {
        throw new Error(`Failed to extract tar.gz: ${process.stderr.toString()}`);
      }
    } else {
      throw new Error('Unsupported archive format.');
    }

    // 4. Locate and move executable
    let finalBunPath = '';
    const possibleBunPaths = [
      join(installDir, 'bun'),
      join(installDir, 'bun-darwin-x64', 'bun'),
      join(installDir, 'bun-darwin-aarch64', 'bun'),
      join(installDir, 'bun-linux-x64', 'bun'),
      join(installDir, 'bun-linux-aarch64', 'bun'),
      join(installDir, 'bun', 'bun'),
    ];
    
    const dirEntries = await Bun.$`ls ${installDir}`.text();
    const subDirs = dirEntries.split('\n').filter(s => s.trim().length > 0 && s.startsWith('bun-'));
    for (const subDir of subDirs) {
        possibleBunPaths.push(join(installDir, subDir, 'bun'));
        possibleBunPaths.push(join(installDir, subDir, 'bin', 'bun'));
    }

    for (const p of possibleBunPaths) {
      if (await pathExists(p)) {
        finalBunPath = p;
        break;
      }
    }

    if (!finalBunPath) {
      throw new Error(`Could not find bun executable in ${installDir}`);
    }

    if (finalBunPath !== bunExecutablePath) {
      await Bun.$`mv ${finalBunPath} ${bunExecutablePath}`;
      const parentDir = join(finalBunPath, '..');
      if (parentDir !== installDir && parentDir.startsWith(installDir)) {
           await removeDir(parentDir); 
      }
    }

    // 5. Permissions & Symlink
    await chmod(bunExecutablePath, 0o755);

    // Note: We DO NOT delete cachedArchivePath here. That's the point of caching.

    spinner.succeed(chalk.green(`Bun ${foundVersion} installed successfully.`));

    spinner.text = `Activating Bun ${foundVersion}...`;
    await ensureDir(BVM_BIN_DIR);
    await createSymlink(bunExecutablePath, join(BVM_BIN_DIR, 'bun'));
    spinner.succeed(chalk.green(`Bun ${foundVersion} is now active.`));
    
    await configureShell();

  } catch (error: any) {
    if (spinner.isSpinning) spinner.stop();
    console.error(chalk.red(`\nFailed to install Bun: ${error.message}`));
    process.exit(1);
  }
}
