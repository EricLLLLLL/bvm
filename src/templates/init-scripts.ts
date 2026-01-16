export const BVM_INIT_SH_TEMPLATE = `#!/bin/bash

# bvm-init.sh: Initializes bvm default version on shell startup

# Check if BVM_DIR is set
if [ -z "${BVM_DIR}" ]; then
  return
fi

# Try to switch to the 'default' version silently.
# We use the absolute path to ensure we are calling the correct binary.
# Errors are suppressed to prevent blocking shell startup if 'default' is missing.
"${BVM_DIR}/bin/bvm" use default --silent >/dev/null 2>&1 || true
`;

export const BVM_INIT_FISH_TEMPLATE = `# bvm-init.fish: Initializes bvm default version on shell startup

# Check if BVM_DIR is set
if not set -q BVM_DIR
  return
end

# Try to switch to the 'default' version silently.
# Errors are suppressed to prevent blocking shell startup.
eval "$BVM_DIR/bin/bvm" use default --silent >/dev/null 2>&1 || true
`;

export const BVM_SHIM_SH_TEMPLATE = `#!/bin/bash
# Shim managed by BVM (Bun Version Manager)
# This script routes the command to the active Bun version.

BVM_DIR="${BVM_DIR:-$HOME/.bvm"}
CMD_NAME="$1"
shift

if [ -z "$CMD_NAME" ]; then
    echo "BVM Error: No command specified." >&2
    exit 1
fi

if [ -n "$BVM_ACTIVE_VERSION" ]; then
    VERSION="$BVM_ACTIVE_VERSION"
else
    CUR_DIR="$PWD"
    # Recursively look for .bvmrc
    while [ "$CUR_DIR" != "/" ] && [ -n "$CUR_DIR" ]; do
        if [ -f "$CUR_DIR/.bvmrc" ]; then
            VERSION="v$(cat "$CUR_DIR/.bvmrc" | tr -d 'v' | tr -d '[:space:]')"
            break
        fi
        CUR_DIR=$(dirname "$CUR_DIR")
    done

    # Fallback to current symlink
    if [ -z "$VERSION" ] && [ -L "$BVM_DIR/current" ]; then
        VERSION_PATH=$(readlink "$BVM_DIR/current")
        VERSION_TMP=$(basename "$VERSION_PATH")
        [ -d "$BVM_DIR/versions/$VERSION_TMP" ] && VERSION="$VERSION_TMP"
    fi

    # Fallback to default alias
    if [ -z "$VERSION" ] && [ -f "$BVM_DIR/aliases/default" ]; then
        VERSION=$(cat "$BVM_DIR/aliases/default" | tr -d '[:space:]')
    fi
fi

if [ -z "$VERSION" ]; then
    echo "BVM Error: No Bun version active." >&2
    exit 1
fi

# Ensure version starts with 'v'
[[ "$VERSION" != v* ]] && VERSION="v$VERSION"
VERSION_DIR="$BVM_DIR/versions/$VERSION"
REAL_EXECUTABLE="$VERSION_DIR/bin/$CMD_NAME"

if [ -x "$REAL_EXECUTABLE" ]; then
    # Set BUN_INSTALL to the version directory
    export BUN_INSTALL="$VERSION_DIR"
    # Prepend version bin to PATH
    export PATH="$VERSION_DIR/bin:$PATH"
    
    # Execute the real binary with arguments
    exec "$REAL_EXECUTABLE" "$@"
else
    echo "BVM Error: Command '$CMD_NAME' not found in Bun $VERSION." >&2
    exit 127
fi
`;

export const BVM_SHIM_JS_TEMPLATE = `const path = require('path');
const { spawn } = require('child_process');
const os = require('os');
const fs = require('fs');

/**
 * BVM Shim for Windows (JavaScript version)
 */

const BVM_DIR = process.env.BVM_DIR || path.join(os.homedir(), '.bvm');
const CMD = process.argv[2] ? process.argv[2].replace(/\\.exe$/i, '').replace(/\\.cmd$/i, '') : 'bun';
const ARGS = process.argv.slice(3);

function resolveVersion() {
  if (process.env.BVM_ACTIVE_VERSION) {
    const v = process.env.BVM_ACTIVE_VERSION.trim();
    return v.startsWith('v') ? v : 'v' + v;
  }

  let dir = process.cwd();
  try {
    const { root } = path.parse(dir);
    while (true) {
        const rc = path.join(dir, '.bvmrc');
        if (fs.existsSync(rc)) {
            const v = fs.readFileSync(rc, 'utf8').trim().replace(/^v/, '');
            if (v) return 'v' + v;
        }
        if (dir === root) break;
        dir = path.dirname(dir);
    }
  } catch(e) {}

  const current = path.join(BVM_DIR, 'current');
  if (fs.existsSync(current)) {
    try {
        const target = fs.realpathSync(current); 
        const v = path.basename(target); 
        if (v && v.startsWith('v')) return v;
    } catch(e) {}
  }
  
  const def = path.join(BVM_DIR, 'aliases', 'default');
  if (fs.existsSync(def)) {
      try {
          const v = fs.readFileSync(def, 'utf8').trim().replace(/^v/, '');
          if (v) return 'v' + v;
      } catch(e) {}
  }
  return '';
}

(async () => {
    const version = resolveVersion();
    if (!version) {
        console.error("BVM Error: No Bun version is active or default is set.");
        process.exit(1);
    }

    const versionDir = path.join(BVM_DIR, 'versions', version);
    const binDir = path.join(versionDir, 'bin');
    const realExecutable = path.join(binDir, CMD + '.exe');

    if (!fs.existsSync(realExecutable)) {
        console.error(`BVM Error: Command '\${CMD}' not found in Bun ${version} at ${realExecutable}`);
        process.exit(127);
    }

    process.env.BUN_INSTALL = versionDir;
    process.env.PATH = binDir + path.delimiter + process.env.PATH;

    const child = spawn(realExecutable, ARGS, { stdio: 'inherit', shell: false });
    child.on('exit', (code) => process.exit(code ?? 0));
    
    child.on('error', (err) => {
        console.error(`BVM Error: Failed to start child process: ${err.message}`);
        process.exit(1);
    });
})();
`;