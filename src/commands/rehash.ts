import { join, dirname } from 'path';
import { chmod, unlink, symlink, lstat, readlink } from 'fs/promises';
import { BVM_SHIMS_DIR, BVM_VERSIONS_DIR, BVM_DIR, BVM_BIN_DIR, OS_PLATFORM, EXECUTABLE_NAME } from '../constants';
import { ensureDir, pathExists, readDir } from '../utils';
import { colors } from '../utils/ui';

import { 
    BVM_BUN_CMD_TEMPLATE,
    BVM_BUNX_CMD_TEMPLATE
} from '../templates/init-scripts';

/**
 * Rehash command: regenerates all shims based on installed Bun versions.
 */

// Use lightweight wrappers that point to shared logic
const WRAPPER_CMD = (bin: string, bvmDir: string) => `@echo off
set "BVM_DIR=${bvmDir}"
if exist "%BVM_DIR%\\runtime\\current\\bin\\bun.exe" (
    "%BVM_DIR%\\runtime\\current\\bin\\bun.exe" "%BVM_DIR%\\bin\\bvm-shim.js" "${bin}" %*
) else (
    echo BVM Error: Bun runtime not found at "%BVM_DIR%\\runtime\\current\\bin\\bun.exe"
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

  // 1. Sync shared logic files from templates to bin directory
  // Note: During local development, they are in src/templates.
  // We'll read them from the stable template files we created.
  try {
      const templateDir = join(dirname(dirname(__dirname)), 'src', 'templates');
      
      if (isWindows) {
          const jsLogic = await Bun.file(join(templateDir, 'bvm-shim.js')).text();
          await Bun.write(join(BVM_BIN_DIR, 'bvm-shim.js'), jsLogic);
      } else {
          const shLogic = await Bun.file(join(templateDir, 'bvm-shim.sh')).text();
          const shimShPath = join(BVM_BIN_DIR, 'bvm-shim.sh');
          await Bun.write(shimShPath, shLogic);
          await chmod(shimShPath, 0o755);
      }
  } catch (e: any) {
      // If reading from src fails (e.g. running from bundled dist), 
      // we could fallback to bundled resources or embedded strings if necessary.
      // For now, during this refactor phase, we assume src exists.
  }

  // 2. Discover all binaries and fix global shims (Windows)
  const executables = new Set<string>(['bun', 'bunx']);
  if (await pathExists(BVM_VERSIONS_DIR)) {
    const versions = await readDir(BVM_VERSIONS_DIR);
    for (const v of versions) {
      if (v.startsWith('.')) continue;
      const versionDir = join(BVM_VERSIONS_DIR, v);
      const binDir = join(versionDir, 'bin');
      if (await pathExists(binDir)) {
        const files = await readDir(binDir);
        for (const f of files) {
          const name = f.replace(/\.(exe|ps1|cmd)$/i, '');
          if (name) executables.add(name);

          // Fix global shims and create compatibility junctions (Windows)
          if (isWindows) {
              const versionDirAbs = versionDir.replace(/\//g, '\\');
              const globalNM = join(versionDirAbs, 'install', 'global', 'node_modules');
              const compatNM = join(versionDirAbs, 'node_modules');

              // Create compatibility junction: root/node_modules -> root/install/global/node_modules
              // This satisfies Bun's generated shims which look for ..\node_modules
              if (await pathExists(globalNM) && !(await pathExists(compatNM))) {
                  try {
                      await createSymlink(globalNM, compatNM);
                  } catch (e) {}
              }

              if (f.endsWith('.cmd') || f.endsWith('.ps1')) {
                  try {
                      const filePath = join(binDir, f);
                      const content = await Bun.file(filePath).text();
                      
                      // We still do one-time absolute path fixing for maximum reliability, 
                      // but now it's backed by the physical junction.
                      let newContent = content;
                      if (f.endsWith('.cmd')) {
                          newContent = content.replace(/%~dp0([/\\]\.\.)+/gi, () => versionDirAbs);
                      } else {
                          newContent = content.replace(/"?\$PSScriptRoot([/\\]\.\.)+"?/gi, () => `'${versionDirAbs}'`);
                      }

                      if (newContent !== content) {
                          await Bun.write(filePath, newContent);
                      }
                  } catch (e) {}
              }
          }
        }
      }
    }
  }

  // 3. Generate Wrappers
  for (const bin of executables) {
    if (isWindows) {
      if (bin === 'bun') {
          await Bun.write(join(BVM_SHIMS_DIR, 'bun.cmd'), BVM_BUN_CMD_TEMPLATE.split('__BVM_DIR__').join(bvmDirWin));
      } else if (bin === 'bunx') {
          await Bun.write(join(BVM_SHIMS_DIR, 'bunx.cmd'), BVM_BUNX_CMD_TEMPLATE.split('__BVM_DIR__').join(bvmDirWin));
      } else {
          await Bun.write(join(BVM_SHIMS_DIR, `${bin}.cmd`), WRAPPER_CMD(bin, bvmDirWin));
      }
      const ps1 = join(BVM_SHIMS_DIR, `${bin}.ps1`);
      if (await pathExists(ps1)) await unlink(ps1);
    } else {
      const shimPath = join(BVM_SHIMS_DIR, bin);
      await Bun.write(shimPath, WRAPPER_SH(bin));
      await chmod(shimPath, 0o755);
    }
  }
  console.log(colors.green(`✓ Regenerated ${executables.size} shims in ${BVM_SHIMS_DIR}`));
}