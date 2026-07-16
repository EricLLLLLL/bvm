import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'fs';
import { join } from 'path';

const read = (file: string) => readFileSync(join(process.cwd(), file), 'utf8');
const publicRegistries = [
  'https://registry.npmmirror.com',
  'https://mirrors.cloud.tencent.com/npm',
  'https://registry.npmjs.org',
];

describe('public mirror installer contract', () => {
  test.each(['install.sh', 'install.ps1', 'scripts/postinstall.js'])(
    '%s includes every public registry and explicit overrides',
    (file) => {
      const source = read(file);
      publicRegistries.forEach((registry) => expect(source).toContain(registry));
      expect(source).toContain('BVM_REGISTRY');
      expect(source).toContain('BVM_DOWNLOAD_MIRROR');
    },
  );

  test('POSIX installer resolves metadata and downloads through the registry list', () => {
    const source = read('install.sh');
    expect(source).toContain('registry_candidates()');
    expect(source).toContain('download_registry_package()');
    expect(source).toContain('for registry in $REGISTRIES');
  });

  test('PowerShell installer resolves metadata and downloads through the registry list', () => {
    const source = read('install.ps1');
    expect(source).toContain('function Get-RegistryCandidates');
    expect(source).toContain('function Save-RegistryPackage');
    expect(source).toContain('foreach ($Registry in $REGISTRIES)');
  });

  test('npm postinstall does not discard a registry only because its health probe failed', () => {
    const source = read('scripts/postinstall.js');
    expect(source).toContain('function getRegistryCandidates()');
    expect(source).not.toContain('if (reg.time >= 9999) continue');
  });
});
