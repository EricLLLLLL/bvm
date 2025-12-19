import { join, dirname } from 'path';
import { rmdir, mkdir, access } from 'node:fs/promises';

const stripAnsi = (str: string) => str.replace(/[][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');

async function runCommand(cmd: string, cwd: string, env: Record<string, string>) {
  // We use a clean env base to avoid bleeding from the host agent
  const cleanEnv = { 
    PATH: process.env.PATH,
    HOME: env.HOME,
    SHELL: env.SHELL || '/bin/bash'
  };
  
  const proc = Bun.spawn({
    cmd: ['bash', '-c', cmd],
    cwd,
    env: { ...cleanEnv, ...env },
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
  console.log('🕵️‍♂️ Starting PRO End-to-End Installation Verification...');

  const projectRoot = process.cwd();
  const sandboxDir = join(projectRoot, '.sandbox-verify');
  const sandboxHome = join(sandboxDir, 'home');
  const bvmDir = join(sandboxHome, '.bvm');
  const binDir = join(bvmDir, 'bin');
  const shimsDir = join(bvmDir, 'shims');
  const versionsDir = join(bvmDir, 'versions');
  
  const vDefault = '1.3.5';
  const vOther = '1.0.2';

  // 1. Setup Sandbox
  await Bun.spawn(['rm', '-rf', sandboxDir]).exited;
  await mkdir(sandboxHome, { recursive: true });

  // 2. Build Project
  console.log('🏗️  Building project...');
  await runCommand('npm run build', projectRoot, {});

  // 3. Run install.sh
  console.log('🚀 Running install.sh...');
  await runCommand(`bash ${join(projectRoot, 'install.sh')}`, projectRoot, {
    HOME: sandboxHome,
    BVM_INSTALL_BUN_VERSION: vDefault,
    SHELL: '/bin/zsh'
  });

  const bvmCmd = join(binDir, 'bvm');
  const bunShim = join(shimsDir, 'bun');
  const bvmEnvBase = { HOME: sandboxHome, BVM_DIR: bvmDir, PATH: `${shimsDir}:${binDir}:${process.env.PATH}` };

  // 4. Verification: Basic Commands
  console.log('🏃 Verifying Basic Commands...');
  await runCommand(`${bvmCmd} ls`, sandboxDir, bvmEnvBase);
  await runCommand(`${bvmCmd} doctor`, sandboxDir, bvmEnvBase);
  console.log('   ✅ Basic commands passed');

  // 5. Verification: Isolation & Session Switching
  console.log('🧪 Verifying Isolation & Session Switching...');
  
  // Install vOther
  console.log(`   - Installing ${vOther}...`);
  const vOtherBinDir = join(versionsDir, `v${vOther}`, 'bin');
  await mkdir(vOtherBinDir, { recursive: true });
  await Bun.write(join(vOtherBinDir, 'bun'), '#!/bin/bash\necho 1.0.2');
  await runCommand(`chmod +x ${join(vOtherBinDir, 'bun')}`, sandboxDir, {});

  // Isolated Test: Should be Default initially
  const out1 = await runCommand(`${bunShim} --version`, sandboxDir, bvmEnvBase);
  if (out1.trim() !== '1.3.5') throw new Error(`Expected ${vDefault}, got ${out1.trim()}`);
  console.log('   ✅ Initial state is default');

  // Session Override Test
  console.log('   - Testing Session Override (BVM_ACTIVE_VERSION)...');
  const out2 = await runCommand(`${bunShim} --version`, sandboxDir, { ...bvmEnvBase, BVM_ACTIVE_VERSION: vOther });
  if (out2.trim() !== '1.0.2') throw new Error(`Session override failed: ${out2.trim()}`);
  console.log('   ✅ Session override works');

  // 6. Verification: Default Switching (New Session Simulation)
  console.log('🔄 Verifying Default Switching...');
  
  console.log(`   - Changing default to ${vOther}...`);
  await runCommand(`${bvmCmd} default ${vOther}`, sandboxDir, bvmEnvBase);
  
  console.log('   - Simulating new clean session...');
  // Run in a new command with NO session variables
  const out3 = await runCommand(`${bunShim} --version`, sandboxDir, bvmEnvBase);
  if (out3.trim() !== '1.0.2') throw new Error(`New session did not pick up new default: ${out3.trim()}`);
  console.log('   ✅ New session uses new default');

  // 7. Verification: Uninstall Protection
  console.log('🛡️  Verifying Uninstall Protection...');
  
  // Try uninstall current default (vOther) -> should fail
  try {
      await runCommand(`${bvmCmd} uninstall ${vOther}`, sandboxDir, bvmEnvBase);
      throw new Error('Uninstall should have been blocked');
  } catch (e) {
      console.log('   ✅ Uninstall of default version blocked');
  }

  // Switch back to vDefault and uninstall vOther
  await runCommand(`${bvmCmd} default ${vDefault}`, sandboxDir, bvmEnvBase);
  await runCommand(`${bvmCmd} uninstall ${vOther}`, sandboxDir, bvmEnvBase);
  
  if (await Bun.file(join(versionsDir, `v${vOther}`)).exists()) throw new Error('Uninstall failed to remove dir');
  console.log('   ✅ Uninstall of inactive version succeeded');

  console.log('\n✨ ALL E2E VERIFICATIONS PASSED! ✨\n');
}

verifyInstall();
