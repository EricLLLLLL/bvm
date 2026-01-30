import { join, dirname, resolve } from 'path';
import { readdir, stat } from 'fs/promises';
import { OS_PLATFORM } from '../constants';

export async function fixWindowsShims(binDir: string) {
  if (OS_PLATFORM !== 'win32') return;

  try {
    const files = await readdir(binDir);
    for (const file of files) {
      const fullPath = join(binDir, file);
      // We only fix the shim if it's NOT one of our own proxies (bun.cmd, bunx.cmd)
      // Actually, rehash generates bun.cmd/bunx.cmd in BVM_SHIMS_DIR.
      // The shims we need to fix are in BVM_VERSIONS_DIR/vX.X.X/bin/.
      
      if (file.endsWith('.cmd')) {
        await fixCmdShim(fullPath);
      } else if (file.endsWith('.ps1')) {
        await fixPs1Shim(fullPath);
      }
    }
  } catch (error) {
    // Ignore errors
  }
}

async function findNodeModulesPath(binDir: string): Promise<string | null> {
  // Strategy 1: Peer directory (Common in BVM with custom bunfig)
  // bin/../node_modules
  const peer = join(binDir, '..', 'node_modules');
  if (await exists(peer)) return peer;

  // Strategy 2: Nested default Bun structure (global install)
  // bin/../install/global/node_modules
  const nested = join(binDir, '..', 'install', 'global', 'node_modules');
  if (await exists(nested)) return nested;

  return null;
}

async function exists(path: string) {
  try { await stat(path); return true; } catch { return false; }
}

async function fixCmdShim(filePath: string) {
  try {
    const file = Bun.file(filePath);
    let content = await file.text();
    
    // Pattern to match: "%~dp0\..\..." or similar relative paths
    // Bun often generates: "%dp0%\..\node_modules\..." or "%~dp0\..\..."
    
    // We want to replace the relative jump with the ABSOLUTE path to the package root.
    
    const binDir = dirname(filePath);
    // We strictly assume binDir is the physical path because we iterate physical directories.
    
    const nodeModulesBase = await findNodeModulesPath(binDir);
    if (!nodeModulesBase) return; // Can't fix if we can't find modules

    // Replace %~dp0\..\... with Absolute Path
    // The pattern usually is: "%~dp0\..\node_modules" or "%dp0%\..\node_modules"
    
    // 1. Fix standard Bun shim patterns
    // Pattern A: "%~dp0\..\node_modules"
    // Pattern B: "%dp0%\..\node_modules"
    
    // We will construct the absolute path to node_modules
    const absNodeModules = resolve(nodeModulesBase).replace(/\//g, '\\');
    
    let newContent = content;
    
    // Replace relative paths to node_modules with absolute path
    // We search for the sequence `\..\node_modules` or `\..\install\global\node_modules` preceded by variable
    
    // Regex explanation:
    // Match %~dp0 or %dp0%
    // Match one or more \..
    // Match \node_modules or \install\global\node_modules
    
    // Easier approach: Replace the whole known structure if found.
    
    // Detect which structure it uses
    if (content.includes('node_modules')) {
        // Try to blindly replace the relative prefix.
        // It's risky to regex replace all `\..\`
        
        // Let's iterate likely relative paths
        const candidates = [
            '%~dp0\\..\\node_modules',
            '%dp0%\\..\\node_modules',
            '%~dp0\\..\\install\\global\\node_modules',
            '%dp0%\\..\\install\\global\\node_modules'
        ];
        
        let fixed = false;
        for (const cand of candidates) {
            if (content.includes(cand)) {
                // Replace with absolute path to node_modules
                // We need to escape backslashes for string replacement? No, replaceAll works with strings.
                newContent = newContent.split(cand).join(absNodeModules);
                fixed = true;
            }
        }
        
        if (fixed && newContent !== content) {
            await Bun.write(filePath, newContent);
        }
    }
  } catch (e) {}
}

async function fixPs1Shim(filePath: string) {
  try {
    const file = Bun.file(filePath);
    let content = await file.text();
    
    const binDir = dirname(filePath);
    const nodeModulesBase = await findNodeModulesPath(binDir);
    if (!nodeModulesBase) return;

    const absNodeModules = resolve(nodeModulesBase).replace(/\//g, '\\');
    
    // PowerShell patterns:
    // $PSScriptRoot\..\node_modules
    
    const candidates = [
        '$PSScriptRoot\\..\\node_modules',
        '$PSScriptRoot\\..\\install\\global\\node_modules'
    ];
    
    let fixed = false;
    for (const cand of candidates) {
        if (content.includes(cand)) {
            newContent = content.split(cand).join(absNodeModules);
            fixed = true;
        }
    }
    
    if (fixed && newContent !== content) {
        await Bun.write(filePath, newContent);
    }
  } catch(e) {}
}
