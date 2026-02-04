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
    // Strict version isolation:
    // If a tool isn't physically present in this version's bin dir,
    // do NOT fall back to `bun x <tool>` (that would bypass isolation).
    console.error(`BVM Error: Command '${CMD}' not found in Bun ${version}.`);
    process.exit(127);
} else if (isShellScript) {
    // JIT SELF-HEALING: If we are about to run a shell script (shim), 
    // ensure it's not broken by relative path drift.
    try {
        let content = fs.readFileSync(realExecutable, 'utf8');
        // console.log("[DEBUG] Checking shim:", realExecutable);
        if (content.includes('%~dp0\\..') || content.includes('$PSScriptRoot\\..')) {
            console.log(`[bvm] Fixing broken shim: ${realExecutable}`);
            const binDir = path.dirname(realExecutable);
            const nodeModulesPeer = path.join(binDir, '..', 'node_modules');
            const nodeModulesNested = path.join(binDir, '..', 'install', 'global', 'node_modules');
            
            let nodeModulesBase = '';
            if (fs.existsSync(nodeModulesPeer)) nodeModulesBase = nodeModulesPeer;
            else if (fs.existsSync(nodeModulesNested)) nodeModulesBase = nodeModulesNested;

            if (nodeModulesBase) {
                const absNodeModules = path.resolve(nodeModulesBase).replace(/\//g, '\\');
                const oldPatterns = [
                    '%~dp0\\..\\node_modules',
                    '%dp0%\\..\\node_modules',
                    '%~dp0\\..\\install\\global\\node_modules',
                    '%dp0%\\..\\install\\global\\node_modules',
                    '$PSScriptRoot\\..\\node_modules',
                    '$PSScriptRoot\\..\\install\\global\\node_modules'
                ];
                
                let fixed = false;
                for (const pat of oldPatterns) {
                    if (content.includes(pat)) {
                        content = content.split(pat).join(absNodeModules);
                        fixed = true;
                    }
                }
                
                if (fixed) {
                    fs.writeFileSync(realExecutable, content, 'utf8');
                    console.log(`[bvm] Shim fixed. New target: ${absNodeModules}`);
                } else {
                    console.log(`[bvm] Failed to fix shim patterns.`);
                }
            } else {
                console.log(`[bvm] Could not find node_modules in peer or nested location.`);
            }
        }
    } catch (e) {
        console.error(`[bvm] JIT Fix Error: ${e.message}`);
    }
}

// 2. CONFIGURE ENVIRONMENT
const bunfigPath = path.join(versionDir, 'bunfig.toml');
const env = Object.assign({}, process.env, {
    BUN_INSTALL: versionDir,
    BUN_INSTALL_GLOBAL_DIR: versionDir,
    BUN_INSTALL_GLOBAL_BIN: binDir,
    BUN_CONFIG_FILE: bunfigPath,  // Force bun to use version-specific bunfig
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
    const installCmds = ['install', 'i', 'add', 'a', 'remove', 'rm', 'uninstall', 'upgrade', 'link', 'unlink'];
    
    let needRehash = false;
    
    if (CMD === 'bun' && ARGS.length > 0) {
        const subCmd = ARGS[0];
        const hasGlobalFlag = ARGS.includes('-g') || ARGS.includes('--global');
        
        // For install/add/remove commands, only rehash if -g/--global is present
        if (['install', 'i', 'add', 'a', 'remove', 'rm', 'uninstall', 'upgrade'].includes(subCmd)) {
            needRehash = hasGlobalFlag;
        }
        // For link/unlink, always rehash
        else if (['link', 'unlink'].includes(subCmd)) {
            needRehash = true;
        }
    }
    
    if (code === 0 && needRehash) {
        const bvmCmd = path.join(BVM_DIR, 'bin', 'bvm.cmd');
        if (fs.existsSync(bvmCmd)) {
            try {
                console.log('[bvm] Updating command registry...');
                // Use synchronous call so user sees completion
                const result = spawnSync(bvmCmd, ['rehash', '--silent'], { 
                    stdio: 'inherit',
                    env: Object.assign({}, process.env, { BVM_DIR })
                });
                if (result.status === 0) {
                    console.log('[bvm] Done! New commands are now available.');
                }
            } catch(e) {
                // Silent fail - rehash is not critical
            }
        }
    }
    process.exit(code ?? 0);
});

child.on('error', (err) => {
    console.error("BVM Error: " + err.message);
    process.exit(1);
});
