import { join, dirname } from 'path';
import { homedir } from 'os';
import { pathExists, removeDir, getInstalledVersions, normalizeVersion, resolveVersion, createSymlink } from '../utils';
import { mkdir } from 'fs/promises'; // Import mkdir
import { BVM_BIN_DIR, BVM_DIR, EXECUTABLE_NAME, BVM_SHIMS_DIR, BVM_SRC_DIR, BVM_VERSIONS_DIR, BVM_CURRENT_DIR } from '../constants';
import { colors, confirm } from '../utils/ui';
import { chmod } from 'fs/promises';
import { useBunVersion } from './use';
import { 
    BVM_INIT_SH_TEMPLATE, 
    BVM_INIT_FISH_TEMPLATE, 
    BVM_SHIM_SH_TEMPLATE, 
    BVM_SHIM_JS_TEMPLATE,
    BVM_BUN_CMD_TEMPLATE,
    BVM_BUNX_CMD_TEMPLATE,
    BVM_WRAPPER_CMD_TEMPLATE
} from '../templates/init-scripts';

/**
 * Detects the user's shell and configures the PATH.
 */
export async function configureShell(displayPrompt: boolean = true): Promise<void> {
  // 1. Refresh shims and wrappers (Self-Healing)
  await recreateShims(displayPrompt);

  // Windows Support
  if (process.platform === 'win32') {
      await configureWindows(displayPrompt);
      return;
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
        if (await pathExists(join(homedir(), '.bashrc'))) {
             configFile = join(homedir(), '.bashrc');
        } else {
             configFile = join(homedir(), '.bash_profile');
        }
    } else {
        configFile = join(homedir(), '.bashrc');
    }
  } else if (shell.includes('fish')) {
    shellName = 'fish';
    configFile = join(homedir(), '.config', 'fish', 'config.fish');
  } else {
    // Fallback: Detect based on config file existence
    if (await pathExists(join(homedir(), '.zshrc'))) {
        shellName = 'zsh';
        configFile = join(homedir(), '.zshrc');
    } else if (await pathExists(join(homedir(), '.config', 'fish', 'config.fish'))) {
        shellName = 'fish';
        configFile = join(homedir(), '.config', 'fish', 'config.fish');
    } else if (await pathExists(join(homedir(), '.bashrc'))) {
        shellName = 'bash';
        configFile = join(homedir(), '.bashrc');
    } else if (await pathExists(join(homedir(), '.bash_profile'))) {
        shellName = 'bash';
        configFile = join(homedir(), '.bash_profile');
    } else {
        if (displayPrompt) {
            console.log(colors.yellow(`Could not detect a supported shell (zsh, bash, fish). Please manually add ${BVM_BIN_DIR} to your PATH.`));
        }
        return;
    }
  }

  // Copy bvm-init.sh
  const bvmInitShPath = join(BVM_BIN_DIR, 'bvm-init.sh');
  await Bun.write(bvmInitShPath, BVM_INIT_SH_TEMPLATE);
  await chmod(bvmInitShPath, 0o755);

  // Copy bvm-init.fish
  const bvmInitFishPath = join(BVM_BIN_DIR, 'bvm-init.fish');
  await Bun.write(bvmInitFishPath, BVM_INIT_FISH_TEMPLATE);
  await chmod(bvmInitFishPath, 0o755);

  let content = '';
  try {
    content = await Bun.file(configFile).text();
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      await Bun.write(configFile, '');
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
export PATH="$BVM_DIR/shims:$BVM_DIR/bin:$BVM_DIR/current/bin:$PATH"
# Ensure current link exists for PATH consistency
if [ ! -L "$BVM_DIR/current" ] && [ -f "$BVM_DIR/aliases/default" ]; then
    ln -sf "$BVM_DIR/versions/$(cat "$BVM_DIR/aliases/default")" "$BVM_DIR/current"
fi
${endMarker}`;

  const fishConfigBlock = `# >>> bvm initialize >>>
# !! Contents within this block are managed by 'bvm setup' !!
set -Ux BVM_DIR "${BVM_DIR}"
fish_add_path "$BVM_DIR/shims"
fish_add_path "$BVM_DIR/bin"
fish_add_path "$BVM_DIR/current/bin"
# Ensure current link exists
if not test -L "$BVM_DIR/current"
    if test -f "$BVM_DIR/aliases/default"
        ln -sf "$BVM_DIR/versions/$(cat "$BVM_DIR/aliases/default")" "$BVM_DIR/current"
    end
end
# <<< bvm initialize <<<`;

  if (displayPrompt) {
    console.log(colors.cyan(`Configuring ${shellName} environment in ${configFile}...`));
  }

  try {
    let newContent = content;
    // Escaping special characters in markers for safe regex usage
    const escapedStart = startMarker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const escapedEnd = endMarker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const blockRegex = new RegExp(`${escapedStart}[\\s\\S]*?${escapedEnd}`, 'g');

    if (content.includes(startMarker)) {
      // Remove all existing blocks to ensure we can move the latest one to the end
      newContent = content.replace(blockRegex, '').trim();
    }
    
    // Always append to the end to ensure highest priority in PATH
    const configToAppend = shellName === 'fish' ? fishConfigBlock : configBlock;
    newContent = (newContent ? newContent + '\n\n' : '') + configToAppend + '\n';

    if (newContent !== content) {
      await Bun.write(configFile, newContent);
      if (displayPrompt) {
        console.log(colors.green(`✓ Successfully updated BVM configuration in ${configFile}`));
        console.log(colors.gray('  (Moved configuration to the end of file to ensure PATH precedence)'));
      }
    } else if (displayPrompt) {

    }

    if (displayPrompt) {
        console.log(colors.yellow(`Please restart your terminal or run "source ${configFile}" to apply changes.`));
    }

    // Ensure 'current' symlink is established
    try {
        await useBunVersion('default', { silent: true });
    } catch (e) {
        // Ignore if no default version set yet
    }

    // NEW: Trigger rehash to fix any existing global shims (self-healing)
    try {
        await rehash();
    } catch (e) {
        // Non-fatal
    }
  } catch (error: any) {
    console.error(colors.red(`Failed to write to ${configFile}: ${error.message}`));
  }
}

async function recreateShims(displayPrompt: boolean) {
    if (displayPrompt) console.log(colors.cyan('Refreshing shims and wrappers...'));
    
    await mkdir(BVM_BIN_DIR, { recursive: true }); // Use mkdir
    await mkdir(BVM_SHIMS_DIR, { recursive: true }); // Use mkdir

    const isWindows = process.platform === 'win32';
    const bvmDirWin = BVM_DIR.replace(/\//g, '\\');

    if (isWindows) {
        // Use external templates for Windows and inject absolute paths
        await Bun.write(join(BVM_BIN_DIR, 'bvm-shim.js'), BVM_SHIM_JS_TEMPLATE);
        await Bun.write(join(BVM_BIN_DIR, 'bvm.cmd'), BVM_WRAPPER_CMD_TEMPLATE.split('__BVM_DIR__').join(bvmDirWin));
        await Bun.write(join(BVM_SHIMS_DIR, 'bun.cmd'), BVM_BUN_CMD_TEMPLATE.split('__BVM_DIR__').join(bvmDirWin));
        await Bun.write(join(BVM_SHIMS_DIR, 'bunx.cmd'), BVM_BUNX_CMD_TEMPLATE.split('__BVM_DIR__').join(bvmDirWin));
    } else {
        // Create bvm-shim.sh
        const bvmShimShPath = join(BVM_BIN_DIR, 'bvm-shim.sh');
        await Bun.write(bvmShimShPath, BVM_SHIM_SH_TEMPLATE);
        await chmod(bvmShimShPath, 0o755);

        // Create bvm wrapper
        let bvmWrapper = '';
        const bunkerBun = join(BVM_DIR, 'runtime', 'current', 'bin', 'bun');
        const bvmSrc = join(BVM_SRC_DIR, 'index.js');

        if (process.env.BVM_INSTALL_SOURCE === 'npm') {
            // NPM-Compatible Wrapper (Strict Isolation + Node Fallback)
            bvmWrapper = `#!/bin/bash
export BVM_DIR="${BVM_DIR}"
export BVM_INSTALL_SOURCE="npm"
if [ -f "${bunkerBun}" ]; then
  exec "${bunkerBun}" "${bvmSrc}" "$@"
elif command -v bun >/dev/null 2>&1; then
  exec bun "${bvmSrc}" "$@"
else
  # Last resort: use the node entry point if it's an NPM install
  # This is only possible if we are in the original NPM environment
  # We'll leave this as a hint or a very specific fallback
  echo "Error: BVM Bunker Runtime not found. Attempting emergency fallback..."
  node -e "require('child_process').spawnSync('node', [require('path').join(process.env.BVM_DIR, '../', 'bin/bvm-npm.js'), ...process.argv.slice(1)], {stdio:'inherit'})" "\$@"
fi
`;
        } else {
            // Standard Wrapper (Strict Isolation)
            bvmWrapper = `#!/bin/bash\nexport BVM_DIR="${BVM_DIR}"\nexec "${bunkerBun}" "${bvmSrc}" "$@"`;
        }

        const bvmPath = join(BVM_BIN_DIR, 'bvm');
        await Bun.write(bvmPath, bvmWrapper);
        await chmod(bvmPath, 0o755);

        for (const cmd of ['bun', 'bunx']) {
            const shim = `#!/bin/bash\nexport BVM_DIR="${BVM_DIR}"\nexec "${BVM_DIR}/bin/bvm-shim.sh" "${cmd}" "$@"`;
            const shimPath = join(BVM_SHIMS_DIR, cmd);
            await Bun.write(shimPath, shim);
            await chmod(shimPath, 0o755);
        }
    }
}

async function configureWindows(displayPrompt: boolean = true): Promise<void> {
    const bvmBinPath = join(BVM_BIN_DIR);
    const bvmShimsPath = join(BVM_SHIMS_DIR);
    const bvmCurrentBinPath = join(BVM_DIR, 'current', 'bin');

    if (displayPrompt) {
        console.log(colors.cyan('Configuring Windows environment variables (Registry)...'));
    }

    // PowerShell script to safely update User PATH and BVM_DIR
    // 1. Sets BVM_DIR
    // 2. Prepend shims, bin and current/bin to PATH if not already present
    const psCommand = `
        $targetDir = "${BVM_DIR}";
        $shimsPath = "${bvmShimsPath}";
        $binPath = "${bvmBinPath}";
        $currentBinPath = "${bvmCurrentBinPath}";
        
        # Set BVM_DIR
        [Environment]::SetEnvironmentVariable("BVM_DIR", $targetDir, "User");
        
        # Get current PATH
        $oldPath = [Environment]::GetEnvironmentVariable("PATH", "User");
        $paths = $oldPath -split ";"
        
        $newPaths = @()
        if ($paths -notcontains $shimsPath) { $newPaths += $shimsPath }
        if ($paths -notcontains $binPath) { $newPaths += $binPath }
        if ($paths -notcontains $currentBinPath) { $newPaths += $currentBinPath }
        
        if ($newPaths.Count -gt 0) {
            $newPathString = (($newPaths + $paths) -join ";").Trim(";")
            [Environment]::SetEnvironmentVariable("PATH", $newPathString, "User");
            return "SUCCESS"
        }
        return "ALREADY_SET"
    `;

    try {
        const proc = Bun.spawnSync({
            cmd: ['powershell', '-NoProfile', '-Command', psCommand],
            stdout: 'pipe',
            stderr: 'pipe'
        });

        const result = proc.stdout.toString().trim();
        if (proc.success) {
            if (displayPrompt) {
                if (result === 'SUCCESS') {
                    console.log(colors.green('✓ Successfully updated User PATH and BVM_DIR in Registry.'));
                } else {
                    console.log(colors.gray('✓ Environment variables are already up to date.'));
                }
            }
        } else {
            throw new Error(proc.stderr.toString());
        }
    } catch (e: any) {
        console.error(colors.red(`Failed to update environment variables: ${e.message}`));
    }

    // Also try to update PowerShell profile as a secondary convenience, but make it completely non-fatal
    let profilePath = '';
    try {
        const proc = Bun.spawnSync({
            cmd: ['powershell', '-NoProfile', '-Command', 'echo $PROFILE.CurrentUserAllHosts'],
            stdout: 'pipe'
        });
        profilePath = proc.stdout.toString().trim();
        if (profilePath) {
            // We use native powershell to ensure directory exists to handle OneDrive quirks better
            Bun.spawnSync({
                cmd: ['powershell', '-NoProfile', '-Command', `if (!(Test-Path "${dirname(profilePath)}")) { New-Item -ItemType Directory -Force -Path "${dirname(profilePath)}" }`],
                stderr: 'pipe'
            });
            await updatePowerShellProfile(profilePath, false); // Silent update
        }
    } catch (e) {
        // Ignore profile errors since we already updated the Registry
    }

    if (displayPrompt) {
        console.log(colors.yellow('Please restart your terminal or IDE to apply the new PATH.'));
    }
}

export async function updatePowerShellProfile(profilePath: string, displayPrompt: boolean = true): Promise<void> {
    const psStr = `
# BVM Configuration
$env:BVM_DIR = "${BVM_DIR}"
$env:PATH = "$env:BVM_DIR\\shims;$env:BVM_DIR\\bin;$env:BVM_DIR\\current\\bin;$env:PATH"
# Auto-activate default version
if (Test-Path "$env:BVM_DIR\\bin\\bvm.cmd") {
    & "$env:BVM_DIR\\bin\\bvm.cmd" use default --silent *>$null
}
`;

    try {
        let existingContent = '';
        if (await pathExists(profilePath)) {
            existingContent = await Bun.file(profilePath).text();
        } else {
            await Bun.write(profilePath, '');
        }

        if (existingContent.includes('$env:BVM_DIR')) {
            if (displayPrompt) {
                 console.log(colors.gray('✓ Configuration is already up to date.'));
            }
            return;
        }

        if (displayPrompt) {
            console.log(colors.cyan(`Configuring PowerShell environment in ${profilePath}...`));
        }

        await Bun.write(profilePath, existingContent + `\r\n${psStr}`);
        
        if (displayPrompt) {
            console.log(colors.green(`✓ Successfully configured BVM path in ${profilePath}`));
            console.log(colors.yellow(`Please restart your terminal to apply changes.`));
        }
    } catch (error: any) {
        console.error(colors.red(`Failed to write to ${profilePath}: ${error.message}`));
    }
}