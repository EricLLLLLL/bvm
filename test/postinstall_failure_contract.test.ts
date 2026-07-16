import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'fs';
import { join } from 'path';

const script = readFileSync(join(process.cwd(), 'scripts', 'postinstall.js'), 'utf8');

describe('postinstall failure contract', () => {
  test('can be imported for direct behavior tests without running installation', () => {
    expect(script).toContain('if (require.main === module)');
    expect(script).toContain('module.exports = {');
  });

  test('does not continue when no usable private runtime is available', () => {
    expect(script).toContain("if (!hasValidBun) throw new Error('Unable to establish a usable BVM private runtime.')");
  });

  test('checks setup and rehash exit codes before reporting success', () => {
    expect(script).toContain("requireSuccessfulCommand(setupResult, 'bvm setup')");
    expect(script).toContain("requireSuccessfulCommand(rehashResult, 'bvm rehash')");
    expect(script.indexOf("requireSuccessfulCommand(rehashResult, 'bvm rehash')"))
      .toBeLessThan(script.indexOf("log('🎉 BVM initialized successfully.')"));
  });
});
