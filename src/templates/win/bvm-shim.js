const path = require('path');
const { spawn } = require('child_process');
const os = require('os');
const fs = require('fs');

/**
 * BVM Shim for Windows (JavaScript version)
 * Enhanced to handle .exe, .cmd, and .ps1 with path fixing
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

// Support multiple extensions on Windows
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

// Ensure BUN_INSTALL is set for the child process
process.env.BUN_INSTALL = versionDir;
process.env.PATH = binDir + path.delimiter + process.env.PATH;

// Use shell: true for .cmd/.ps1 to ensure correct execution
const child = spawn(realExecutable, finalArgs, { 
    stdio: 'inherit', 
    shell: isShellScript,
    env: process.env 
});

child.on('exit', (code) => {
    // Post-install self-healing
    if (code === 0 && (CMD === 'bun' || CMD === 'bunx')) {
        const isInstall = ARGS.some(arg => ['install', 'i', 'add', 'a', 'remove', 'rm', 'upgrade'].includes(arg));
        if (isInstall) {
            try {
                fixShims(binDir, versionDir);
            } catch(e) {}
        }
    }
    process.exit(code ?? 0);
});

function fixShims(binDir, versionDir) {
    try {
        const files = fs.readdirSync(binDir);
        const versionDirAbs = path.resolve(versionDir);
        const globalNodeModules = path.join(versionDirAbs, 'install', 'global', 'node_modules');
        
        for (const file of files) {
            const filePath = path.join(binDir, file);
            if (file.endsWith('.cmd') || file.endsWith('.bat')) {
                let content = fs.readFileSync(filePath, 'utf8');
                let newContent = content;
                
                // 1. Fix BUN_INSTALL and other relative paths
                // Replace any %~dp0\.. chain with absolute versionDir
                newContent = newContent.replace(/%~dp0([/\\]\.\.)+/g, versionDirAbs);
                
                // 2. Fix node_modules path specifically for Bun's global layout
                // If the path lands in versionDir\node_modules, move it to install\global\node_modules
                if (newContent.includes(versionDirAbs + '\\node_modules') && !newContent.includes(versionDirAbs + '\\install\\global')) {
                    newContent = newContent.split(versionDirAbs + '\\node_modules').join(globalNodeModules);
                }

                if (content !== newContent) {
                    fs.writeFileSync(filePath, newContent, 'utf8');
                }
            } else if (file.endsWith('.ps1')) {
                let content = fs.readFileSync(filePath, 'utf8');
                // Replace $PSScriptRoot\.. chain with absolute versionDir
                // Use a format that works both with and without existing quotes
                let newContent = content.replace(/"?\$PSScriptRoot([/\\]\.\.)+"?/g, `'${versionDirAbs}'`);
                
                if (newContent.includes(versionDirAbs + '\\node_modules') && !newContent.includes(versionDirAbs + '\\install\\global')) {
                    newContent = newContent.split(versionDirAbs + '\\node_modules').join(globalNodeModules);
                }

                if (content !== newContent) {
                    fs.writeFileSync(filePath, newContent, 'utf8');
                }
            }
        }
    } catch(e) {}
}

child.on('error', (err) => {
    console.error("BVM Error: Failed to start child process: " + err.message);
    process.exit(1);
});