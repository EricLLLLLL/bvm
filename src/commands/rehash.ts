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
import { fixWindowsShims } from '../utils/windows-shim-fixer';

/**
 * Rehash command: Standardizes the proxy layer.
 */

const WRAPPER_CMD = (bin: string, bvmDir: string) => `@echo off
set "BVM_DIR=${bvmDir}"
if exist "%BVM_DIR%\\runtime\\current\\bin\\bun.exe" (
    "%BVM_DIR%\\runtime\\current\\bin\\bun.exe" "%BVM_DIR%\\bin\\bvm-shim.js" "${bin}" %*
) else (
    echo BVM Error: Bun runtime not found.
    exit /b 1
)`;

export async function rehash() {
  await ensureDir(BVM_SHIMS_DIR);
  await ensureDir(BVM_BIN_DIR);
  const isWindows = OS_PLATFORM === 'win32';
  const bvmDirWin = BVM_DIR.replace(/\//g, '\\');

  // 1. Sync core logic
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

  // 2. Scan ALL versions to expose global commands
  if (await pathExists(BVM_VERSIONS_DIR)) {
    const versions = await readDir(BVM_VERSIONS_DIR);
    for (const v of versions) {
      if (v.startsWith('.')) continue;
      const binDir = join(BVM_VERSIONS_DIR, v, 'bin');
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

  // 3. Generate Proxies in central shims directory
  for (const bin of executables) {
    if (isWindows) {
      const target = join(BVM_SHIMS_DIR, `${bin}.cmd`);
      if (bin === 'bun') {
          await Bun.write(target, BVM_BUN_CMD_TEMPLATE.split('__BVM_DIR__').join(bvmDirWin));
      } else if (bin === 'bunx') {
          await Bun.write(target, BVM_BUNX_CMD_TEMPLATE.split('__BVM_DIR__').join(bvmDirWin));
      } else {
          await Bun.write(target, WRAPPER_CMD(bin, bvmDirWin));
      }
      
      // Cleanup conflicting shims
      const ps1 = join(BVM_SHIMS_DIR, `${bin}.ps1`);
      if (await pathExists(ps1)) await unlink(ps1);
      const exe = join(BVM_SHIMS_DIR, `${bin}.exe`);
      if (bin !== 'bun' && bin !== 'bunx' && await pathExists(exe)) await unlink(exe);
    } else {
      const shimPath = join(BVM_SHIMS_DIR, bin);
      const wrapperSh = `#!/bin/bash\nexport BVM_DIR="${BVM_DIR}"\nexec "${join(BVM_BIN_DIR, 'bvm-shim.sh')}" "${bin}" "$@"`;
      await Bun.write(shimPath, wrapperSh);
      await chmod(shimPath, 0o755);
    }
  }
  
  console.log(colors.green(`✓ Managed ${executables.size} command proxies.`));
}
