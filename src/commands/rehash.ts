import { join, dirname, resolve } from 'path';
import { chmod, unlink, symlink, lstat, readlink } from 'fs/promises';
import { BVM_SHIMS_DIR, BVM_VERSIONS_DIR, BVM_DIR, BVM_BIN_DIR, OS_PLATFORM, EXECUTABLE_NAME } from '../constants';
import { ensureDir, pathExists, readDir, getActiveVersion } from '../utils';
import { colors } from '../utils/ui';
import fs from 'fs';

import {
    BVM_BUN_CMD_TEMPLATE,
    BVM_BUNX_CMD_TEMPLATE
} from '../templates/init-scripts';

/**
 * Rehash command: Standardizes the proxy layer and eliminates conflicting native shims.
 */

// Pure Proxy Wrapper: Delegates everything to bvm-shim.js
// This ensures we always have control over the execution environment.
const WRAPPER_CMD = (bin: string, bvmDir: string) => `@echo off
set "BVM_DIR=${bvmDir}"
if exist "%BVM_DIR%\\runtime\\current\\bin\\bun.exe" (
    "%BVM_DIR%\\runtime\\current\\bin\\bun.exe" "%BVM_DIR%\\bin\\bvm-shim.js" "${bin}" %*
) else (
    echo BVM Error: Bun runtime not found.
    exit /b 1
)`;

const WRAPPER_SH = (bin: string) => `#!/bin/bash
export BVM_DIR="${BVM_DIR}"
exec "${join(BVM_BIN_DIR, 'bvm-shim.sh')}" "${bin}" "$@"`;

export async function rehash() {
  await ensureDir(BVM_SHIMS_DIR);
  await ensureDir(BVM_BIN_DIR);
  const isWindows = OS_PLATFORM === 'win32';
  const bvmDirWin = BVM_DIR.replace(/\//g, '\\');

  // 1. Sync Core logic files to private bin
  try {
      const templateDir = join(dirname(dirname(__dirname)), 'src', 'templates');
      if (isWindows) {
          const jsLogic = await Bun.file(join(templateDir, 'win', 'bvm-shim.js')).text();
          await Bun.write(join(BVM_BIN_DIR, 'bvm-shim.js'), jsLogic);
      } else {
          const shLogic = await Bun.file(join(templateDir, 'unix', 'bvm-shim.sh')).text();
          const shimShPath = join(BVM_BIN_DIR, 'bvm-shim.sh');
          await Bun.write(shimShPath, shLogic);
          await chmod(shimShPath, 0o755);
      }
  } catch (e: any) {}

  const executables = new Set<string>(['bun', 'bunx']);

  // 2. Discovery: Find all commands from all installed physical versions
  if (await pathExists(BVM_VERSIONS_DIR)) {
    const versions = await readDir(BVM_VERSIONS_DIR);
    for (const v of versions) {
      if (v.startsWith('.')) continue;
      const binDir = join(BVM_VERSIONS_DIR, v, 'bin');
      if (await pathExists(binDir)) {
          const files = await readDir(binDir);
          for (const f of files) {
              const name = f.replace(/\.(exe|ps1|cmd|bunx)$/i, '');
              if (name && name !== 'bun' && name !== 'bunx') {
                  executables.add(name);
              }
          }
      }
    }
  }

  // 3. Purge Conflict Zone (Windows)
  if (isWindows) {
      // DELETE any .exe or .ps1 in shims directory to force use of our BVM .cmd proxies.
      // Windows prioritizes .exe over .cmd, and Bun's native .exe shims are hardcoded with bugs.
      const existing = fs.readdirSync(BVM_SHIMS_DIR);
      for (const f of existing) {
          if (f.toLowerCase() === 'bun.exe' || f.toLowerCase() === 'bunx.exe') continue;
          if (f.endsWith('.exe') || f.endsWith('.ps1')) {
              try { fs.unlinkSync(join(BVM_SHIMS_DIR, f)); } catch(e) {}
          }
      }
  }

  // 4. Generate Managed Wrappers
  for (const bin of executables) {
    if (isWindows) {
      const target = join(BVM_SHIMS_DIR, `${bin}.cmd`);
      if (bin === 'bun') {
          await Bun.write(target, BVM_BUN_CMD_TEMPLATE.split('__BVM_DIR__').join(bvmDirWin));
      } else if (bin === 'bunx') {
          await Bun.write(target, BVM_BUNX_CMD_TEMPLATE.split('__BVM_DIR__').join(bvmDirWin));
      } else {
          // 3rd party tools (claude, etc.) get our proxy wrapper
          await Bun.write(target, WRAPPER_CMD(bin, bvmDirWin));
      }
    } else {
      const shimPath = join(BVM_SHIMS_DIR, bin);
      await Bun.write(shimPath, WRAPPER_SH(bin));
      await chmod(shimPath, 0o755);
    }
  }
  
  console.log(colors.green(`✓ BVM Execution Hegemony established. Managed ${executables.size} shims.`));
}