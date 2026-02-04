import { $ } from 'bun';
import { join } from 'path';
import { tmpdir } from 'os';
import { existsSync, readdirSync, rmSync, mkdirSync, writeFileSync } from 'fs';
import { randomBytes } from 'crypto';

export class E2ESandbox {
  public homeDir: string;
  public bvmDir: string;
  public npmPrefix: string;

  constructor() {
    const id = randomBytes(4).toString('hex');
    this.homeDir = join(tmpdir(), `bvm-e2e-npm-${id}`);
    this.bvmDir = join(this.homeDir, '.bvm');
    this.npmPrefix = join(this.homeDir, '.npm-prefix');
  }

  env(extra: Record<string, string> = {}) {
    const npmBinDir = process.platform === 'win32' ? this.npmPrefix : join(this.npmPrefix, 'bin');
    const sep = process.platform === 'win32' ? ';' : ':';
    // Make sure BVM shims/bin take precedence in THIS process too (avoid interactive prompts).
    const bvmShimDir = join(this.bvmDir, 'shims');
    const bvmBinDir = join(this.bvmDir, 'bin');
    const path = `${bvmShimDir}${sep}${bvmBinDir}${sep}${npmBinDir}${sep}${process.env.PATH || ''}`;
    return {
      ...process.env,
      HOME: this.homeDir,
      USERPROFILE: this.homeDir,
      BVM_DIR: this.bvmDir,
      CI: '1',
      npm_config_prefix: this.npmPrefix,
      NPM_CONFIG_PREFIX: this.npmPrefix,
      PATH: path,
      NO_COLOR: '1',
      ...extra,
    };
  }

  cleanup() {
    try { rmSync(this.homeDir, { recursive: true, force: true }); } catch {}
  }
}

async function runProtocol() {
  console.log('\n🚀 Starting E2E NPM Verification (Sandboxed)...\n');

  const sandbox = new E2ESandbox();
  const env = sandbox.env();
  const shimsDir = join(sandbox.bvmDir, 'shims');
  const binDir = join(sandbox.bvmDir, 'bin');
  const bunShim = join(shimsDir, process.platform === 'win32' ? 'bun.cmd' : 'bun');
  const bvmCmd = join(binDir, process.platform === 'win32' ? 'bvm.cmd' : 'bvm');

  try {
    // 1) Clean sandbox + old tarballs in repo root
    await $`rm -rf ${sandbox.homeDir}`.nothrow();
    await $`rm -f bvm-core-*.tgz`.nothrow();

    // 2) Build + Pack
    console.log('📦 Building and packing...');
    await $`bun run build`.env(env).quiet();
    await $`bun pm pack`.env(env).quiet();

    const files = readdirSync(process.cwd());
    const tarball = files.find((f) => f.startsWith('bvm-core-') && f.endsWith('.tgz'));
    if (!tarball) throw new Error('Tarball not found after packing.');
    console.log(`📝 Found tarball: ${tarball}`);

    // 3) Install into sandboxed npm prefix (NOT system-global)
    console.log('💿 Installing via npm (sandbox prefix)...');
    await $`npm install -g ./${tarball} --foreground-scripts --force`.env(env);

    // 4) Verify filesystem structure
    console.log('🔍 Verifying filesystem structure...');
    if (!existsSync(shimsDir)) throw new Error(`Shims directory missing: ${shimsDir}`);
    if (!existsSync(binDir)) throw new Error(`Bin directory missing: ${binDir}`);
    if (!existsSync(bunShim)) throw new Error(`Bun shim missing: ${bunShim}`);
    if (!existsSync(bvmCmd)) throw new Error(`BVM wrapper missing: ${bvmCmd}`);

    // 5) Verify CLI runs
    console.log('🧪 Verifying bvm CLI...');
    const out = await $`${bvmCmd} ls`.env(env).text();
    if (!out.includes('Locally installed Bun versions')) {
      throw new Error(`Unexpected 'bvm ls' output:\n${out}`);
    }

    // 6) Verify global package isolation (no ~/.bun in this sandbox HOME)
    console.log('📦 Verifying global install isolation (no ~/.bun leakage)...');
    await $`${bvmCmd} use default`.env(env).quiet();

    // Avoid network dependency for release verification: install a local dummy package globally.
    const localPkgDir = join(sandbox.homeDir, 'local-global-pkg');
    mkdirSync(localPkgDir, { recursive: true });
    writeFileSync(
      join(localPkgDir, 'package.json'),
      JSON.stringify(
        {
          name: 'bvm-local-global-pkg',
          version: '0.0.0',
          bin: {
            'bvm-local-cmd': 'cli.js',
          },
        },
        null,
        2,
      ) + '\n',
      'utf-8',
    );
    writeFileSync(
      join(localPkgDir, 'cli.js'),
      '#!/usr/bin/env node\nconsole.log("bvm-local-cmd ok");\n',
      'utf-8',
    );

    await $`${bunShim} install -g ${localPkgDir}`.env(env);
    if (existsSync(join(sandbox.homeDir, '.bun'))) {
      throw new Error(`Detected unexpected ~/.bun directory inside sandbox HOME: ${join(sandbox.homeDir, '.bun')}`);
    }
    // Ensure new command is exposed via shims after install
    await $`${bvmCmd} rehash --silent`.env(env).quiet();
    const localCmdShim = join(shimsDir, process.platform === 'win32' ? 'bvm-local-cmd.cmd' : 'bvm-local-cmd');
    if (!existsSync(localCmdShim)) {
      throw new Error(`Global command shim missing after local install: ${localCmdShim}`);
    }

    console.log('\n✅ E2E NPM verification passed (sandboxed).');
  } finally {
    sandbox.cleanup();
  }
}

if (import.meta.main) {
  runProtocol().catch((e) => {
    console.error('\n💥 E2E NPM verification failed:');
    console.error(e);
    process.exit(1);
  });
}
