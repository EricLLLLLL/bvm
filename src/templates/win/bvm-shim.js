const path = require('path');
const { spawn } = require('child_process');
const os = require('os');
const fs = require('fs');

/**
 * BVM Shim for Windows (JavaScript version)
 * Native performance, robust execution.
 */

const BVM_DIR = process.env.BVM_DIR || path.join(os.homedir(), '.bvm');
const CMD = process.argv[2] ? process.argv[2].replace(/\.(exe|cmd|bat|ps1)$/i, '') : 'bun';
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

const version = resolveVersion();
if (!version) {
    console.error("BVM Error: No Bun version is active or default is set.");
    process.exit(1);
}

const versionDir = path.join(BVM_DIR, 'versions', version);
const binDir = path.join(versionDir, 'bin');

let realExecutable = '';
let isShellScript = false;
const extensions = ['.exe', '.cmd', '.bat', '.ps1'];

for (const ext of extensions) {
    const p = path.join(binDir, CMD + ext);
    if (fs.existsSync(p)) {
        realExecutable = p;
        isShellScript = (ext !== '.exe');
        break;
    }
}

if (!realExecutable) {
    if (CMD === 'bunx') {
        const bunExe = path.join(binDir, 'bun.exe');
        if (fs.existsSync(bunExe)) {
            realExecutable = bunExe;
            ARGS.unshift('x');
            isShellScript = false;
        } else {
            console.error("BVM Error: Both 'bunx.exe' and 'bun.exe' are missing in Bun " + version);
            process.exit(127);
        }
    } else {
        console.error("BVM Error: Command '" + CMD + "' not found in Bun " + version + " at " + binDir);
        process.exit(127);
    }
}

// ENVIRONMENT SYNC
const logicalCurrentDir = path.join(BVM_DIR, 'current');
const env = Object.assign({}, process.env, {
    BUN_INSTALL: logicalCurrentDir,
    PATH: path.join(logicalCurrentDir, 'bin') + path.delimiter + binDir + path.delimiter + process.env.PATH
});

const child = spawn(realExecutable, ARGS, { 
    stdio: 'inherit', 
    shell: isShellScript,
    env: env
});

child.on('exit', (code) => {
    process.exit(code ?? 0);
});

child.on('error', (err) => {
    console.error("BVM Error: Failed to start child process: " + err.message);
    process.exit(1);
});