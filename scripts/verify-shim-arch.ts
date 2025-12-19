import { join, dirname } from 'path';
import { rmdir, mkdir } from 'node:fs/promises';

async function runCommand(cmd: string, cwd: string, env: Record<string, string>) {
  const proc = Bun.spawn({
    cmd: ['bash', '-c', cmd],
    cwd,
    env: { ...process.env, ...env },
    stdout: 'pipe',
    stderr: 'pipe',
  });
  const output = await new Response(proc.stdout).text();
  const error = await new Response(proc.stderr).text();
  await proc.exited;
  return { output, error, exitCode: proc.exitCode };
}

async function verifyShimArchitecture() {
  console.log('🏗️  Verifying BVM 2.0 Shim Architecture...');
  const sandboxDir = join(process.cwd(), '.sandbox-shim');
  const bvmDir = join(sandboxDir, '.bvm');
  const shimsDir = join(bvmDir, 'shims');
  const versionsDir = join(bvmDir, 'versions');
  const aliasesDir = join(bvmDir, 'aliases');

  // 1. Setup Environment
  await runCommand(`rm -rf ${sandboxDir}`, process.cwd(), {});
  await mkdir(shimsDir, { recursive: true });
  await mkdir(aliasesDir, { recursive: true });

  // 2. Create Mock Versions
  const vDefault = '1.3.5';
  const vProject = '1.1.0';
  const vSession = '1.0.2';

  for (const v of [vDefault, vProject, vSession]) {
    const binDir = join(versionsDir, `v${v}`, 'bin');
    await mkdir(binDir, { recursive: true });
    // Mock 'bun' binary that prints version and BUN_INSTALL
    const script = `#!/bin/bash
echo "Bun v${v}"
echo "Install: $BUN_INSTALL"`;
    await Bun.write(join(binDir, 'bun'), script);
    await runCommand(`chmod +x ${join(binDir, 'bun')}`, process.cwd(), {});
  }

  // 3. Setup Default
  await Bun.write(join(aliasesDir, 'default'), `v${vDefault}`);

  // 4. Create Shim Script (The Core Logic)
  const shimScript = `#!/bin/bash
export BVM_DIR="${bvmDir}"
if [ -n "$BVM_VERSION" ]; then
  VERSION="$BVM_VERSION"
elif [ -f "$PWD/.bvmrc" ]; then
  VERSION="v$(cat "$PWD/.bvmrc")"
else
  VERSION=$(cat "$BVM_DIR/aliases/default")
fi
# Ensure version starts with v
[[ "$VERSION" != v* ]] && VERSION="v$VERSION"

VERSION_DIR="$BVM_DIR/versions/$VERSION"
export BUN_INSTALL="$VERSION_DIR"
export PATH="$VERSION_DIR/bin:$PATH"
exec "$VERSION_DIR/bin/bun" "$@"
`;
  const shimPath = join(shimsDir, 'bun');
  await Bun.write(shimPath, shimScript);
  await runCommand(`chmod +x ${shimPath}`, process.cwd(), {});

  // --- Tests ---

  // Test A: Default (New Terminal)
  console.log('\n🧪 Test A: New Terminal (Default)');
  const resA = await runCommand(`${shimPath}`, sandboxDir, {});
  if (resA.output.includes(`Bun v${vDefault}`)) console.log('✅ Default version loaded');
  else console.error('❌ Failed Default', resA);

  // Test B: Session Override
  console.log('\n🧪 Test B: Session Override (export BVM_VERSION)');
  const resB = await runCommand(`${shimPath}`, sandboxDir, { BVM_VERSION: `v${vSession}` });
  if (resB.output.includes(`Bun v${vSession}`)) console.log('✅ Session version loaded');
  else console.error('❌ Failed Session', resB);

  // Test C: Project Config (.bvmrc)
  console.log('\n🧪 Test C: Project Config (.bvmrc)');
  const projectDir = join(sandboxDir, 'my-project');
  await mkdir(projectDir);
  await Bun.write(join(projectDir, '.bvmrc'), vProject); // 1.1.0
  const resC = await runCommand(`${shimPath}`, projectDir, {}); // Run inside project dir
  if (resC.output.includes(`Bun v${vProject}`)) console.log('✅ .bvmrc version loaded');
  else console.error('❌ Failed .bvmrc', resC);

  // Test D: Isolation Check
  console.log('\n🧪 Test D: Global Package Isolation');
  if (resA.output.includes(`Install: ${join(versionsDir, 'v'+vDefault)}`)) console.log('✅ Default Isolation OK');
  if (resB.output.includes(`Install: ${join(versionsDir, 'v'+vSession)}`)) console.log('✅ Session Isolation OK');

}

verifyShimArchitecture();
