const path = require('path');
const { spawn } = require('child_process');
const os = require('os');
const fs = require('fs');

/**
 * BVM Shim for Windows (JavaScript version)
 * This script is executed by the Bun runtime and routes the command
 * to the correctly versioned Bun executable.
 */

const BVM_DIR = process.env.BVM_DIR || path.join(os.homedir(), '.bvm');
const CMD = process.argv[2] ? process.argv[2].replace(/\.exe$/i, '').replace(/\.cmd$/i, '') : 'bun';
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
        console.error(`BVM Error: Command '${CMD}' not found in Bun ${version} at ${realExecutable}`);
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
