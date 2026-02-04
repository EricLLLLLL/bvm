import { join, dirname, basename } from 'path';
import { homedir } from 'os';
import { pathExists, removeDir, getInstalledVersions, normalizeVersion, resolveVersion, createSymlink, readDir, stat, readTextFile } from '../utils';
import { mkdir, rm } from 'fs/promises';
import { BVM_BIN_DIR, BVM_DIR, EXECUTABLE_NAME, BVM_SHIMS_DIR, BVM_SRC_DIR, BVM_VERSIONS_DIR, BVM_CURRENT_DIR, BVM_RUNTIME_DIR, OS_PLATFORM, BVM_ALIAS_DIR } from '../constants';
import { colors, confirm } from '../utils/ui';
import { chmod } from 'fs/promises';
import {
    BVM_INIT_SH_TEMPLATE,
    BVM_INIT_FISH_TEMPLATE,
    BVM_SHIM_SH_TEMPLATE,
    BVM_SHIM_JS_TEMPLATE,
    BVM_BUN_CMD_TEMPLATE,
    BVM_BUNX_CMD_TEMPLATE,
    BVM_WRAPPER_CMD_TEMPLATE,
    BVM_INIT_PS1_TEMPLATE
} from '../templates/init-scripts';

/**
 * Ensures versions/vX.X.X is a junction to runtime/vX.X.X on Windows.
 * This fixes issues where install.sh created Unix symlinks instead of Windows junctions.
 */
async function ensureVersionJunctions(): Promise<void> {
    if (OS_PLATFORM !== 'win32') return;

    try {
        if (!await pathExists(BVM_VERSIONS_DIR)) return;

        const versions = await readDir(BVM_VERSIONS_DIR);
        for (const version of versions) {
            if (!version.startsWith('v')) continue;

            const versionsPath = join(BVM_VERSIONS_DIR, version);
            const runtimePath = join(BVM_RUNTIME_DIR, version);

            // Check if versionsPath is a real directory (not a junction)
            try {
                const stats = await stat(versionsPath);
                if (!stats.isDirectory()) continue;

                // Check if it's a junction/symlink
                const isJunction = stats.mode !== undefined; // This is a rough check
            } catch {
                continue;
            }

            // Check if it's actually a junction by trying to read it as symlink
            try {
                const { readlink, lstat } = await import('fs/promises');
                const lstats = await lstat(versionsPath);
                if (lstats.isSymbolicLink()) continue; // Already a symlink/junction
            } catch {
                // Not a symlink, continue to fix
            }

            // versionsPath is a real directory, need to convert to junction
            console.log(colors.yellow(`[bvm] Fixing: versions/${version} -> runtime/${version}`));

            // Check content
            let versionsContent: string[] = [];
            let runtimeContent: string[] = [];
            try {
                versionsContent = await readDir(versionsPath);
            } catch {}
            try {
                runtimeContent = await readDir(runtimePath);
            } catch {}

            // Move content if runtime is empty
            if (runtimeContent.length === 0 && versionsContent.length > 0) {
                console.log(colors.gray(`  Moving content from versions to runtime...`));
                // Move files and directories
                for (const item of versionsContent) {
                    const src = join(versionsPath, item);
                    const dest = join(runtimePath, item);
                    try {
                        await rename(src, dest);
                    } catch (e) {
                        // If rename fails, try copy then delete
                        try {
                            await Bun.write(Bun.file(dest), Bun.file(src));
                            await rm(src);
                        } catch {}
                    }
                }
            }

            // Remove the real directory
            try {
                await rm(versionsPath, { recursive: true, force: true });
            } catch (e) {
                console.log(colors.gray(`  Could not remove versions dir: ${e}`));
                continue;
            }

            // Create junction using createSymlink (which uses junction type on Windows)
            try {
                await createSymlink(runtimePath, versionsPath);
                console.log(colors.green(`  [OK] Junction created`));
            } catch (e) {
                console.log(colors.red(`  [FAIL] Could not create junction: ${e}`));
            }
        }
    } catch (e) {
        // Ignore errors
    }
}

async function rename(src: string, dest: string) {
    const { rename } = await import('fs/promises');
    await rename(src, dest);
}

/**
 * Detects the user's shell and configures the PATH.
 */
export async function configureShell(displayPrompt: boolean = true): Promise<void> {
  // 0. Fix versions -> runtime junction structure on Windows
  await ensureVersionJunctions();

  // 1. Refresh shims and wrappers (Self-Healing)
  await recreateShims(displayPrompt);

  // Windows Support
  if (process.platform === 'win32') {
      await configureWindows(displayPrompt);
      return;
  }

  // Unix Support (Mac/Linux)
  const shell = process.env.SHELL || '';
  const home = process.env.HOME || homedir();
  let configFile = '';
  let shellName = '';

  if (shell.includes('zsh')) {
    shellName = 'zsh';
    configFile = join(home, '.zshrc');
  } else if (shell.includes('bash')) {
    shellName = 'bash';
    if (process.platform === 'darwin') {
        if (await pathExists(join(home, '.bashrc'))) {
             configFile = join(home, '.bashrc');
        } else {
             configFile = join(home, '.bash_profile');
        }
    } else {
        configFile = join(home, '.bashrc');
    }
  } else if (shell.includes('fish')) {
    shellName = 'fish';
    configFile = join(home, '.config', 'fish', 'config.fish');
  } else {
    // Fallback: Detect based on config file existence
    if (await pathExists(join(home, '.zshrc'))) {
        shellName = 'zsh';
        configFile = join(home, '.zshrc');
    } else if (await pathExists(join(home, '.config', 'fish', 'config.fish'))) {
        shellName = 'fish';
        configFile = join(home, '.config', 'fish', 'config.fish');
    } else if (await pathExists(join(home, '.bashrc'))) {
        shellName = 'bash';
        configFile = join(home, '.bashrc');
    } else if (await pathExists(join(home, '.bash_profile'))) {
        shellName = 'bash';
        configFile = join(home, '.bash_profile');
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
# We add shims and bin to the front of PATH for priority.
# We add current/bin to the END of PATH to satisfy Bun's checks without interfering with BVM shims.
export PATH="$BVM_DIR/shims:$BVM_DIR/bin:$PATH:$BVM_DIR/current/bin"
# Shell integration (self-heal PATH order + refresh hash on bvm use)
if [ -f "$BVM_DIR/bin/bvm-init.sh" ]; then
    source "$BVM_DIR/bin/bvm-init.sh"
fi
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
# Append current/bin to satisfy Bun checks without overriding shims
fish_add_path --append "$BVM_DIR/current/bin"
# Shell integration (self-heal PATH order + refresh on bvm use)
if test -f "$BVM_DIR/bin/bvm-init.fish"
    source "$BVM_DIR/bin/bvm-init.fish"
end
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

    // Ensure 'current' symlink exists (do NOT switch versions here)
    await ensureCurrentSymlinkFromDefaultAlias();
  } catch (error: any) {
    console.error(colors.red(`Failed to write to ${configFile}: ${error.message}`));
  }
}

async function ensureCurrentSymlinkFromDefaultAlias(): Promise<void> {
    try {
        const defaultAliasPath = join(BVM_ALIAS_DIR, 'default');
        if (!(await pathExists(defaultAliasPath))) return;

        const raw = (await readTextFile(defaultAliasPath)).trim();
        const resolvedVersion = normalizeVersion(raw);
        const target = join(BVM_VERSIONS_DIR, resolvedVersion);
        if (!(await pathExists(target))) return;

        // If current already exists, leave it as-is.
        if (!(await pathExists(BVM_CURRENT_DIR))) {
            await createSymlink(target, BVM_CURRENT_DIR);
        }

        // Windows: keep runtime/current in sync with the active runtime.
        if (OS_PLATFORM === 'win32') {
            const runtimeTarget = join(BVM_RUNTIME_DIR, resolvedVersion);
            const runtimeCurrent = join(BVM_RUNTIME_DIR, 'current');
            const runtimePath = (await pathExists(runtimeTarget)) ? runtimeTarget : target;
            if (!(await pathExists(runtimeCurrent))) {
                await createSymlink(runtimePath, runtimeCurrent);
            }
        }
    } catch {
        // best-effort
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
        await Bun.write(join(BVM_BIN_DIR, 'bvm-init.ps1'), BVM_INIT_PS1_TEMPLATE);
        
        // Use the FULL templates with auto-rehash support (consistent with rehash.ts)
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

    if (displayPrompt) {
        console.log(colors.cyan('Configuring Windows environment variables (Registry)...'));
    }

    // PowerShell script to safely update User PATH and BVM_DIR
    // We include current/bin for native performance. Native shims now resolve via logical anchor.
    const psCommand = `
        $targetDir = "${BVM_DIR}";
        $shimsPath = "${bvmShimsPath}";
        $binPath = "${bvmBinPath}";
        $currentBinPath = "${join(BVM_DIR, 'current', 'bin')}";
        
        # Set BVM_DIR
        [Environment]::SetEnvironmentVariable("BVM_DIR", $targetDir, "User");
        
        # Get current PATH
        $oldPath = [Environment]::GetEnvironmentVariable("PATH", "User");
        $paths = $oldPath -split ";" | Where-Object { $_ -ne "" }
        
        $newPaths = @()
        if ($paths -notcontains $shimsPath) { $newPaths += $shimsPath }
        if ($paths -notcontains $binPath) { $newPaths += $binPath }
        
        # Append current/bin if missing (to satisfy Bun checks)
        $appendPath = ""
        if ($paths -notcontains $currentBinPath) { $appendPath = ";$currentBinPath" }
        
        $finalPathString = (($newPaths + $paths) -join ";") + $appendPath
        $finalPathString = $finalPathString.Trim(";")
        [Environment]::SetEnvironmentVariable("PATH", $finalPathString, "User");
        return "SUCCESS"
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
    const startMarker = '# >>> bvm initialize >>>';
    const endMarker = '# <<< bvm initialize <<<';
    const psStr = `
${startMarker}
# !! Contents within this block are managed by 'bvm setup' !!
$env:BVM_DIR = "${BVM_DIR}"
if (Test-Path "$env:BVM_DIR\\bin\\bvm-init.ps1") {
    . "$env:BVM_DIR\\bin\\bvm-init.ps1"
}
${endMarker}
`;

    try {
        let existingContent = '';
        if (await pathExists(profilePath)) {
            existingContent = await Bun.file(profilePath).text();
        } else {
            await Bun.write(profilePath, '');
        }

        let newContent = existingContent;
        if (existingContent.includes(startMarker)) {
            const escapedStart = startMarker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const escapedEnd = endMarker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const blockRegex = new RegExp(`${escapedStart}[\\s\\S]*?${escapedEnd}`, 'g');
            newContent = existingContent.replace(blockRegex, '').trim();
        }

        if (displayPrompt) {
            console.log(colors.cyan(`Configuring PowerShell environment in ${profilePath}...`));
        }

        newContent = (newContent ? newContent + `\r\n\r\n` : '') + psStr.trim() + `\r\n`;
        await Bun.write(profilePath, newContent);
        
        if (displayPrompt) {
            console.log(colors.green(`✓ Successfully configured BVM path in ${profilePath}`));
            console.log(colors.yellow(`Please restart your terminal to apply changes.`));
            console.log(colors.gray(`Tip (no restart): run ". $env:BVM_DIR\\bin\\bvm-init.ps1" in the current session.`));
        }
    } catch (error: any) {
        console.error(colors.red(`Failed to write to ${profilePath}: ${error.message}`));
        if (displayPrompt) {
            console.log(colors.yellow('You can still enable BVM for the current PowerShell session by running:'));
            console.log(colors.gray(`  $env:BVM_DIR = "${BVM_DIR}"`));
            console.log(colors.gray(`  . "$env:BVM_DIR\\bin\\bvm-init.ps1"`));
        }
    }
}
