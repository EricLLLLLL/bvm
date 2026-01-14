import { join } from 'path';
import { readdir, chmod, unlink, symlink, lstat, readlink } from 'fs/promises';
import { BVM_SHIMS_DIR, BVM_VERSIONS_DIR, BVM_DIR, OS_PLATFORM, EXECUTABLE_NAME } from '../constants';
import { ensureDir, pathExists, readDir } from '../utils';
import { colors } from '../utils/ui';

// The universal shim script template for Bash (Linux/macOS)
const SHIM_TEMPLATE_BASH = `#!/bin/bash
# Shim managed by BVM (Bun Version Manager)
# ... (Bash script content remains same) ...
BVM_DIR="\${BVM_DIR:-$HOME/.bvm}"
COMMAND=$(basename "$0")

# 1. Resolve Version
if [ -n "$BVM_ACTIVE_VERSION" ]; then
    VERSION="$BVM_ACTIVE_VERSION"
else
    # Project Context (.bvmrc)
    CUR_DIR="$PWD"
    while [ "$CUR_DIR" != "/" ]; do
        if [ -f "$CUR_DIR/.bvmrc" ]; then
            VERSION="v$(cat "$CUR_DIR/.bvmrc" | tr -d 'v' | tr -d '[:space:]')"
            break
        fi
        CUR_DIR=$(dirname "$CUR_DIR")
    done
    
    # Global Current Symlink
    if [ -z "$VERSION" ] && [ -L "$BVM_DIR/current" ]; then
        VERSION_PATH=$(readlink "$BVM_DIR/current")
        VERSION_TMP=$(basename "$VERSION_PATH")
        if [ -d "$BVM_DIR/versions/$VERSION_TMP" ]; then
            VERSION="$VERSION_TMP"
        fi
    fi

    # Global Default Alias
    if [ -z "$VERSION" ]; then
        if [ -f "$BVM_DIR/aliases/default" ]; then
            VERSION=$(cat "$BVM_DIR/aliases/default")
        fi
    fi
fi

# 2. Validate
if [ -z "$VERSION" ]; then
    echo "BVM Error: No Bun version is active or default is set." >&2
    exit 1
fi
[[ "$VERSION" != v* ]] && VERSION="v$VERSION"

VERSION_DIR="$BVM_DIR/versions/$VERSION"
if [ ! -d "$VERSION_DIR" ]; then
    echo "BVM Error: Bun version $VERSION is not installed." >&2
    exit 1
fi

REAL_EXECUTABLE="$VERSION_DIR/bin/$COMMAND"

# 3. Execution
if [ -x "$REAL_EXECUTABLE" ]; then
    export BUN_INSTALL="$VERSION_DIR"
    export PATH="$VERSION_DIR/bin:$PATH"
    
    "$REAL_EXECUTABLE" "$@"
    EXIT_CODE=$?
    
    # Smart Hook: Auto-rehash on global installs
    if [[ "$COMMAND" == "bun" ]] && [[ "$*" == *"-g"* ]] && ([[ "$*" == *"install"* ]] || [[ "$*" == *"add"* ]] || [[ "$*" == *"remove"* ]] || [[ "$*" == *"uninstall"* ]]); then
        "$BVM_DIR/bin/bvm" rehash >/dev/null 2>&1
    fi

    exit $EXIT_CODE
else
    echo "BVM Error: Command '$COMMAND' not found in Bun $VERSION." >&2
    exit 127
fi
`;

// JS Shim Logic for Windows (Runs via Bun Runtime)
const SHIM_TEMPLATE_JS = `
const path = require('path');
const { spawn } = require('child_process');
const os = require('os');

const BVM_DIR = process.env.BVM_DIR || path.join(os.homedir(), '.bvm');
// Argv: [bun_exe, shim_js, command_name, ...args]
const CMD = process.argv[2].replace(/\\.exe$/i, '').replace(/\\.cmd$/i, '');
const ARGS = process.argv.slice(3);

async function readFileSafe(filePath) {
    try {
        const file = Bun.file(filePath);
        if (await file.exists()) {
             const text = await file.text();
             return text.trim();
        }
        return null;
    } catch (e) {
        return null;
    }
}

async function resolveVersion() {
  // 1. Env Override
  if (process.env.BVM_ACTIVE_VERSION) return process.env.BVM_ACTIVE_VERSION;

  // 2. .bvmrc (Upward search)
  let dir = process.cwd();
  const root = path.parse(dir).root;
  while (true) {
    const rc = path.join(dir, '.bvmrc');
    // Note: Bun.file(path).exists() is async
    const file = Bun.file(rc);
    if (await file.exists()) {
        const v = await file.text();
        const trimmed = v.trim();
        if (trimmed) return trimmed.startsWith('v') ? trimmed : 'v' + trimmed;
    }
    if (dir === root) break;
    dir = path.dirname(dir);
  }

  // 3. Current Symlink (Junction)
  const current = path.join(BVM_DIR, 'current');
  // Check if it's a valid directory first (resolve junction)
  // Bun doesn't have native readlink/realpath exposed as simply yet for this context, 
  // so we might need to stick to node 'fs' for realpath or use Bun.file().name?
  // Actually, for resolving the junction target to get the version name, 
  // fs.realpathSync is the most reliable way in Node/Bun compatibility.
  // So let's keep 'fs' imported JUST for this specific realpath operation to be safe,
  // or use the assumption that 'current' is a dir.
  
  const fs = require('fs'); 
  if (fs.existsSync(current)) {
    try {
        const target = fs.realpathSync(current); 
        const v = path.basename(target);
        if (v.startsWith('v')) return v;
    } catch(e) {}
  }
  
  // 4. Default Alias
  const def = path.join(BVM_DIR, 'aliases', 'default');
  const defFile = Bun.file(def);
  if (await defFile.exists()) {
      const v = await defFile.text();
      const trimmed = v.trim();
      if (trimmed) return trimmed.startsWith('v') ? trimmed : 'v' + trimmed;
  }

  return '';
}

// Wrap in IIFE for async/await
(async () => {
    const version = await resolveVersion();

    if (!version) {
        console.error("BVM Error: No Bun version is active or default is set.");
        process.exit(1);
    }

    const versionDir = path.join(BVM_DIR, 'versions', version);
    // Use fs.existsSync for directory check is still fast/standard
    const fs = require('fs');
    if (!fs.existsSync(versionDir)) {
        console.error(\`BVM Error: Bun version \${version} is not installed.\`);
        process.exit(1);
    }

    const binDir = path.join(versionDir, 'bin');
    const realExecutable = path.join(binDir, CMD + '.exe');

    if (!fs.existsSync(realExecutable)) {
        console.error(\`BVM Error: Command '\${CMD}' not found in Bun \${version}.\`);
        process.exit(127);
    }

    // Set Environment Variables
    process.env.BUN_INSTALL = versionDir;
    // Prepend to PATH
    process.env.PATH = binDir + path.delimiter + process.env.PATH;

    // Auto-rehash hook
    if (CMD === 'bun' && ARGS.some(a => a === '-g') && ARGS.some(a => ['install', 'add', 'remove', 'uninstall'].includes(a))) {
        // Run rehash in background detached
        try {
            const bvmCmd = path.join(BVM_DIR, 'bin', 'bvm.cmd');
            // Using Bun.spawn is better if available, but require('child_process').spawn is standard here
            spawn(bvmCmd, ['rehash'], { detached: true, stdio: 'ignore' }).unref();
        } catch(e) {}
    }

    const child = spawn(realExecutable, ARGS, { stdio: 'inherit' });
    child.on('exit', (code) => process.exit(code ?? 0));
})();
`;

// Windows CMD Wrapper -> Calls JS Shim
const SHIM_TEMPLATE_CMD = `@echo off
set "BVM_DIR=%USERPROFILE%\\.bvm"
"%BVM_DIR%\\runtime\\current\\bin\\bun.exe" "%BVM_DIR%\\bin\\shim.js" "%~n0" %*
`;

export async function rehash(): Promise<void> {
  await ensureDir(BVM_SHIMS_DIR);

  const isWindows = OS_PLATFORM === 'win32';
  // On Windows, we NO LONGER generate .ps1 shims to avoid ExecutionPolicy issues.
  // We only generate .cmd shims that invoke the JS logic.
  const shimExtension = isWindows ? '.cmd' : ''; 
  const template = isWindows ? SHIM_TEMPLATE_CMD : SHIM_TEMPLATE_BASH;

  // On Windows, write the JS logic to a central file
  if (isWindows) {
      const shimJsPath = join(BVM_DIR, 'bin', 'shim.js');
      await ensureDir(join(BVM_DIR, 'bin'));
      await Bun.write(shimJsPath, SHIM_TEMPLATE_JS);
  }

  const executables = new Set<string>();
  executables.add('bun');
  executables.add('bunx');

  if (await pathExists(BVM_VERSIONS_DIR)) {
    const versions = await readDir(BVM_VERSIONS_DIR);
    for (const version of versions) {
      if (version.startsWith('.')) continue;
      
      const binDir = join(BVM_VERSIONS_DIR, version, 'bin');
      if (await pathExists(binDir)) {
        const bunPath = join(binDir, EXECUTABLE_NAME);
        if (await pathExists(bunPath)) {
          // 1. Create essential aliases (bunx)
          const compatLinks = ['bunx'];
          for (const linkName of compatLinks) {
            const linkPath = join(binDir, linkName);
            if (!(await pathExists(linkPath))) {
              try {
                await symlink(`./${EXECUTABLE_NAME}`, linkPath);
              } catch (e) {}
            }
          }

          // 2. Clean up legacy problematic aliases (yarn, npm, pnpm) if they point to bun
          const legacyLinks = ['yarn', 'npm', 'pnpm'];
          for (const linkName of legacyLinks) {
            const linkPath = join(binDir, linkName);
            try {
              const stats = await lstat(linkPath);
              if (stats.isSymbolicLink()) {
                const target = await readlink(linkPath);
                // If it points to bun executable (either relative or absolute), it's a legacy BVM shim and should be removed
                if (target === `./${EXECUTABLE_NAME}` || target.endsWith(`/${EXECUTABLE_NAME}`) || target === EXECUTABLE_NAME) {
                   await unlink(linkPath);
                }
              }
            } catch (e) {
               // Ignore if file doesn't exist
            }
          }
        }

        const files = await readDir(binDir);
        for (const file of files) {
          executables.add(file.replace(/\.(exe|ps1|cmd)$/i, ''));
        }
      }
    }
  }

  for (const exe of executables) {
    if (isWindows) {
        // Windows: Only .cmd
        const cmdPath = join(BVM_SHIMS_DIR, exe + '.cmd');
        await Bun.write(cmdPath, SHIM_TEMPLATE_CMD);
        await chmod(cmdPath, 0o755);
    } else {
        // Unix: Standard bash shim
        const shimPath = join(BVM_SHIMS_DIR, exe);
        await Bun.write(shimPath, SHIM_TEMPLATE_BASH);
        await chmod(shimPath, 0o755);
    }
  }

  // Cleanup old shims
  const existingShims = await readDir(BVM_SHIMS_DIR);
  for (const shim of existingShims) {
    const shimNameWithoutExt = shim.replace(/\.(ps1|cmd)$/i, '');
    
    // Windows: Remove any .ps1 files (legacy) and ensure only active .cmd exist
    if (isWindows) {
        if (shim.endsWith('.ps1')) {
            await unlink(join(BVM_SHIMS_DIR, shim));
            continue;
        }
        if (shim.endsWith('.cmd') && !executables.has(shimNameWithoutExt)) {
             await unlink(join(BVM_SHIMS_DIR, shim));
        }
    } else {
        // Unix
        if (!executables.has(shimNameWithoutExt)) {
             await unlink(join(BVM_SHIMS_DIR, shim));
        }
    }
  }
}