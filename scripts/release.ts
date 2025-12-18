#!/usr/bin/env bun

import { spawnSync } from 'bun';

// Helper to run commands
const run = (cmd: string, args: string[], opts: { ignoreError?: boolean } = {}) => {
  console.log(`\n> ${cmd} ${args.join(' ')}`);
  const result = spawnSync({ cmd: [cmd, ...args], stdout: 'inherit', stderr: 'inherit', stdin: 'inherit' });
  if (result.exitCode !== 0 && !opts.ignoreError) {
    console.error(`❌ Command failed: ${cmd} ${args.join(' ')}`);
    process.exit(1);
  }
  return result;
};

// Helper to check git status
const isGitClean = () => {
  const result = spawnSync({ cmd: ['git', 'status', '--porcelain'], stdout: 'pipe' });
  return result.stdout.toString().trim().length === 0;
};

// Helper for user input
async function prompt(question: string): Promise<string> {
  process.stdout.write(question);
  const reader =  console.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  // Bun doesn't have a built-in prompt yet for simple scripts, doing manual stdin read
  // Using a simple workaround since console.createInterface might not be available in minimal envs,
  // but let's try reading one line from stdin.
  for await (const line of console) {
      return line.trim();
  }
  return '';
}

(async function main() {
  try {
    console.log('🚀 Starting Release Process...');

    // 1. Ensure Git is clean
    if (!isGitClean()) {
      console.error('❌ Git working tree is dirty. Please commit or stash changes before releasing.');
      process.exit(1);
    }

    // 2. Sync Runtime & Dependencies
    console.log('\n🔄 Syncing Bun Runtime...');
    run('bun', ['run', 'scripts/sync-runtime.ts']);

    // 3. Commit Runtime Updates (if any)
    if (!isGitClean()) {
      console.log('\n📦 Runtime dependencies updated. Committing...');
      run('git', ['add', '.']);
      run('git', ['commit', '-m', 'chore: update bun runtime dependencies']);
    } else {
      console.log('\n✓ Runtime is already up to date.');
    }

    // 4. Run Tests
    console.log('\n🧪 Running Tests...');
    run('bun', ['test']);

    // 5. Run E2E Verification (New Step)
    console.log('\n🕵️‍♂️ Running End-to-End Installation Verification...');
    run('bun', ['run', 'scripts/verify-install.ts']);

    // 6. Bump Version
    console.log('\n📈 Version Bump');
    console.log('Select release type:');
    console.log('1) patch (0.0.x)');
    console.log('2) minor (0.x.0)');
    console.log('3) major (x.0.0)');
    console.log('4) cancel');
    
    process.stdout.write('Enter choice [1-4]: ');
    
    // Simple stdin reader
    const reader = Bun.stdin.stream().getReader();
    const { value } = await reader.read();
    const input = new TextDecoder().decode(value).trim();
    
    let bumpType = '';
    switch (input) {
      case '1': bumpType = 'patch'; break;
      case '2': bumpType = 'minor'; break;
      case '3': bumpType = 'major'; break;
      case '4': 
        console.log('Cancelled.');
        process.exit(0);
        break;
      default:
        console.error('Invalid choice.');
        process.exit(1);
    }

    if (bumpType) {
      console.log(`\n🔖 Bumping version (${bumpType})...`);
      // npm version creates the commit and tag
      run('npm', ['version', bumpType]);
      
      console.log('\n✅ Release prepared successfully!');
      console.log('👉 Now run: git push && git push --tags');
    }

  } catch (error) {
    console.error('\n❌ Release failed:', (error as Error).message);
    process.exit(1);
  }
})();
