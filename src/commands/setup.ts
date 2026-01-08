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
  const startMarker = '# >>> bvm initialize >>>';
  const endMarker = '# <<< bvm initialize <<<';

  const configBlock = `${startMarker}
# !! Contents within this block are managed by 'bvm setup' !!
export BVM_DIR="${BVM_DIR}"
export PATH="$BVM_DIR/shims:$BVM_DIR/bin:$PATH"
# Reset current version to default for new terminal sessions
[ -L "$BVM_DIR/current" ] && rm "$BVM_DIR/current"
${endMarker}`;

  const fishConfigBlock = `# >>> bvm initialize >>>
# !! Contents within this block are managed by 'bvm setup' !!
set -Ux BVM_DIR "${BVM_DIR}"
fish_add_path "$BVM_DIR/shims"
fish_add_path "$BVM_DIR/bin"
# Reset current version to default
if test -L "$BVM_DIR/current"
    rm "$BVM_DIR/current"
end
# <<< bvm initialize <<<`;

  if (displayPrompt) {
    console.log(colors.cyan(`Configuring ${shellName} environment in ${configFile}...`));
  }

  try {
    let newContent = content;
    const blockRegex = new RegExp(`${startMarker}[\s\S]*?${endMarker}`, 'g');

    if (content.includes(startMarker)) {
      // 1. Update existing managed block
      newContent = content.replace(blockRegex, shellName === 'fish' ? fishConfigBlock : configBlock);
    } else if (content.includes('export BVM_DIR=') || content.includes('set -Ux BVM_DIR')) {
      // 2. Transition from old unmanaged config to new managed block
      // We'll append the new block and suggest the user remove the old lines, 
      // or just append. For safety, let's append.
      newContent = content + '\n' + (shellName === 'fish' ? fishConfigBlock : configBlock);
    } else {
      // 3. Fresh install
      newContent = content + '\n' + (shellName === 'fish' ? fishConfigBlock : configBlock);
    }

    if (newContent !== content) {
      await writeFile(configFile, newContent);
      if (displayPrompt) {
        console.log(colors.green(`✓ Successfully updated BVM configuration in ${configFile}`));
      }
    } else if (displayPrompt) {
      console.log(colors.gray('✓ Configuration is already up to date.'));
    }

    if (displayPrompt) {
        console.log(colors.yellow(`Please restart your terminal or run "source ${configFile}" to apply changes.`));
    }
  } catch (error: any) {
    console.error(colors.red(`Failed to write to ${configFile}: ${error.message}`));
  }
}

async function configureWindows(displayPrompt: boolean = true): Promise<void> {
    await checkConflicts();

    // 1. Get the real Profile path from PowerShell itself
    let profilePath = '';
    try {
        const proc = Bun.spawnSync({
            cmd: ['powershell', '-NoProfile', '-Command', 'echo $PROFILE.CurrentUserAllHosts'],
            stdout: 'pipe'
        });
        profilePath = proc.stdout.toString().trim();
    } catch (e) {
        // Fallback to manual path if powershell fails
        profilePath = join(homedir(), 'Documents', 'WindowsPowerShell', 'Microsoft.PowerShell_profile.ps1');
    }

    if (!profilePath) return;

    // 2. Ensure the directory exists
    await ensureDir(dirname(profilePath));

    // 3. Prepare the config string (Strictly ASCII to avoid encoding drama)
    const psStr = `
# BVM Configuration
$env:BVM_DIR = "${BVM_DIR}"
$env:PATH = "$env:BVM_DIR\\shims;$env:BVM_DIR\\bin;$env:PATH"
# Auto-activate default version
if (Test-Path "$env:BVM_DIR\\bin\\bvm.cmd") {
    & "$env:BVM_DIR\\bin\\bvm.cmd" use default --silent *>$null
}
`;

    try {
        let existingContent = '';
        if (await pathExists(profilePath)) {
            existingContent = await readFile(profilePath, 'utf8');
        } else {
            await writeFile(profilePath, '');
        }

        if (existingContent.includes('$env:BVM_DIR')) {
            return;
        }

        if (displayPrompt) {
            console.log(colors.cyan(`Configuring PowerShell environment in ${profilePath}...`));
        }

        // Use appendFile but ensure we're adding a newline
        await appendFile(profilePath, `\r\n${psStr}`);
        
        if (displayPrompt) {
            console.log(colors.green(`✓ Successfully configured BVM path in ${profilePath}`));
            console.log(colors.yellow(`Please restart your terminal to apply changes.`));
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
