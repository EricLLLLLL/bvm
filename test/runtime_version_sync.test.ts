import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'fs';
import { join } from 'path';

const root = process.cwd();
const read = (path: string) => readFileSync(join(root, path), 'utf8');

describe('installer runtime fallback version', () => {
  test('uses the package Bun version across every installation surface', () => {
    const pkg = JSON.parse(read('package.json')) as { devDependencies: { bun: string } };
    const expected = pkg.devDependencies.bun.replace(/^[\^~]/, '');
    const shellVersion = read('install.sh').match(/FALLBACK_BUN_VERSION="([^"]+)"/)?.[1];
    const powershellVersion = read('install.ps1').match(/\$FALLBACK_BUN_VERSION = "([^"]+)"/)?.[1];
    const postinstallVersion = read('scripts/postinstall.js').match(/const FALLBACK_BUN_VERSION = '([^']+)'/)?.[1];

    expect(shellVersion).toBe(expected);
    expect(powershellVersion).toBe(expected);
    expect(postinstallVersion).toBe(expected);
  });

  test('the runtime sync generator updates all three installer surfaces', () => {
    const syncScript = read('scripts/sync-runtime.ts');

    expect(syncScript).toContain("const postinstallPath = join(cwd, 'scripts', 'postinstall.js')");
    expect(syncScript).toContain('FALLBACK_BUN_VERSION');
    expect(syncScript).toContain('Unable to synchronize Bun fallback version');
  });
});
