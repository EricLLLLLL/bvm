import { describe, expect, test } from 'bun:test';

const installer = await Bun.file(new URL('../../install.sh', import.meta.url)).text();

describe('install.sh coexistence contract', () => {
  test('never removes or rewrites the official Bun installation', () => {
    expect(installer).not.toMatch(/rm\s+(?:-[^\s]+\s+)*["']?\$HOME\/\.bun/);
    expect(installer).not.toMatch(/mv\s+[^\n]*["']?\$HOME\/\.bun/);
    expect(installer).not.toContain('BUN_INSTALL="$HOME/.bun"');
  });
});
