import { join } from 'path';
import { rmdir, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';

async function runCommand(cmd: string, cwd: string, env: Record<string, string>) {
  const proc = Bun.spawn({
    cmd: ['bash', '-c', cmd],
    cwd,
    env: { ...process.env, ...env }, // Merge with current env but overwrite HOME
    stdout: 'pipe',
    stderr: 'pipe',
  });

  const output = await new Response(proc.stdout).text();
  const error = await new Response(proc.stderr).text();
  const exitCode = await proc.exited;

  if (output.trim()) console.log(output.trim());
  if (error.trim()) console.error(error.trim());

  if (exitCode !== 0) {
    throw new Error(`Command failed: ${cmd}\nExit Code: ${exitCode}\nError: ${error}\nOutput: ${output}`);
  }
  return output;
}

async function verifyInstall() {
  console.log('🕵️‍♂️ Starting End-to-End Installation Verification...');

  const projectRoot = process.cwd();
  const sandboxDir = join(projectRoot, '.sandbox-verify');
  
  // 1. Clean Sandbox
  console.log('🧹 Cleaning sandbox environment...');
  await Bun.spawn(['rm', '-rf', sandboxDir]).exited;
  await mkdir(sandboxDir, { recursive: true });

  // 2. Build Project
  console.log('🏗️  Building project...');
  await runCommand('npm run build', projectRoot, {});

  // 3. Run Install Script in Sandbox
  console.log('🚀 Running install.sh in sandbox...');
  const sandboxHome = join(sandboxDir, 'home');
  await mkdir(sandboxHome, { recursive: true });

  // TestCase: Simulate existing user with old config (missing init script)
  const zshrcPath = join(sandboxHome, '.zshrc');
  await Bun.write(zshrcPath, 'export BVM_DIR="$HOME/.bvm"\nexport PATH="$BVM_DIR/bin:$PATH"\n');

  try {
    await runCommand(`bash ${join(projectRoot, 'install.sh')}`, projectRoot, {
      HOME: sandboxHome,
      SHELL: '/bin/zsh' // Force Zsh detection
    });
  } catch (e: any) {
    console.error('❌ install.sh failed:', e.message);
    process.exit(1);
  }

  // 4. Verify Critical Paths
  console.log('🔍 Verifying installation artifacts...');
  const bvmDir = join(sandboxHome, '.bvm');
  const binDir = join(bvmDir, 'bin');
  const aliasesDir = join(bvmDir, 'aliases'); 
  
  // Verify .zshrc update
  const zshrcContent = await Bun.file(zshrcPath).text();
  if (!zshrcContent.includes('bvm-init.sh')) {
      console.error('❌ FAILED: .zshrc was not updated with bvm-init.sh source command.');
      console.error('Content:', zshrcContent);
      process.exit(1);
  }
  console.log('✅ .zshrc updated with init script.');

  // Check Default Alias 
  
  // Check Default Alias
  const defaultAliasPath = join(aliasesDir, 'default');
  const defaultAliasFile = Bun.file(defaultAliasPath);
  if (!(await defaultAliasFile.exists())) {
    console.error(`❌ FAILED: Default alias not created at ${defaultAliasPath}`);
    process.exit(1);
  }
  console.log('✅ Default alias created.');

  // Check Bun Symlink
  const bunLinkPath = join(binDir, 'bun');
  const bunLinkFile = Bun.file(bunLinkPath);
  // Note: Bun.file().exists() returns false for broken symlinks, ensuring it's valid
  if (!(await bunLinkFile.exists())) { 
    console.error(`❌ FAILED: Bun symlink missing or broken at ${bunLinkPath}`);
    process.exit(1);
  }
  console.log('✅ Bun symlink exists and is valid.');

  // 5. Functional Verification
  console.log('🏃 Verifying command execution...');
  
  // Verify 'bun --version' initially is the default (1.3.5)
  const initialVersion = await runCommand(`${join(binDir, 'bun')} --version`, sandboxDir, { HOME: sandboxHome, BVM_DIR: bvmDir });
  console.log(`✅ Initial Bun Version: ${initialVersion.trim()}`);

  // TestCase: "Revert to Default" Behavior
  console.log('🔄 Testing "Revert to Default" in new terminal simulation...');
  
  // 1. Manually switch to another version (we'll simulate this by creating a different symlink)
  // In a real scenario, user runs 'bvm use 1.0.2'
  console.log('   - Simulating switch to another version...');
  const fakeVersionDir = join(bvmDir, 'versions', 'v1.0.2');
  await mkdir(fakeVersionDir, { recursive: true });
  const fakeBunPath = join(fakeVersionDir, 'bun');
  await Bun.write(fakeBunPath, '#!/bin/bash\necho 1.0.2'); 
  await runCommand(`chmod +x ${fakeBunPath}`, sandboxDir, {});
  await runCommand(`ln -sf ${fakeBunPath} ${join(binDir, 'bun')}`, sandboxDir, {});
  
  const switchedVersion = await runCommand(`${join(binDir, 'bun')} --version`, sandboxDir, { HOME: sandboxHome, BVM_DIR: bvmDir });
  console.log(`   - Current version is now: ${switchedVersion.trim()}`);

  // 2. Run the init script (This is what happens in every new terminal)
  console.log('   - Running bvm-init.sh (simulating new terminal)...');
  // Remove silent to see errors
  const initScriptPath = join(binDir, 'bvm-init.sh');
  let scriptContent = await Bun.file(initScriptPath).text();
  scriptContent = scriptContent.replace('--silent >/dev/null 2>&1 || true', ''); 
  await Bun.write(initScriptPath, scriptContent);

  await runCommand(`bash ${initScriptPath}`, sandboxDir, { 
    HOME: sandboxHome, 
    BVM_DIR: bvmDir,
    PATH: `${binDir}:${process.env.PATH}` 
  });

  // Debug: check where the symlink points
  const { readlink: readlinkFs } = require('node:fs/promises');
  const currentLink = await readlinkFs(join(binDir, 'bun'));
  console.log(`   - Symlink now points to: ${currentLink}`);

  // 3. Verify it's back to default
  const revertedVersion = await runCommand(`${join(binDir, 'bun')} --version`, sandboxDir, { HOME: sandboxHome, BVM_DIR: bvmDir });
  console.log(`   - Version after init: ${revertedVersion.trim()}`);

  if (revertedVersion.trim() !== initialVersion.trim()) {
      console.error(`❌ FAILED: Version did not revert to default! Expected ${initialVersion.trim()}, got ${revertedVersion.trim()}`);
      process.exit(1);
  }
  console.log('✅ SUCCESS: New terminal correctly reverts to default version.');

  console.log('\n✨ All Verification Checks Passed! Ready for Release. ✨\n');
}

verifyInstall();
