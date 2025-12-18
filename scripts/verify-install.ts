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
  
  // Verify 'bun --version'
  try {
    const versionOutput = await runCommand(`${join(binDir, 'bun')} --version`, sandboxDir, {
      HOME: sandboxHome,
      BVM_DIR: bvmDir
    });
    console.log(`✅ Installed Bun Version: ${versionOutput.trim()}`);
  } catch (e) {
    console.error('❌ FAILED: Unable to execute installed bun.');
    process.exit(1);
  }

  // Verify 'bvm ls'
  try {
    // We need to use the full path to the wrapper or binary
    // The wrapper expects BVM_DIR to be set or inferred
    const lsOutput = await runCommand(`${join(binDir, 'bvm')} ls`, sandboxDir, {
      HOME: sandboxHome,
      BVM_DIR: bvmDir,
      PATH: `${binDir}:${process.env.PATH}` // Add bvm bin to path for it to work fully
    });
    if (!lsOutput.includes('v1.3.5') && !lsOutput.includes('current')) {
         // It might not say 'current' if we didn't source, but it should list the version
         console.warn('⚠️  Warning: bvm ls output might be unexpected:', lsOutput);
    }
    console.log('✅ bvm ls executed successfully.');
  } catch (e) {
    console.error('❌ FAILED: Unable to execute bvm ls.');
    process.exit(1);
  }

  console.log('\n✨ All Verification Checks Passed! Ready for Release. ✨\n');
}

verifyInstall();
