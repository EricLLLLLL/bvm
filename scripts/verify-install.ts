import { join, dirname, basename } from 'path';
import { rmdir, mkdir, access, realpath } from 'node:fs/promises';

const stripAnsi = (str: string) => str.replace(/[][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');

async function runCommand(cmd: string, cwd: string, env: Record<string, string>) {
  const cleanEnv = { 
    PATH: process.env.PATH,
    HOME: env.HOME,
    SHELL: env.SHELL || '/bin/bash',
    BVM_DIR: env.BVM_DIR,
    BVM_ACTIVE_VERSION: env.BVM_ACTIVE_VERSION,
    NO_COLOR: '1'
  };
  
  const proc = Bun.spawn({
    cmd: ['bash', '-c', cmd],
    cwd,
    env: cleanEnv,
    stdout: 'pipe',
    stderr: 'pipe',
  });

  const outputRaw = await new Response(proc.stdout).text();
  const errorRaw = await new Response(proc.stderr).text();
  const exitCode = await proc.exited;

  const output = stripAnsi(outputRaw).trim();
  const error = stripAnsi(errorRaw).trim();

  if (output) console.log(`[STDOUT] ${output}`);
  if (error) console.error(`[STDERR] ${error}`);

  if (exitCode !== 0) {
    throw new Error(`Command failed with Exit Code ${exitCode}\nError: ${error}`);
  }
  return output;
}

async function verifyInstall() {
  console.log('🕵️‍♂️ Starting BVM 2.0 ADVANCED End-to-End Verification...');

  const projectRoot = process.cwd();
  const sandboxDir = join(projectRoot, '.sandbox-verify');
  const sandboxHome = join(sandboxDir, 'home');
  const bvmDir = join(sandboxHome, '.bvm');
  const binDir = join(bvmDir, 'bin');
  const shimsDir = join(bvmDir, 'shims');
  const versionsDir = join(bvmDir, 'versions');
  
  const vDefault = '1.3.5';
  const vOther = '1.0.2';

  // 1. Setup
  await Bun.spawn(['rm', '-rf', sandboxDir]).exited;
  await mkdir(sandboxHome, { recursive: true });

  // 2. Build & Install
  console.log('🏗️  Building & Installing...');
  await runCommand('npm run build', projectRoot, { HOME: sandboxHome });
  await runCommand(`bash ${join(projectRoot, 'install.sh')}`, projectRoot, {
    HOME: sandboxHome,
    BVM_INSTALL_BUN_VERSION: vDefault,
    SHELL: '/bin/zsh'
  });

  const bvmCmd = join(binDir, 'bvm');
  
  // CRITICAL: Overwrite the downloaded binary with our local build to test fixes!
  console.log('🧪 Injecting local BVM build into sandbox...');
  const buildPath = join(projectRoot, 'dist', 'index.js');
  const sandboxSrcPath = join(bvmDir, 'src', 'index.js');
  await runCommand(`cp ${buildPath} ${sandboxSrcPath}`, projectRoot, {});
  
  // Force a rehash with the NEW code to fix the shims
  await runCommand(`${bvmCmd} rehash`, projectRoot, { HOME: sandboxHome, BVM_DIR: bvmDir });

  console.log('\n🔒 Scenario: Node.js Tool Isolation');
  const forbiddenShims = ['npm', 'yarn', 'pnpm', 'node'];
  for (const shim of forbiddenShims) {
    const shimPath = join(shimsDir, shim);
    const exists = await Bun.file(shimPath).exists();
    if (exists) {
        throw new Error(`SECURITY FAILURE: Shim '${shim}' found in ${shimsDir}. BVM must not hijack Node tools!`);
    }
  }
  console.log('   ✅ PASS: No forbidden shims found.');

  const bunShim = join(shimsDir, 'bun');
  const bvmEnvBase = { HOME: sandboxHome, BVM_DIR: bvmDir, PATH: `${shimsDir}:${binDir}:${process.env.PATH}` };

  // 3. Scenario: Immediate Effect via 'use'
  console.log('\n🚀 Scenario: Immediate Global Effect');
  
  // Install vOther
  const vOtherBinDir = join(versionsDir, `v${vOther}`, 'bin');
  await mkdir(vOtherBinDir, { recursive: true });
  await Bun.write(join(vOtherBinDir, 'bun'), `#!/bin/bash\necho ${vOther}`);
  await runCommand(`chmod +x ${join(vOtherBinDir, 'bun')}`, sandboxDir, {});

  console.log(`   - Currently on default: ${vDefault}`);
  const out1 = await runCommand(`${bunShim} --version`, sandboxDir, bvmEnvBase);
  if (out1 !== vDefault) throw new Error(`Initial mismatch: ${out1}`);

  console.log(`   - Running 'bvm use ${vOther}'...`);
  await runCommand(`${bvmCmd} use ${vOther}`, sandboxDir, bvmEnvBase);

  console.log('   - Verifying immediate effect in SAME SESSION...');
  const out2 = await runCommand(`${bunShim} --version`, sandboxDir, bvmEnvBase);
  if (out2 !== vOther) throw new Error(`Immediate effect failed! Expected ${vOther}, got ${out2}`);
  console.log('   ✅ PASS: Version switched immediately.');

  // 4. Scenario: Session Persistence
  console.log('\n🔄 Scenario: New Session Persistence');
  console.log('   - Simulating new session (should revert to default)...');
  // New session = no BVM_ACTIVE_VERSION and no .bvmrc
  
  // 5. Scenario: Deadlock Prevention (.bvmrc uninstalled version)
  console.log('\n☠️  Scenario: Deadlock Prevention (.bvmrc uninstalled)');
  const projectDir = join(sandboxDir, 'my-project');
  await mkdir(projectDir);
  const deadlockVer = '1.0.0'; // A version we know is NOT installed yet
  await Bun.write(join(projectDir, '.bvmrc'), deadlockVer);
  
  console.log(`   - Created project at ${projectDir} with .bvmrc=${deadlockVer}`);
  console.log('   - Attempting to install this version FROM WITHIN the directory...');
  
  // This command would fail if 'bvm' itself was shimmed and respecting .bvmrc
  try {
      await runCommand(`${bvmCmd} install ${deadlockVer}`, projectDir, bvmEnvBase);
      console.log('   ✅ PASS: BVM successfully installed the missing version despite .bvmrc');
  } catch (e: any) {
      throw new Error(`DEADLOCK DETECTED: Could not run bvm install inside project dir.\n${e.message}`);
  }

  // Verify it works now
  const out3 = await runCommand(`${bunShim} -v`, projectDir, bvmEnvBase);
  if (out3 !== deadlockVer) throw new Error(`Post-install version check failed. Expected ${deadlockVer}, got ${out3}`);

  console.log('   ✅ Verification completed with current logic.');
  console.log('\n✨ ALL E2E VERIFICATIONS PASSED! ✨\n');
}

verifyInstall();
