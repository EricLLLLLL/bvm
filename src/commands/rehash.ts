import { join } from 'path';
import { readdir, chmod, unlink, symlink, lstat, readlink } from 'fs/promises';
import { BVM_SHIMS_DIR, BVM_VERSIONS_DIR, BVM_DIR, OS_PLATFORM, EXECUTABLE_NAME } from '../constants';
import { ensureDir, pathExists, readDir } from '../utils';
import { colors } from '../utils/ui';

// The universal shim script template for Bash (Linux/macOS)
const SHIM_TEMPLATE_BASH = `#!/bin/bash
# Shim managed by BVM (Bun Version Manager)
# This script dynamically routes commands to the correct Bun version.

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

// The universal shim script template for PowerShell (Windows)
const SHIM_TEMPLATE_POWERSHELL = `# Shim managed by BVM (Bun Version Manager)
# This script dynamically routes commands to the correct Bun version.

$BvmDir = "$HOME\.bvm"
$Command = $MyInvocation.MyCommand.Name

if ($Command -like "*.ps1") { $Command = $Command.Substring(0, $Command.Length - 4) }

$Version = $null
if ($env:BVM_ACTIVE_VERSION) {
    $Version = $env:BVM_ACTIVE_VERSION
} else {
    $CurDir = (Get-Location).Path
    while ($CurDir) {
        $RcPath = Join-Path $CurDir ".bvmrc"
        if (Test-Path $RcPath) {
            $Version = "v" + (Get-Content $RcPath | Select-Object -First 1).Trim()
            break
        }
        $Parent = Split-Path $CurDir -Parent
        if ($Parent -eq $CurDir) { break }
        $CurDir = $Parent
    }

    if (-not $Version) {
        $CurrentPath = Join-Path $BvmDir "current"
    if (Test-Path $CurrentPath) {
        $Target = (Get-Item $CurrentPath).Target
        if ($Target) {
            $VersionTmp = [System.IO.Path]::GetFileName($Target)
            if (Test-Path (Join-Path $BvmDir "versions\$VersionTmp")) {
                $Version = $VersionTmp
            }
        }
    }

    if (-not $Version) {
        $DefaultPath = Join-Path $BvmDir "aliases\default"
        if (Test-Path $DefaultPath) {
            $Version = Get-Content $DefaultPath | Select-Object -First 1
        }
    }
}

if (-not $Version) {
    Write-Error "BVM Error: No Bun version is active or default is set."
    exit 1
}
if ($Version -notmatch "^v") { $Version = "v" + $Version }

$VersionDir = Join-Path $BvmDir "versions\$Version"
if (-not (Test-Path $VersionDir)) {
    Write-Error "BVM Error: Bun version $Version is not installed."
    exit 1
}

$RealExecutable = Join-Path $VersionDir "bin\$Command.exe"

if (Test-Path $RealExecutable) {
    $env:BUN_INSTALL = $VersionDir
    $env:PATH = "$(Join-Path $VersionDir 'bin');$env:PATH"
    
    if (($Command -eq "bun") -and ($args -match "-g") -and (($args -match "install") -or ($args -match "add") -or ($args -match "remove") -or ($args -match "uninstall"))) {
        Start-Process -FilePath "$BvmDir\bin\bvm.cmd" -ArgumentList "rehash" -NoNewWindow
    }
    
    & $RealExecutable $args
} else {
    Write-Error "BVM Error: Command '$Command' not found in Bun $Version."
    exit 127
}
`;

export async function rehash(): Promise<void> {
  await ensureDir(BVM_SHIMS_DIR);

  const isWindows = OS_PLATFORM === 'win32';
  const shimExtension = isWindows ? '.ps1' : '';
  const template = isWindows ? SHIM_TEMPLATE_POWERSHELL : SHIM_TEMPLATE_BASH;

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
    const shimPath = join(BVM_SHIMS_DIR, exe + shimExtension);
    await Bun.write(shimPath, template);
    await chmod(shimPath, 0o755);
  }

  const existingShims = await readDir(BVM_SHIMS_DIR);
  for (const shim of existingShims) {
    const shimNameWithoutExt = shim.replace(/\.(ps1|cmd)$/i, '');
    if (!executables.has(shimNameWithoutExt)) {
      await unlink(join(BVM_SHIMS_DIR, shim));
    }
  }
}