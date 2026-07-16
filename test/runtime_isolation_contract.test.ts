import { describe, expect, test } from 'bun:test';

const useSource = await Bun.file(new URL('../src/commands/use.ts', import.meta.url)).text();
const setupSource = await Bun.file(new URL('../src/commands/setup.ts', import.meta.url)).text();

describe('private runtime isolation', () => {
  test('version activation never rewrites runtime/current', () => {
    expect(useSource).not.toContain("join(BVM_RUNTIME_DIR, 'current')");
  });

  test('shell setup never derives runtime/current from the default alias', () => {
    expect(setupSource).not.toContain("join(BVM_RUNTIME_DIR, 'current')");
  });
});
