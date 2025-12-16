import { join, dirname, delimiter } from 'path';
import { homedir } from 'os';
import { pathExists, ensureDir, removeDir } from '../utils';
import { BVM_BIN_DIR, BVM_DIR, EXECUTABLE_NAME } from '../constants';
import { colors, confirm } from '../utils/ui';
import { readFile, appendFile, chmod, writeFile } from 'fs/promises';
import { BVM_INIT_SH_TEMPLATE, BVM_INIT_FISH_TEMPLATE } from '../templates/init-scripts';

/**
 * Detects the user's shell and configures the PATH.
 */
export async function configureShell(displayPrompt: boolean = true): Promise<void> {
  // Windows Support
  if (process.platform === 'win32') {
      await configureWindows(displayPrompt);
      return;
  }


  if (!process.env.BVM_TEST_MODE) {
      await checkConflicts();
  }

  // Unix Support (Mac/Linux)
  const shell = process.env.SHELL || '';
  let configFile = '';
  let shellName = '';

  if (shell.includes('zsh')) {
    shellName = 'zsh';
    configFile = join(homedir(), '.zshrc');
  } else if (shell.includes('bash')) {
    shellName = 'bash';
    if (process.platform === 'darwin') {
        configFile = join(homedir(), '.bash_profile');
        if (!(await pathExists(configFile))) {
             configFile = join(homedir(), '.bashrc');
        }
    } else {
        configFile = join(homedir(), '.bashrc');
    }
  } else if (shell.includes('fish')) {
    shellName = 'fish';
    configFile = join(homedir(), '.config', 'fish', 'config.fish');
  } else {
    // If we can't detect shell, we can't auto-configure, but we processed the uninstall check above.
    console.log(colors.yellow(`Could not detect a supported shell (zsh, bash, fish). Please manually add ${BVM_BIN_DIR} to your PATH.`));
    return;
  }

  await ensureDir(BVM_BIN_DIR); // This is already here

  // Copy bvm-init.sh
  const bvmInitShPath = join(BVM_BIN_DIR, 'bvm-init.sh');
  await Bun.write(bvmInitShPath, BVM_INIT_SH_TEMPLATE);
  await chmod(bvmInitShPath, 0o755); // Make it executable

  // Copy bvm-init.fish
  const bvmInitFishPath = join(BVM_BIN_DIR, 'bvm-init.fish');
  await Bun.write(bvmInitFishPath, BVM_INIT_FISH_TEMPLATE);
  await chmod(bvmInitFishPath, 0o755); // Make it executable

  let content = '';
  try {
    content = await readFile(configFile, 'utf8');
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      await writeFile(configFile, '');
      content = '';
    } else {
      throw error;
    }
  }
  const exportStr = `export BVM_DIR="${BVM_DIR}"
export PATH="$BVM_DIR/bin:$PATH"
[ -s "$BVM_DIR/bin/bvm-init.sh" ] && . "$BVM_DIR/bin/bvm-init.sh" # Load BVM default init`;

  const fishStr = `set -Ux BVM_DIR "${BVM_DIR}"
fish_add_path "$BVM_DIR/bin"
if test -f "$BVM_DIR/bin/bvm-init.fish"
  source "$BVM_DIR/bin/bvm-init.fish"
end`;

  const targetStr = shellName === 'fish' ? 'BVM_DIR' : 'export BVM_DIR';

  if (content.includes(targetStr)) {
    return;
  }

  console.log(colors.cyan(`Configuring ${shellName} environment in ${configFile}...`));

  try {
    if (shellName === 'fish') {
        await appendFile(configFile, `
# BVM Configuration
${fishStr}
`);
    } else {
        await appendFile(configFile, `
# BVM Configuration
${exportStr}
`);
    }
    console.log(colors.green(`✓ Successfully configured BVM path in ${configFile}`));
    if (displayPrompt) {
        console.log(colors.yellow(`Please restart your terminal or run "source ${configFile}" to apply changes.`));
    }
  } catch (error: any) {
    console.error(colors.red(`Failed to write to ${configFile}: ${error.message}`));
  }
}

async function configureWindows(displayPrompt: boolean = true): Promise<void> {
    await checkConflicts();

    // PowerShell Profile logic
    const documentsDir = join(homedir(), 'Documents');
    const psCoreDir = join(documentsDir, 'PowerShell');
    const psWinDir = join(documentsDir, 'WindowsPowerShell');
    
    let profilePath = '';
    
    if (await pathExists(psCoreDir)) {
        profilePath = join(psCoreDir, 'Microsoft.PowerShell_profile.ps1');
    } else {
        profilePath = join(psWinDir, 'Microsoft.PowerShell_profile.ps1');
    }

    await ensureDir(dirname(profilePath));

    if (!(await pathExists(profilePath))) {
        await Bun.write(profilePath, '');
    }

    const content = await readFile(profilePath, 'utf8');
    const psStr = `
# BVM Configuration
$env:BVM_DIR = "${BVM_DIR}"
$env:PATH = "$env:BVM_DIR\\bin;$env:PATH"
# Auto-activate default version
if (Test-Path "$env:BVM_DIR\\bin\\bvm.exe") {
    & "$env:BVM_DIR\\bin\\bvm.exe" use default --silent *>$null
}
`;

    if (content.includes('$env:BVM_DIR')) {
        return;
    }

    console.log(colors.cyan(`Configuring PowerShell environment in ${profilePath}...`));

    try {
        await appendFile(profilePath, psStr);
        console.log(colors.green(`✓ Successfully configured BVM path in ${profilePath}`));
        if (displayPrompt) {
            console.log(colors.yellow(`Please restart your terminal or run ". $PROFILE" to apply changes.`));
        }
    } catch (error: any) {
        console.error(colors.red(`Failed to write to ${profilePath}: ${error.message}`));
    }
}

async function checkConflicts(): Promise<void> {
    if (process.env.BVM_TEST_MODE) return;
    if (process.env.BVM_SUPPRESS_CONFLICT_WARNING === 'true') return;

    const paths = (process.env.PATH || '').split(delimiter);
    const officialBunPath = join(homedir(), '.bun');
    const officialBunBin = join(officialBunPath, 'bin');
    
    for (const p of paths) {
        // Skip empty paths or BVM bin dir
        if (!p || p === BVM_BIN_DIR || p.includes('.bvm')) continue;

        const bunPath = join(p, EXECUTABLE_NAME);
        if (await pathExists(bunPath)) {
            // New condition: If the path contains 'node_modules', skip this conflict check.
            if (p.includes('node_modules')) {
                continue; // Skip this path and check the next one
            }
            
            // Case 1: Official Bun (~/.bun)
            if (p === officialBunBin || p === officialBunPath) { 
                 console.log();
                 // Note: Chalk bgYellow.black is hard to replicate exactly with simple ANSI, using yellow+black
                 // Or just yellow. Let's simplify to yellow bold.
                 console.log(colors.yellow(' CONFLICT DETECTED ')); 
                 console.log(colors.yellow(`Found existing official Bun installation at: ${bunPath}`));
                 console.log(colors.yellow(`This will conflict with bvm as it is also in your PATH.`));
                 
                 try {
                    const shouldUninstall = await confirm('Do you want bvm to uninstall the official Bun version (~/.bun) to resolve this?');

                    if (shouldUninstall) {
                        await uninstallOfficialBun(officialBunPath);
                    } else {
                        console.log(colors.dim('Skipping uninstallation. Please ensure bvm path takes precedence.'));
                    }
                 } catch (e) {
                     // ignore
                 }
                 return; 
            } 
            
            // Case 2: Other installation (npm, brew, etc.)
            else {
                console.log();
                console.log(colors.red(' CONFLICT DETECTED '));
                console.log(colors.red(`Found another Bun installation at: ${bunPath}`));
                console.log(colors.yellow(`This might be installed via npm, Homebrew, or another package manager.`));
                console.log(colors.yellow(`To avoid conflicts, please uninstall it manually (e.g., 'npm uninstall -g bun').`));
                console.log();
                // Stop search after one warning to avoid spam
                return;
            }
        }
    }
}

async function uninstallOfficialBun(path: string): Promise<void> {
    console.log(colors.cyan(`Removing official Bun installation at ${path}...`));
    try {
        await removeDir(path);
        console.log(colors.green('✓ Official Bun uninstalled.'));
        console.log(colors.yellow('Note: You may still need to remove `.bun/bin` from your PATH manually if it was added in your rc file.'));
    } catch (error: any) {
        console.error(colors.red(`Failed to remove official Bun: ${error.message}`));
    }
}
