import { join } from 'path';
import { delimiter } from 'path';
import { homedir } from 'os';
import { access } from 'fs/promises';
import fs from 'fs';
import { BVM_VERSIONS_DIR, EXECUTABLE_NAME, BVM_CURRENT_DIR, BVM_SHIMS_DIR, BVM_RUNTIME_DIR, OS_PLATFORM } from '../constants';
import { ensureDir, pathExists, normalizeVersion, resolveVersion, getInstalledVersions, createSymlink } from '../utils';
import { colors, confirm } from '../utils/ui';
import { getRcVersion } from '../rc';
import { resolveLocalVersion } from './version';
import { withSpinner } from '../command-runner';
import { fixWindowsShims } from '../utils/windows-shim-fixer';
import { rehash } from './rehash';
import { configureShell } from './setup';

/**
 * Switches the active Bun version immediately by updating the `current` symlink.
 * @param targetVersion The version to use (e.g., "1.0.0").
 * @param options Configuration options
 */
export async function useBunVersion(
  targetVersion?: string,
  options: { silent?: boolean; fixPath?: boolean; yes?: boolean } = {}
): Promise<void> {
  let versionToUse = targetVersion;

  if (!versionToUse) {
    versionToUse = await getRcVersion() || undefined;
  }

  if (!versionToUse) {
    if (!options.silent) {
        console.error(colors.red('No version specified. Usage: bvm use <version>'));
    }
    throw new Error('No version specified.');
  }

  const runLogic = async (spinner?: any) => {
    let finalResolvedVersion: string | null = null;

    const resolvedFromLocal = await resolveLocalVersion(versionToUse!);
    if (resolvedFromLocal) {
        finalResolvedVersion = resolvedFromLocal;
    } else {
        const installedVersions = (await getInstalledVersions()).map(v => normalizeVersion(v));
        finalResolvedVersion = resolveVersion(versionToUse!, installedVersions);
    }

    if (!finalResolvedVersion) {
      throw new Error(`Bun version '${versionToUse}' is not installed.`);
    }

    const normalizedFinalResolvedVersion = normalizeVersion(finalResolvedVersion);
    const installPath = join(BVM_VERSIONS_DIR, normalizedFinalResolvedVersion);
    const bunExecutablePath = join(installPath, 'bin', EXECUTABLE_NAME);
    
    // Validate installation
    if (!(await pathExists(bunExecutablePath))) {
        throw new Error(`Version ${normalizedFinalResolvedVersion} is not properly installed (binary missing).`);
    }

    // Ensure shims are valid before linking
    await fixWindowsShims(join(installPath, 'bin'));

    // Update the 'current' directory symlink for immediate global effect
    await createSymlink(installPath, BVM_CURRENT_DIR);

    // Windows: keep runtime/current in sync (bvm.cmd / bun.cmd fastpath depend on it)
    if (OS_PLATFORM === 'win32') {
      const runtimeCurrent = join(BVM_RUNTIME_DIR, 'current');
      const runtimeVersionDir = join(BVM_RUNTIME_DIR, normalizedFinalResolvedVersion);
      const runtimeTarget = (await pathExists(runtimeVersionDir)) ? runtimeVersionDir : installPath;
      await createSymlink(runtimeTarget, runtimeCurrent);
    }

    const needsPathFix = await warnIfShimsNotActive({ silent: options.silent, spinner });
    if (needsPathFix && !options.silent) {
      const shouldFix =
        !!options.fixPath ||
        (!!options.yes ||
          await confirm('是否现在运行 `bvm setup` 自动修复 PATH 优先级（写入你的 shell 配置文件）？'));

      if (shouldFix) {
        if (spinner) spinner.stop();
        await configureShell(true);
        if (spinner) spinner.start();
      }
    }

    if (spinner) {
        spinner.succeed(colors.green(`Now using Bun ${normalizedFinalResolvedVersion} (immediate effect).`));
    }

    // Trigger rehash to update shims for the new version's global commands
    // This ensures version-isolated global packages are properly exposed
    await rehash({ silent: options.silent });
  };

  if (options.silent) {
      await runLogic();
  } else {
      await withSpinner(
        `Switching to Bun ${versionToUse}...`,
        (spinner) => runLogic(spinner),
        { failMessage: () => `Failed to switch to Bun ${versionToUse}` },
      );
  }
}

function normalizePathForCompare(p: string): string {
  return p.replace(/\\/g, '/').replace(/\/+$/g, '');
}

async function resolveExecutableOnPath(executableName: string): Promise<string | null> {
  const pathEntries = (process.env.PATH || '').split(delimiter).filter(Boolean);
  for (const entry of pathEntries) {
    const candidate = join(entry, executableName);
    try {
      await access(candidate, fs.constants.X_OK);
      return candidate;
    } catch (e) {
      // ignore
    }
  }
  return null;
}

async function warnIfShimsNotActive(options: { silent?: boolean; spinner?: any }): Promise<boolean> {
  if (options.silent) return false;
  // Tests/CI should be non-interactive and deterministic.
  if (process.env.BVM_TEST_MODE === 'true' || process.env.CI) return false;

  try {
    const pathEntries = (process.env.PATH || '').split(delimiter).filter(Boolean);
    const normalizedEntries = pathEntries.map(normalizePathForCompare);
    const shimsIndex = normalizedEntries.indexOf(normalizePathForCompare(BVM_SHIMS_DIR));

    const resolvedBun = await resolveExecutableOnPath('bun');
    const expectedBunShim = join(BVM_SHIMS_DIR, 'bun');

    const home = process.env.HOME || homedir();
    const bunUserBin = home ? join(home, '.bun', 'bin') : '';
    const bunUserBinIndex = bunUserBin ? normalizedEntries.indexOf(normalizePathForCompare(bunUserBin)) : -1;

    const shimsMissing = shimsIndex === -1;
    const bunNotFromShim = !!resolvedBun && normalizePathForCompare(resolvedBun) !== normalizePathForCompare(expectedBunShim);
    const bunUserBinBeforeShims = bunUserBinIndex !== -1 && shimsIndex !== -1 && bunUserBinIndex < shimsIndex;

    if (!shimsMissing && !bunNotFromShim && !bunUserBinBeforeShims) return false;

    if (options.spinner) options.spinner.stop();

    console.log(colors.yellow('\n⚠️  检测到 bvm 的 shims 未生效（或优先级不够）。'));
    if (resolvedBun) {
      console.log(colors.yellow(`   当前 shell 命中的 bun: ${colors.cyan(resolvedBun)}`));
      console.log(colors.gray(`   期望命中的 bun shim:   ${colors.cyan(expectedBunShim)}`));
    }
    console.log(colors.yellow('   这会导致 `bun add -g`/`bun i -g` 写入 ~/.bun，从而在切换版本后仍能看到 pm2/cowsay 等全局命令。'));
    console.log(colors.gray('   修复方式：运行一次 `bvm setup` 并重启终端/重新加载 shell 配置。'));
    console.log(colors.gray(`   例如（zsh）：source ~/.zshrc && hash -r`));
    console.log(colors.gray(`   验证：which bun 需要指向 ${expectedBunShim}`));

    if (options.spinner) options.spinner.start();
    return true;
  } catch (e) {
    // non-fatal: do not block use
  }
  return false;
}
