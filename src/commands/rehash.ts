import { join } from 'path';
import { readdir, chmod, unlink } from 'fs/promises';
import { BVM_SHIMS_DIR, BVM_VERSIONS_DIR, BVM_DIR, OS_PLATFORM, EXECUTABLE_NAME } from '../constants';
import { ensureDir, pathExists, readDir } from '../utils';
import { colors } from '../utils/ui';

// The universal shim script template for Bash (Linux/macOS)
const SHIM_TEMPLATE_BASH = `#!/bin/bash
# Shim managed by BVM (Bun Version Manager)
# This script dynamically routes commands to the correct Bun version.

BVM_DIR="\${BVM_DIR:-$HOME/.bvm}"
COMMAND=$(basename "$0") # e.g., "bun", "yarn", "pm2"

# 1. Determine Bun version based on priority:
#    a) BVM_ACTIVE_VERSION (session override)
#    b) .bvmrc (project specific)
#    c) Global default
if [ -n "$BVM_ACTIVE_VERSION" ]; then
    VERSION="$BVM_ACTIVE_VERSION"
elif [ -f ".bvmrc" ]; then
    VERSION="v$(cat .bvmrc | tr -d 'v')"
elif [ -f "$(git rev-parse --show-toplevel 2>/dev/null)/.bvmrc" ]; then # Recursive .bvmrc check
    VERSION="v$(cat "$(git rev-parse --show-toplevel)/.bvmrc" | tr -d 'v')"
else
    # Fallback to default, if not found, let it error below
    VERSION=$(cat "$BVM_DIR/aliases/default" 2>/dev/null)
fi

# 2. Validate and locate the version
if [ -z "$VERSION" ]; then
    echo "BVM Error: No Bun version is active or default is set." >&2
    exit 1
fi
[[ "$VERSION" != v* ]] && VERSION="v$VERSION" # Ensure 'v' prefix

VERSION_DIR="$BVM_DIR/versions/$VERSION"

if [ ! -d "$VERSION_DIR" ]; then
    echo "BVM Error: Bun version $VERSION is not installed." >&2
    exit 1
fi

REAL_EXECUTABLE="$VERSION_DIR/bin/$COMMAND"

# 3. Execution with environment injection
if [ -x "$REAL_EXECUTABLE" ]; then
    export BUN_INSTALL="$VERSION_DIR" # Tell Bun where its root is for global installs
    export PATH="$VERSION_DIR/bin:$PATH" # Prioritize this version's bin for sub-commands
    
    # Smart Hook: If this is 'bun' and it's a global install command, rehash in background
    if [[ "$COMMAND" == "bun" ]] && [[ "$*" == *"-g"* ]] && ([[ "$*" == *"install"* ]] || [[ "$*" == *"add"* ]] || [[ "$*" == *"remove"* ]] || [[ "$*" == *"uninstall"* ]]); then
        "$BVM_DIR/bin/bvm" rehash >/dev/null 2>&1 &
    fi
    
    exec "$REAL_EXECUTABLE" "$@"
else
    # If the specific command doesn't exist in this version,
    # the 'exec' above would fail. This part only runs if exec fails.
    # So it means this shim points to a non-existent command in the current version.
    echo "BVM Error: Command '$COMMAND' not found in Bun $VERSION." >&2
    exit 127
fi
`;

// The universal shim script template for PowerShell (Windows)
const SHIM_TEMPLATE_POWERSHELL = `# Shim managed by BVM (Bun Version Manager)
# This script dynamically routes commands to the correct Bun version.

$BvmDir = "$HOME\.bvm"
$Command = $MyInvocation.MyCommand.Name # e.g., "bun.ps1", "yarn.ps1"

# Remove .ps1 extension for command name
if ($Command -like "*.ps1") { $Command = $Command.Substring(0, $Command.Length - 4) }


# 1. Determine Bun version based on priority:
#    a) BVM_ACTIVE_VERSION (session override)
#    b) .bvmrc (project specific)
#    c) Global default
$Version = $null
if ($env:BVM_ACTIVE_VERSION) {
    $Version = $env:BVM_ACTIVE_VERSION
} elseif (Test-Path ".\.bvmrc") {
    $Version = "v" + (Get-Content ".\.bvmrc" | Select-Object -First 1)
} else {
    # Fallback to default, if not found, let it error below
    $DefaultPath = Join-Path $BvmDir "aliases\default"
    if (Test-Path $DefaultPath) {
        $Version = Get-Content $DefaultPath | Select-Object -First 1
    }
}

# 2. Validate and locate the version
if (-not $Version) {
    Write-Error "BVM Error: No Bun version is active or default is set."
    exit 1
}
if ($Version -notmatch "^v") { $Version = "v" + $Version } # Ensure 'v' prefix

$VersionDir = Join-Path $BvmDir "versions\$Version"

if (-not (Test-Path $VersionDir)) {
    Write-Error "BVM Error: Bun version $Version is not installed."
    exit 1
}

$RealExecutable = Join-Path $VersionDir "bin\$Command.exe" # PowerShell prefers .exe for binaries

# 3. Execution with environment injection
if (Test-Path $RealExecutable) {
    $env:BUN_INSTALL = $VersionDir
    $env:PATH = "$(Join-Path $VersionDir 'bin');$env:PATH" # Prioritize this version's bin for sub-commands
    
    # Smart Hook: If this is 'bun' and it's a global install command, rehash in background
    # Note: PowerShell needs `&` to run a command in background, might not be truly detached.
    # Or needs Start-Job / Start-Process. Let's make it Start-Process -NoNewWindow for now.
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

  // 1. Scan all installed versions for executables
  const executables = new Set<string>();
  executables.add('bun');
  executables.add('bunx'); // bunx is usually a symlink to bun, but let's make a shim for it

  if (await pathExists(BVM_VERSIONS_DIR)) {
    const versions = await readDir(BVM_VERSIONS_DIR);
    for (const version of versions) {
      const binDir = join(BVM_VERSIONS_DIR, version, 'bin');
      if (await pathExists(binDir)) {
        const files = await readDir(binDir);
        for (const file of files) {
          // Add only executable files (ignore .ps1 or .cmd extension for command name)
          executables.add(file.replace(/\.(exe|ps1|cmd)$/i, ''));
        }
      }
    }
  }

  // 2. Generate shims for each executable
  for (const exe of executables) {
    const shimPath = join(BVM_SHIMS_DIR, exe + shimExtension);
    await Bun.write(shimPath, template);
    await chmod(shimPath, 0o755); // Make it executable
  }

  // 3. Cleanup stale shims
  const existingShims = await readDir(BVM_SHIMS_DIR);
  for (const shim of existingShims) {
    const shimNameWithoutExt = shim.replace(/\.(ps1|cmd)$/i, '');
    if (!executables.has(shimNameWithoutExt)) {
      await unlink(join(BVM_SHIMS_DIR, shim));
    }
  }
}