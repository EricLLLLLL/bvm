import { join } from 'path';
import { readdir, chmod, unlink, symlink, lstat, readlink } from 'fs/promises';
import { BVM_SHIMS_DIR, BVM_VERSIONS_DIR, BVM_DIR, OS_PLATFORM, EXECUTABLE_NAME } from '../constants';
import { ensureDir, pathExists, readDir } from '../utils';
import { colors } from '../utils/ui';

const SHIM_TEMPLATE_BASH = `#!/bin/bash
# Shim managed by BVM (Bun Version Manager)
BVM_DIR="${BVM_DIR:-$HOME/.bvm}"
COMMAND=$(basename "$0")
if [ -n "$BVM_ACTIVE_VERSION" ]; then
    VERSION="$BVM_ACTIVE_VERSION"
else
    CUR_DIR="$PWD"
    while [ "$CUR_DIR" != "/" ]; do
        if [ -f "$CUR_DIR/.bvmrc" ]; then
            VERSION="v$(cat "$CUR_DIR/.bvmrc" | tr -d 'v' | tr -d '[:space:]')"
            break
        fi
        CUR_DIR=$(dirname "$CUR_DIR")
    done
    if [ -z "$VERSION" ] && [ -L "$BVM_DIR/current" ]; then
        VERSION_PATH=$(readlink "$BVM_DIR/current")
        VERSION_TMP=$(basename "$VERSION_PATH")
        if [ -d "$BVM_DIR/versions/$VERSION_TMP" ]; then
            VERSION="$VERSION_TMP"
        fi
    fi
    if [ -z "$VERSION" ]; then
        if [ -f "$BVM_DIR/aliases/default" ]; then
            VERSION=$(cat "$BVM_DIR/aliases/default")
        fi
    fi
fi
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
if [ -x "$REAL_EXECUTABLE" ]; then
    export BUN_INSTALL="$VERSION_DIR"
    export PATH="$VERSION_DIR/bin:$PATH"
    "$REAL_EXECUTABLE" "$@"
    EXIT_CODE=$?
    if [[ "$COMMAND" == "bun" ]] && [[ "$*" == *"-g"* ]] && ([[ "$*" == *"install"* ]] || [[ "$*" == *"add"* ]] || [[ "$*" == *"remove"* ]] || [[ "$*" == *"uninstall"* ]]); then
        "$BVM_DIR/bin/bvm" rehash >/dev/null 2>&1
    fi
    exit $EXIT_CODE
else
    echo "BVM Error: Command '$COMMAND' not found in Bun $VERSION." >&2
    exit 127
fi
`;

const SHIM_TEMPLATE_JS = `
const path = require('path');
const { spawn } = require('child_process');
const os = require('os');
const fs = require('fs');

const BVM_DIR = process.env.BVM_DIR || path.join(os.homedir(), '.bvm');
const CMD = process.argv[2].replace(/\\.exe$/i, '').replace(/\\.cmd$/i, '');
const ARGS = process.argv.slice(3);

function resolveVersion() {
  if (process.env.BVM_ACTIVE_VERSION) return process.env.BVM_ACTIVE_VERSION;

  let dir = process.cwd();
  try {
    const { root } = path.parse(dir);
    while (true) {
        const rc = path.join(dir, '.bvmrc');
        if (fs.existsSync(rc)) {
            const v = fs.readFileSync(rc, 'utf8').trim();
            if (v) return v.startsWith('v') ? v : 'v' + v;
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
      const v = fs.readFileSync(def, 'utf8').trim();
      if (v) return v.startsWith('v') ? v : 'v' + v;
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
        console.error(`BVM Error: Command '${CMD}' not found in Bun ${version}.`);
        process.exit(127);
    }

    process.env.BUN_INSTALL = versionDir;
    process.env.PATH = binDir + path.delimiter + process.env.PATH;

    const child = spawn(realExecutable, ARGS, { stdio: 'inherit', shell: false });
    child.on('exit', (code) => process.exit(code ?? 0));
})();
`;

const SHIM_TEMPLATE_CMD = `@echo off
set