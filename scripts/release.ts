#!/usr/bin/env bun

import { spawnSync } from 'bun';

// --- Helpers ---
const run = (cmd: string, args: string[], opts: { ignoreError?: boolean, capture?: boolean } = {}) => {
  console.log(`> ${cmd} ${args.join(' ')}`);
  const result = spawnSync({
    cmd: [cmd, ...args],
    stdout: opts.capture ? 'pipe' : 'inherit',
    stderr: 'inherit',
    stdin: 'inherit'
  });
  if (result.exitCode !== 0 && !opts.ignoreError) {
    console.error(`❌ Command failed: ${cmd} ${args.join(' ')}`);
    process.exit(1);
  }
  return result;
};

const git = (...args: string[]) => run('git', args, { capture: true }).stdout.toString().trim();
const runGit = (...args: string[]) => run('git', args);

// --- Main Script ---
(async function main() {
  try {
    console.log('🚀 Starting Local Release Trigger...');

    // 1. Safety Checks
    if (git('status', '--porcelain')) {
      console.error('❌ Git working tree is dirty. Please commit or stash changes before releasing.');
      process.exit(1);
    }
    const currentBranch = git('rev-parse', '--abbrev-ref', 'HEAD');
    if (currentBranch !== 'main') {
      console.warn(`⚠️  You are on branch "${currentBranch}", not "main". This might not trigger the Release Action.`);
    }

    // 2. Sync & Test (Ensure we don't push broken code)
    console.log('\n🔄 Syncing Runtime & Running Tests...');
    run('bun', ['run', 'scripts/sync-runtime.ts']);
    if (git('status', '--porcelain')) {
      runGit('add', '.');
      runGit('commit', '-m', 'chore: update runtime dependencies');
    }
    
    console.log('\n🧪 Running Unit & Integration Tests...');
    // Run via shell to expand glob pattern, ensuring we only run tests in the root test dir (excluding e2e)
    run('bash', ['-c', 'bun test test/*.test.ts']);

    // 3. Select Version Bump
    console.log('\n📈 Version Bump Selection');
    console.log('1) patch');
    console.log('2) minor');
    console.log('3) major');
    console.log('4) cancel');
    process.stdout.write('Enter choice: ');
    
    const reader = Bun.stdin.stream().getReader();
    const { value } = await reader.read();
    const input = new TextDecoder().decode(value).trim();
    
    let bumpType = '';
    switch (input) {
      case '1': bumpType = 'patch'; break;
      case '2': bumpType = 'minor'; break;
      case '3': bumpType = 'major'; break;
      default: console.log('Cancelled.'); process.exit(0);
    }

    // 4. Bump Version & Push
    console.log(`\n🔖 Bumping version (${bumpType})...`);
    
    // npm version updates package.json AND creates a commit, but we suppress the tag
    run('npm', ['version', bumpType, '--no-git-tag-version']);
    
    const pkg = require('../package.json');
    const newVersion = pkg.version;
    const tagName = `v${newVersion}`;

    // --- Update hardcoded default version in install scripts (Cross-platform) ---
    console.log(`\n📝 Updating hardcoded default version to ${tagName}...`);
    
    const installShPath = 'install.sh';
    let installShContent = await Bun.file(installShPath).text();
    installShContent = installShContent.replace(/DEFAULT_BVM_VERSION="v[^\"]*"/, `DEFAULT_BVM_VERSION="${tagName}"`);
    await Bun.write(installShPath, installShContent);

    const installPs1Path = 'install.ps1';
    let installPs1Content = await Bun.file(installPs1Path).text();
    installPs1Content = installPs1Content.replace(/\$DEFAULT_BVM_VER = "v[^\"]*"/, `$DEFAULT_BVM_VER = "${tagName}"`);
    await Bun.write(installPs1Path, installPs1Content);

    // Commit
    runGit('add', 'package.json', 'package-lock.json', 'install.sh', 'install.ps1');
    runGit('commit', '-m', `chore: release ${tagName} [skip ci]`);

    console.log(`\n⬆️  Pushing to main to trigger GitHub Action...`);
    runGit('push', 'origin', currentBranch);

    console.log(`\n✅ Triggered! GitHub Action will now handle fingerprints and assets.`);
    console.log(`\n👀 Watch progress at: https://github.com/EricLLLLLL/bvm/actions`);

  } catch (error) {
    console.error('\n❌ Release failed:', (error as Error).message);
    process.exit(1);
  }
})();