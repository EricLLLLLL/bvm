import { describe, expect, test } from 'bun:test';

import { resolveAliasPath, validateAliasName } from '../src/utils/alias-name';

describe('alias name safety', () => {
  test.each(['../escape', '/tmp/escape', 'a/b', 'a\\b', '', '.', '..'])(
    'rejects unsafe alias name %p',
    (name) => {
      expect(() => validateAliasName(name)).toThrow('Invalid alias name');
    },
  );

  test.each(['default', 'lts-1', 'team_runtime', 'Bun123'])(
    'accepts safe alias name %p',
    (name) => {
      expect(validateAliasName(name)).toBe(name);
    },
  );

  test('resolves aliases inside the alias directory', () => {
    expect(resolveAliasPath('/tmp/bvm/aliases', 'lts-1')).toBe('/tmp/bvm/aliases/lts-1');
  });
});
