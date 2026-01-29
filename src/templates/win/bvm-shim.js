const path = require('path');
const { spawn } = require('child_process');
const os = require('os');
const fs = require('fs');

/**
 * BVM Shim for Windows (JavaScript version)
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

// Simple synchronous execution for performance
const version = resolveVersion();
if (!version) {
    console.error("BVM Error: No Bun version is active or default is set.");
    process.exit(1);
}

const versionDir = path.join(BVM_DIR, 'versions', version);
const binDir = path.join(versionDir, 'bin');
let realExecutable = path.join(binDir, CMD + '.exe');
let finalArgs = ARGS;

if (!fs.existsSync(realExecutable)) {
    if (CMD === 'bunx') {
        // Fallback: Use 'bun.exe x' if 'bunx.exe' is missing
        const bunExe = path.join(binDir, 'bun.exe');
        if (fs.existsSync(bunExe)) {
            realExecutable = bunExe;
            finalArgs = ['x', ...ARGS];
        } else {
            console.error("BVM Error: Both 'bunx.exe' and 'bun.exe' are missing in Bun " + version);
            process.exit(127);
        }
    } else {
        console.error("BVM Error: Command '" + CMD + "' not found in Bun " + version + " at " + realExecutable);
        process.exit(127);
    }
}

process.env.BUN_INSTALL = versionDir;
process.env.PATH = binDir + path.delimiter + process.env.PATH;

const child = spawn(realExecutable, finalArgs, { stdio: 'inherit', shell: false });
child.on('exit', (code) => {
    if (code === 0 && (CMD === 'bun' || CMD === 'bunx')) {
        const isGlobal = ARGS.includes('-g') || ARGS.includes('--global');
        const isInstall = ARGS.includes('install') || ARGS.includes('i') || 
                         ARGS.includes('add') || ARGS.includes('a') || 
                         ARGS.includes('remove') || ARGS.includes('rm') || 
                         ARGS.includes('upgrade');
        
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
        for (const file of files) {
            const filePath = path.join(binDir, file);
            if (file.endsWith('.cmd')) {
                let content = fs.readFileSync(filePath, 'utf8');
                let newContent = content;
                
                // Replace relative jumps with absolute version path
                // We do this precisely to avoid breaking other parts of the command
                newContent = newContent.replace(/%~dp0[/\\]\.\.[/\\]\.\.[/\\]\.\.[/\\]\.\./g, path.dirname(path.dirname(path.dirname(versionDirAbs))));
                newContent = newContent.replace(/%~dp0[/\\]\.\.[/\\]\.\.[/\\]\.\./g, path.dirname(path.dirname(versionDirAbs)));
                newContent = newContent.replace(/%~dp0[/\\]\.\.[/\\]\.\./g, path.dirname(versionDirAbs));
                newContent = newContent.replace(/%~dp0[/\\]\.\./g, versionDirAbs);
                
                // Special case for Bun's global layout: if it points to node_modules directly, 
                // it might need to go through install/global/node_modules
                if (newContent.includes(versionDirAbs + '\\node_modules') && !newContent.includes(versionDirAbs + '\\install\\global')) {
                    newContent = newContent.split(versionDirAbs + '\\node_modules').join(versionDirAbs + '\\install\\global\\node_modules');
                }

                if (content !== newContent) {
                    fs.writeFileSync(filePath, newContent, 'utf8');
                }
            } else if (file.endsWith('.ps1')) {
                let content = fs.readFileSync(filePath, 'utf8');
                let newContent = content.replace(/\$PSScriptRoot[/\\]\.\./g, `'${versionDirAbs}'`);
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
