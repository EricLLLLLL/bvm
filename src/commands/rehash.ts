import { join, dirname } from 'path';
import { chmod, unlink, lstat, rm } from 'fs/promises';
import { BVM_SHIMS_DIR, BVM_VERSIONS_DIR, BVM_DIR, BVM_BIN_DIR, OS_PLATFORM } from '../constants';
import { ensureDir, pathExists, readDir, readTextFile, getActiveVersion } from '../utils';
import { colors } from '../utils/ui';

import {
    BVM_BUN_CMD_TEMPLATE,
    BVM_BUNX_CMD_TEMPLATE
} from '../templates/init-scripts';
import { fixWindowsShims } from '../utils/windows-shim-fixer';

/**
 * Rehash command: Standardizes the proxy layer.
 */

/**
 * Generate Windows shim that delegates to bvm-shim.js for proper version resolution
 * This ensures correct environment setup including BUN_CONFIG_FILE
 */
function generateWindowsShim(cmdName: string, bvmDirWin: string): string {
    // Delegate to bvm-shim.js for proper version resolution and environment setup
    return `@echo off
:: BVM Shim for ${cmdName} - delegates to bvm-shim.js
set "BVM_DIR=${bvmDirWin}"
if defined BVM_DIR_OVERRIDE set "BVM_DIR=%BVM_DIR_OVERRIDE%"

"%BVM_DIR%\\runtime\\current\\bin\\bun.exe" "%BVM_DIR%\\bin\\bvm-shim.js" "${cmdName}" %*`;
}

export async function writeTextIfChanged(path: string, content: string): Promise<boolean> {
  if (await pathExists(path) && await readTextFile(path) === content) return false;
  await Bun.write(path, content);
  return true;
}

export async function rehash(options: { silent?: boolean } = {}) {
  await ensureDir(BVM_SHIMS_DIR);
  await ensureDir(BVM_BIN_DIR);
  const isWindows = OS_PLATFORM === 'win32';
  const bvmDirWin = BVM_DIR.replace(/\//g, '\\');

  // 1. Sync core logic
  try {
      const templateDir = join(dirname(dirname(__dirname)), 'src', 'templates');
      if (isWindows) {
          const jsLogic = await Bun.file(join(templateDir, 'win', 'bvm-shim.js')).text();
          await writeTextIfChanged(join(BVM_BIN_DIR, 'bvm-shim.js'), jsLogic);
      } else {
          const shLogic = await Bun.file(join(templateDir, 'unix', 'bvm-shim.sh')).text();
          const shimShPath = join(BVM_BIN_DIR, 'bvm-shim.sh');
          if (await writeTextIfChanged(shimShPath, shLogic)) await chmod(shimShPath, 0o755);
      }
  } catch (e: any) {}

  const executables = new Set<string>(['bun', 'bunx']);

  // 2. Scan only the current version to expose global commands.
  const activeResult = await getActiveVersion();
  const currentVersion = activeResult?.version;

  if (await pathExists(BVM_VERSIONS_DIR)) {
    // Only scan current version's bin dir for version isolation
    if (currentVersion) {
      const binDir = join(BVM_VERSIONS_DIR, currentVersion, 'bin');
      if (await pathExists(binDir)) {
          // Fix broken Windows shims (relative path drift)
          await fixWindowsShims(binDir);

          const files = await readDir(binDir);
          for (const f of files) {
              const name = f.replace(/\.(exe|ps1|cmd|bunx)$/i, '');
              if (name && name !== 'bun' && name !== 'bunx') executables.add(name);
          }
      }
    }
  }

  // 2.5. Prune stale shims (version isolation)
  // If we switched to a version that doesn't have some global command,
  // old shims must be removed so they don't "leak" across versions.
  await pruneStaleShims(executables);

  // 3. Generate Proxies in central shims directory
  for (const bin of executables) {
    if (isWindows) {
      const target = join(BVM_SHIMS_DIR, `${bin}.cmd`);
      if (bin === 'bun') {
          await writeTextIfChanged(target, BVM_BUN_CMD_TEMPLATE.split('__BVM_DIR__').join(bvmDirWin));
      } else if (bin === 'bunx') {
          await writeTextIfChanged(target, BVM_BUNX_CMD_TEMPLATE.split('__BVM_DIR__').join(bvmDirWin));
      } else {
          await writeTextIfChanged(target, generateWindowsShim(bin, bvmDirWin));
      }

      // Cleanup conflicting shims
      const ps1 = join(BVM_SHIMS_DIR, `${bin}.ps1`);
      if (await pathExists(ps1)) await unlink(ps1);
      const exe = join(BVM_SHIMS_DIR, `${bin}.exe`);
      if (bin !== 'bun' && bin !== 'bunx' && await pathExists(exe)) await unlink(exe);
	    } else {
	      const shimPath = join(BVM_SHIMS_DIR, bin);
	      // Use bvm-shim.sh for proper version resolution and environment setup
	      const wrapperSh = `#!/bin/bash
# BVM shim for ${bin} - delegates to bvm-shim.sh for proper version resolution
export BVM_DIR="${BVM_DIR}"
exec "$BVM_DIR/bin/bvm-shim.sh" "${bin}" "$@"
`;
      if (await writeTextIfChanged(shimPath, wrapperSh)) await chmod(shimPath, 0o755);
    }
  }

  if (!options.silent) {
    console.log(colors.green(`✓ Managed ${executables.size} command proxies.`));
  }
}

async function pruneStaleShims(expectedExecutables: Set<string>): Promise<void> {
  try {
    if (!(await pathExists(BVM_SHIMS_DIR))) return;

    const files = await readDir(BVM_SHIMS_DIR);
    for (const fileName of files) {
      // Always keep bun/bunx shims managed by setup.ts
      if (fileName === 'bun' || fileName === 'bunx' || fileName === 'bun.cmd' || fileName === 'bunx.cmd') {
        continue;
      }

      // Normalize Windows shim naming to a logical command name
      const logicalName = fileName.replace(/\.(cmd|ps1|exe)$/i, '');
      if (expectedExecutables.has(logicalName)) continue;

      const fullPath = join(BVM_SHIMS_DIR, fileName);
      try {
        const st = await lstat(fullPath);
        if (st.isDirectory()) continue;
        try {
          await unlink(fullPath);
        } catch {
          // Windows can mark files as read-only; best-effort remove.
          try { await chmod(fullPath, 0o666); } catch {}
          try { await unlink(fullPath); } catch {}
          try { await rm(fullPath, { force: true }); } catch {}
        }
      } catch {
        // ignore individual failures
      }
    }
  } catch {
    // non-fatal: pruning is best-effort
  }
}
