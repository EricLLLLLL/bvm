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
  const BUN_EXE = process.execPath; // Use current running bun
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
    run(BUN_EXE, ['run', 'scripts/sync-runtime.ts']);
    if (git('status', '--porcelain')) {
      runGit('add', '.');
      runGit('commit', '-m', 'chore: update runtime dependencies');
    }
    
    console.log('\n🧪 Running Unit & Integration Tests...');
    // Run main test suite (excludes test/isolated/ and test/e2e/ by default glob behavior)
    run('bash', ['-c', `${BUN_EXE} test test/*.test.ts`]);
    
    console.log('\n🧪 Running Isolated Tests...');
    run('bash', ['-c', `${BUN_EXE} test test/isolated/*.test.ts`]);

    console.log('\n🛡️ Running E2E NPM Verification...');
    run(BUN_EXE, ['run', 'test:e2e:npm']);

    // 3. Select Version Bump
    let bumpType = '';
    const args = process.argv.slice(2);
    if (args.length > 0 && ['patch', 'minor', 'major'].includes(args[0])) {
        bumpType = args[0];
        console.log(`\n📈 Version Bump Selection: ${bumpType} (from args)`);
    } else {
        console.log('\n📈 Version Bump Selection');
        console.log('1) patch');
        console.log('2) minor');
        console.log('3) major');
        console.log('4) cancel');
        process.stdout.write('Enter choice: ');
        
        const reader = Bun.stdin.stream().getReader();
        const { value } = await reader.read();
        const input = new TextDecoder().decode(value).trim();
        
        switch (input) {
          case '1': bumpType = 'patch'; break;
          case '2': bumpType = 'minor'; break;
          case '3': bumpType = 'major'; break;
          default: console.log('Cancelled.'); process.exit(0);
        }
    }

    // 4. Bump Version & Push
    console.log(`\n🔖 Bumping version (${bumpType})...`);
    
    // npm version updates package.json AND creates a commit, but we suppress the tag
    run('npm', ['version', bumpType, '--no-git-tag-version']);
    
    const pkg = require('../package.json');
    const newVersion = pkg.version;
    const tagName = `v${newVersion}`;

    // --- Build with new version ---
    console.log(`\n🏗️  Building BVM v${newVersion}...`);
    run('bun', ['run', 'build']);

    // --- Update hardcoded default version in install scripts (Cross-platform) ---
    console.log(`\n📝 Updating hardcoded default version to ${tagName}...`);
    
    const installShPath = 'install.sh';
    let installShContent = await Bun.file(installShPath).text();
    const oldInstallShContent = installShContent;
    installShContent = installShContent.replace(/DEFAULT_BVM_VERSION="v[^\"]*"/, `DEFAULT_BVM_VERSION="${tagName}"`);
    if (installShContent === oldInstallShContent && !oldInstallShContent.includes(tagName)) {
        throw new Error(`Failed to find or update DEFAULT_BVM_VERSION in ${installShPath}`);
    }
    await Bun.write(installShPath, installShContent);

    const installPs1Path = 'install.ps1';
    let installPs1Content = await Bun.file(installPs1Path).text();
    const oldInstallPs1Content = installPs1Content;
    installPs1Content = installPs1Content.replace(/\$DEFAULT_BVM_VER\s*=\s*"v[^\"]*"/, `$DEFAULT_BVM_VER = "${tagName}"`);
    if (installPs1Content === oldInstallPs1Content && !oldInstallPs1Content.includes(tagName)) {
        throw new Error(`Failed to find or update \$DEFAULT_BVM_VER in ${installPs1Path}`);
    }
    await Bun.write(installPs1Path, installPs1Content);

    // --- Update version numbers in documentation ---
    console.log(`\n📚 Updating version numbers in documentation to ${newVersion}...`);
    const docsToUpdate = ['README.md', 'README.zh-CN.md', 'bvm_article_final.md'];
    const updatedDocs = [];
    for (const doc of docsToUpdate) {
      const file = Bun.file(doc);
      if (await file.exists()) {
        let content = await file.text();
        const oldContent = content;
        // Match patterns like bvm-core-1.1.4.tgz or bvm-core@1.1.4
        content = content.replace(/bvm-core-[\d\.]+\.tgz/g, `bvm-core-${newVersion}.tgz`);
        if (content !== oldContent) {
            await Bun.write(doc, content);
            updatedDocs.push(doc);
        }
      }
    }

    // --- Sync to Website ---
    console.log(`\n🌐 Syncing documentation to website...`);
    run('bun', ['run', 'website/sync-docs.ts']);

    // Commit
    runGit('add', 'package.json', 'package-lock.json', 'install.sh', 'install.ps1', 'website/docs/guide', ...updatedDocs);
    runGit('commit', '-m', `chore: prepare release ${tagName}`);

    // Create Tag
    console.log(`\n🏷️  Creating local tag ${tagName}...`);
    runGit('tag', '-a', tagName, '-m', `Release ${tagName}`);

    console.log(`\n✅ Release prep complete for ${tagName}!`);
    console.log(`\n🚀 NEXT STEPS:`);
    console.log(`   1. Push the commit:  git push origin ${currentBranch}`);
    console.log(`   2. Push the tag:     git push origin ${tagName}`);
    console.log(`\n💡 Note: The NPM publish will ONLY trigger when the tag is pushed.`);

  } catch (error) {
    console.error('\n❌ Release failed:', (error as Error).message);
    process.exit(1);
  }
})();