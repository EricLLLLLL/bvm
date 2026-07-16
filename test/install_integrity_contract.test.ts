import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'fs';
import { join } from 'path';

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), 'utf8');

describe('installer integrity contract', () => {
  test('POSIX installer verifies npm SHA-512 SRI before extraction', () => {
    const script = read('install.sh');
    expect(script).toContain('verify_sha512');
    expect(script).toContain('rm -f "$file"');
    expect(script).toContain('openssl dgst -sha512 -binary');
    expect(script).toContain('dist.integrity');
    expect(script.indexOf('verify_sha512')).toBeLessThan(script.indexOf('tar -xzf "$TEMP_TGZ"'));
  });

  test('PowerShell installer verifies npm SHA-512 SRI before extraction', () => {
    const script = read('install.ps1');
    expect(script).toContain('Assert-Sha512Integrity');
    expect(script).toContain('[Security.Cryptography.SHA512]::Create()');
    expect(script).not.toContain('Get-FileHash');
    expect(script).toContain('.dist.integrity');
    expect(script.indexOf('Assert-Sha512Integrity')).toBeLessThan(script.indexOf('& tar -xf "$TMP_TGZ"'));
    expect(script).not.toContain('$TARGET_DIR');
    expect(script).toContain('Join-Path $TARGET_PHYSICAL_DIR "bin\\bun.exe"');
  });

  test('npm postinstall verifies integrity before extracting runtime', () => {
    const script = read('scripts/postinstall.js');
    expect(script).toContain('verifyIntegrity');
    expect(script).toContain("createHash('sha512')");
    expect(script).toContain('data.dist.integrity');
    expect(script.indexOf('verifyIntegrity(tempTgz')).toBeLessThan(script.indexOf("run('tar'"));
  });
});
