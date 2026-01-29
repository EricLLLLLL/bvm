const path = require('path');
const { spawn, spawnSync } = require('child_process');
const os = require('os');
const fs = require('fs');

/**
 * BVM Shim for Windows (JavaScript version)
 * Features: Physical Execution Proxy - No Drift, Full Compatibility.
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
    console.error("BVM Error: No Bun version is active.");
    process.exit(1);
}

const versionDir = path.join(BVM_DIR, 'versions', version);
const binDir = path.join(versionDir, 'bin');
const bunExe = path.join(binDir, 'bun.exe');

let realExecutable = '';
let isShellScript = false;

// 1. Core Logic: Resolve the PHYSICAL executable
if (CMD === 'bun') {
    realExecutable = bunExe;
} else if (CMD === 'bunx') {
    // Windows Bun doesn't have a physical bunx.exe, it's 'bun x'
    realExecutable = bunExe;
    ARGS.unshift('x');
} else {
    // For 3rd party tools, find the physical shim created by Bun in the version dir
    const extensions = ['.exe', '.cmd', '.bat', '.ps1'];
    for (const ext of extensions) {
        const p = path.join(binDir, CMD + ext);
        if (fs.existsSync(p)) {
            realExecutable = p;
            isShellScript = (ext !== '.exe');
            break;
        }
    }
}

if (!realExecutable || !fs.existsSync(realExecutable)) {
    // Ultimate fallback to bun x if not found physically
    realExecutable = bunExe;
    ARGS.unshift('x', CMD);
}

// 2. CONFIGURE ENVIRONMENT
const env = Object.assign({}, process.env, {
    BUN_INSTALL: versionDir,
    PATH: binDir + path.delimiter + process.env.PATH
});

// 3. EXECUTE THE PHYSICAL ORIGINAL
const child = spawn(realExecutable, ARGS, { 
    stdio: 'inherit', 
    shell: isShellScript,
    env: env
});

child.on('exit', (code) => {
    // AUTOMATIC REHASH: Ensure new commands are exposed immediately after installation
    const isInstall = ARGS.some(a => ['install', 'i', 'add', 'a', 'remove', 'rm', 'upgrade'].includes(a));
    if (code === 0 && isInstall) {
        const bvmCmd = path.join(BVM_DIR, 'bin', 'bvm.cmd');
        if (fs.existsSync(bvmCmd)) {
            spawnSync(bvmCmd, ['rehash', '--silent'], { 
                stdio: 'ignore', 
                env: Object.assign({}, process.env, { BVM_DIR })
            });
        }
    }
    process.exit(code ?? 0);
});

child.on('error', (err) => {
    console.error("BVM Error: " + err.message);
    process.exit(1);
});