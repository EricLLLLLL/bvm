const path = require('path');
const { spawn } = require('child_process');
const os = require('os');
const fs = require('fs');

/**
 * BVM Shim for Windows (JavaScript version)
 * Enhanced with aggressive path fixing and debug logging
 */

const BVM_DIR = process.env.BVM_DIR || path.join(os.homedir(), '.bvm');
const CMD = process.argv[2] ? process.argv[2].replace(/\.(exe|cmd|bat|ps1)$/i, '') : 'bun';
const ARGS = process.argv.slice(3);
const DEBUG = process.env.BVM_DEBUG === '1';

function log(msg) {
    if (DEBUG) console.log(`[BVM DEBUG] ${msg}`);
}

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

let finalArgs = ARGS;
if (!realExecutable) {
    if (CMD === 'bunx') {
        const bunExe = path.join(binDir, 'bun.exe');
        if (fs.existsSync(bunExe)) {
            realExecutable = bunExe;
            finalArgs = ['x', ...ARGS];
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

log(`Resolved command ${CMD} to ${realExecutable}`);

// Ensure environment is passed correctly
const env = Object.assign({}, process.env, {
    BUN_INSTALL: versionDir,
    PATH: binDir + path.delimiter + process.env.PATH
});

const child = spawn(realExecutable, finalArgs, { 
    stdio: 'inherit', 
    shell: isShellScript,
    env: env
});

child.on('exit', (code) => {
    if (code === 0 && (CMD === 'bun' || CMD === 'bunx')) {
        const isInstall = ARGS.some(arg => ['install', 'i', 'add', 'a', 'remove', 'rm', 'upgrade'].includes(arg));
        if (isInstall) {
            log('Installation command detected, triggering self-healing...');
            try {
                fixShims(binDir, versionDir);
            } catch(e) {
                log(`Self-healing failed: ${e.message}`);
            }
        }
    }
    process.exit(code ?? 0);
});

function fixShims(binDir, versionDir) {
    const files = fs.readdirSync(binDir);
    const versionDirAbs = path.resolve(versionDir);
    const globalNM = path.join(versionDirAbs, 'install', 'global', 'node_modules');
    
    log(`Scanning ${files.length} files in ${binDir} for path fixing...`);
    
    for (const file of files) {
        const filePath = path.join(binDir, file);
        if (file.endsWith('.cmd') || file.endsWith('.bat')) {
            let content = fs.readFileSync(filePath, 'utf8');
            let newContent = content;
            
            // Aggressively replace ANY %~dp0\.. sequence with absolute version path
            // Use function replacement to avoid backslash escaping issues
            newContent = newContent.replace(/%~dp0([/\\]\.\.)+/gi, () => versionDirAbs);
            
            // Fix node_modules redirection for Bun's global layout
            if (newContent.includes(versionDirAbs + '\\node_modules')) {
                newContent = newContent.split(versionDirAbs + '\\node_modules').join(globalNM);
            }
            if (newContent.includes(versionDirAbs + '/node_modules')) {
                newContent = newContent.split(versionDirAbs + '/node_modules').join(globalNM);
            }

            if (content !== newContent) {
                log(`Fixed path in ${file}`);
                fs.writeFileSync(filePath, newContent, 'utf8');
            }
        } else if (file.endsWith('.ps1')) {
            let content = fs.readFileSync(filePath, 'utf8');
            let newContent = content.replace(/