#!/usr/bin/env bun

import { spawnSync } from 'bun';

type BumpType = 'patch' | 'minor' | 'major';

function run(command: string, args: string[], capture = false): string {
  console.log(`> ${command} ${args.join(' ')}`);
  const result = spawnSync({
    cmd: [command, ...args],
    stdout: capture ? 'pipe' : 'inherit',
    stderr: 'inherit',
    stdin: 'inherit',
  });

  if (result.exitCode !== 0) {
    throw new Error(`Command failed: ${command} ${args.join(' ')}`);
  }

  return capture ? result.stdout.toString().trim() : '';
}

function changedFiles(): string {
  return run('git', ['status', '--short'], true);
}

async function chooseBumpType(): Promise<BumpType | null> {
  const requested = process.argv[2];
  if (requested === 'patch' || requested === 'minor' || requested === 'major') {
    return requested;
  }

  console.log('1) patch\n2) minor\n3) major\n4) cancel');
  process.stdout.write('Select version bump: ');
  const { value } = await Bun.stdin.stream().getReader().read();
  const choice = new TextDecoder().decode(value).trim();
  return ({ '1': 'patch', '2': 'minor', '3': 'major' } as const)[choice] ?? null;
}

async function updateInstallerVersions(tagName: string): Promise<void> {
  const replacements = [
    {
      path: 'install.sh',
      pattern: /DEFAULT_BVM_VERSION="v[^"]*"/,
      replacement: `DEFAULT_BVM_VERSION="${tagName}"`,
    },
    {
      path: 'install.ps1',
      pattern: /\$DEFAULT_BVM_VER\s*=\s*"v[^"]*"/,
      replacement: `$DEFAULT_BVM_VER = "${tagName}"`,
    },
  ];

  for (const { path, pattern, replacement } of replacements) {
    const original = await Bun.file(path).text();
    const updated = original.replace(pattern, replacement);
    if (updated === original && !original.includes(tagName)) {
      throw new Error(`Unable to update the release version in ${path}`);
    }
    await Bun.write(path, updated);
  }
}

async function updateDocumentationVersion(version: string): Promise<void> {
  for (const path of ['README.md', 'README.zh-CN.md', 'bvm_article_final.md']) {
    const file = Bun.file(path);
    if (!await file.exists()) continue;
    const original = await file.text();
    const updated = original.replace(/bvm-core-[\d.]+\.tgz/g, `bvm-core-${version}.tgz`);
    if (updated !== original) await Bun.write(path, updated);
  }
}

async function main(): Promise<void> {
  if (changedFiles()) {
    throw new Error('The working tree must be clean before release preparation.');
  }

  const bun = process.execPath;
  run(bun, ['run', 'scripts/sync-runtime.ts']);
  const generatedRuntimeChanges = changedFiles();
  if (generatedRuntimeChanges) {
    console.error('Review these generated changes before preparing a release:');
    console.error(generatedRuntimeChanges);
    process.exitCode = 1;
    return;
  }

  run(bun, ['run', 'verify']);
  const bumpType = await chooseBumpType();
  if (!bumpType) return;

  run('npm', ['version', bumpType, '--no-git-tag-version']);
  const pkg = await Bun.file('package.json').json() as { version: string };
  const tagName = `v${pkg.version}`;

  await updateInstallerVersions(tagName);
  await updateDocumentationVersion(pkg.version);
  run(bun, ['run', 'website/sync-docs.ts']);
  run(bun, ['run', 'build']);
  run(bun, ['run', 'scripts/fingerprint.ts']);

  console.log(`Release files for ${tagName} are prepared.`);
  console.log('Review these generated changes, then commit them through your normal review workflow:');
  console.log(changedFiles());
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Release preparation failed: ${message}`);
  process.exitCode = 1;
});
