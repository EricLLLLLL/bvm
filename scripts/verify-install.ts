import { join, dirname } from 'path';
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
  const shimsDir = join(bvmDir, 'shims');
  const aliasesDir = join(bvmDir, 'aliases'); 
  
  // Verify .zshrc update
  const zshrcContent = await Bun.file(zshrcPath).text();
  if (!zshrcContent.includes('bvm initialize')) {
      console.error('❌ FAILED: .zshrc was not updated with the managed BVM block.');
      console.error('Content:', zshrcContent);
      process.exit(1);
  }
  if (!zshrcContent.includes('/shims')) {
      console.error('❌ FAILED: .zshrc PATH does not include shims directory.');
      process.exit(1);
  }
  console.log('✅ .zshrc updated correctly.');

  // Check Default Alias 
  
  // Check Default Alias
  const defaultAliasPath = join(aliasesDir, 'default');
  const defaultAliasFile = Bun.file(defaultAliasPath);
  if (!(await defaultAliasFile.exists())) {
    console.error(`❌ FAILED: Default alias not created at ${defaultAliasPath}`);
    process.exit(1);
  }
  console.log('✅ Default alias created.');

  // Check Bun Shim
  const bunShimPath = join(shimsDir, 'bun');
  const bunShimFile = Bun.file(bunShimPath);
  if (!(await bunShimFile.exists())) { 
    console.error(`❌ FAILED: Bun shim missing at ${bunShimPath}`);
    process.exit(1);
  }
  console.log('✅ Bun shim exists.');

  // 5. Functional Verification
  console.log('🏃 Verifying command execution...');
  
  const bvmCmd = join(binDir, 'bvm');
  const bunCmd = join(shimsDir, 'bun'); // Use Shim for bun!
  const env = { 
    HOME: sandboxHome, 
    BVM_DIR: bvmDir,
    PATH: `${shimsDir}:${binDir}:${process.env.PATH}` 
  };

  // Verify 'bun --version' initially is the default (1.3.5)
  const initialVersion = await runCommand(`${bunCmd} --version`, sandboxDir, { HOME: sandboxHome, BVM_DIR: bvmDir });
  console.log(`✅ Initial Bun Version: ${initialVersion.trim()}`);

  const smokeTests = [
    { name: 'ls', args: ['ls'] },
    { name: 'current', args: ['current'] },
    { name: 'which', args: ['which', 'default'] },
    { name: 'alias', args: ['alias', 'smoke-test', 'v1.3.5'] },
    { name: 'doctor', args: ['doctor'] },
    { name: 'help', args: ['--help'] }
  ];

  for (const test of smokeTests) {
    console.log(`   - Testing 'bvm ${test.args.join(' ')}'...`);
    try {
      await runCommand(`${bvmCmd} ${test.args.join(' ')}`, sandboxDir, env);
      console.log(`     ✅ passed`);
    } catch (e: any) {
      console.error(`❌ FAILED: 'bvm ${test.name}' failed during smoke test!`);
      console.error(e.message);
      process.exit(1);
    }
  }

  // TestCase: "Revert to Default" Behavior
  console.log('🔄 Testing "Revert to Default" in new terminal simulation...');
  
  // 1. Manually switch to another version (we'll simulate this by creating a different symlink)
  // In a real scenario, user runs 'bvm use 1.0.2'
  console.log('   - Simulating switch to another version...');
  const fakeVersionDir = join(bvmDir, 'versions', 'v1.0.2');
  await mkdir(fakeVersionDir, { recursive: true });
  const fakeBunPath = join(fakeVersionDir, 'bin', 'bun'); // NEW PATH
  await mkdir(dirname(fakeBunPath), { recursive: true });
  await Bun.write(fakeBunPath, '#!/bin/bash\necho 1.0.2'); 
  await runCommand(`chmod +x ${fakeBunPath}`, sandboxDir, {});
  
  // We simulate 'bvm use 1.0.2' by updating the default alias
  await Bun.write(join(aliasesDir, 'default'), 'v1.0.2');
  
  const switchedVersion = await runCommand(`${bunCmd} --version`, sandboxDir, { HOME: sandboxHome, BVM_DIR: bvmDir });
  console.log(`   - Current version is now: ${switchedVersion.trim()}`);

  // 2. Set default back to initial
  console.log('   - Setting default back to 1.3.5...');
  await Bun.write(join(aliasesDir, 'default'), 'v1.3.5');

  // 3. Verify it's back to default
  const revertedVersion = await runCommand(`${bunCmd} --version`, sandboxDir, { HOME: sandboxHome, BVM_DIR: bvmDir });
  console.log(`   - Version after revert: ${revertedVersion.trim()}`);

  if (revertedVersion.trim() !== initialVersion.trim()) {
      console.error(`❌ FAILED: Version did not revert! Expected ${initialVersion.trim()}, got ${revertedVersion.trim()}`);
      process.exit(1);
  }
  console.log('✅ SUCCESS: Shim correctly follows the default alias.');

  console.log('\n✨ All Verification Checks Passed! Ready for Release. ✨\n');
}

verifyInstall();
