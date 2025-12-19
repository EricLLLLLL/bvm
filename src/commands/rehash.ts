import { join } from 'path';
import { readdir, chmod, unlink } from 'fs/promises';
import { BVM_SHIMS_DIR, BVM_VERSIONS_DIR, BVM_DIR } from '../constants';
import { ensureDir, pathExists, readDir } from '../utils';
import { colors } from '../utils/ui';

// The universal shim script template
// It dynamically determines the command name based on the filename ($0)
// This ensures we don't need to generate different scripts for different commands
const SHIM_TEMPLATE = `#!/bin/bash
export BVM_DIR="\${BVM_DIR:-$HOME/.bvm}"
COMMAND=$(basename "$0")

# 1. Resolve Version
if [ -n "$BVM_ACTIVE_VERSION" ]; then
    VERSION="$BVM_ACTIVE_VERSION"
elif [ -f "$PWD/.bvmrc" ]; then
    VERSION="v$(cat "$PWD/.bvmrc" | tr -d 'v')"
elif [ -f "$(git rev-parse --show-toplevel 2>/dev/null)/.bvmrc" ]; then
    VERSION="v$(cat "$(git rev-parse --show-toplevel)/.bvmrc" | tr -d 'v')"
else
    VERSION=$(cat "$BVM_DIR/aliases/default" 2>/dev/null)
fi

# Fallback if no version found
if [ -z "$VERSION" ]; then
    echo "BVM Error: No Bun version selected." >&2
    exit 1
fi

# Ensure v prefix
[[ "$VERSION" != v* ]] && VERSION="v$VERSION"

VERSION_DIR="$BVM_DIR/versions/$VERSION"

# 2. Validation
if [ ! -d "$VERSION_DIR" ]; then
    echo "BVM Error: Version $VERSION is not installed." >&2
    exit 1
fi

REAL_BIN="$VERSION_DIR/bin/$COMMAND"

# 3. Execution
if [ -x "$REAL_BIN" ]; then
    export BUN_INSTALL="$VERSION_DIR"
    export PATH="$VERSION_DIR/bin:$PATH"
    
    "$REAL_BIN" "$@"
    EXIT_CODE=$?
    
    # 4. Smart Hook: Auto-rehash on global install
    if [[ "$COMMAND" == "bun" ]] && [[ "$*" == *"-g"* ]] && ([[ "$*" == *"install"* ]] || [[ "$*" == *"add"* ]] || [[ "$*" == *"remove"* ]] || [[ "$*" == *"uninstall"* ]]); then
        "$BVM_DIR/bin/bvm" rehash >/dev/null 2>&1 &
    fi
    
    exit $EXIT_CODE
else
    # Fallthrough: If the command doesn't exist in this version, 
    # we should ideally let the shell find the next one in PATH.
    # But since we are the shim, we mask the PATH.
    # We exit with error, consistent with rbenv/asdf.
    echo "BVM Error: Command '$COMMAND' not found in Bun $VERSION." >&2
    exit 127
fi
`;

export async function rehash(): Promise<void> {
  await ensureDir(BVM_SHIMS_DIR);

  // 1. Scan all installed versions for executables
  const executables = new Set<string>();
  // Always include 'bun' even if not found (though it should be)
  executables.add('bun');
  executables.add('bunx');

  if (await pathExists(BVM_VERSIONS_DIR)) {
    const versions = await readDir(BVM_VERSIONS_DIR);
    for (const version of versions) {
      const binDir = join(BVM_VERSIONS_DIR, version, 'bin');
      if (await pathExists(binDir)) {
        const files = await readDir(binDir);
        for (const file of files) {
          executables.add(file);
        }
      }
    }
  }

  // 2. Generate shims for each executable
  for (const exe of executables) {
    const shimPath = join(BVM_SHIMS_DIR, exe);
    await Bun.write(shimPath, SHIM_TEMPLATE);
    await chmod(shimPath, 0o755);
  }

  // 3. Cleanup stale shims
  // Remove shims that are no longer present in any version
  const existingShims = await readDir(BVM_SHIMS_DIR);
  for (const shim of existingShims) {
    if (!executables.has(shim)) {
      await unlink(join(BVM_SHIMS_DIR, shim));
    }
  }
}
