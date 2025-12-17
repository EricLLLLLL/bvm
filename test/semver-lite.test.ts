import { describe, expect, test } from 'bun:test';
import { valid, compare, rcompare, satisfies, maxSatisfying } from '../src/utils/semver-lite';
// We can optionally import the real semver to compare results if it was installed, 
// but since we are replacing it, we should test against expected behavior.

describe('semver-lite', () => {
  test('valid', () => {
    expect(valid('1.2.3')).toBe('1.2.3');
    expect(valid('v1.2.3')).toBe('v1.2.3');
    expect(valid('1.2')).toBe(null); // Strict semver usually requires 3 parts, our regex does too
    expect(valid('invalid')).toBe(null);
  });

  test('compare', () => {
    expect(compare('1.0.0', '1.0.1')).toBe(-1);
    expect(compare('1.0.1', '1.0.0')).toBe(1);
    expect(compare('1.0.0', '1.0.0')).toBe(0);
    expect(compare('2.0.0', '1.9.9')).toBe(1);
    expect(compare('0.0.1', '0.0.2')).toBe(-1);
  });

  test('rcompare', () => {
    expect(rcompare('1.0.0', '1.0.1')).toBe(1); // Reverse of compare
    expect(rcompare('2.0.0', '1.0.0')).toBe(-1);
  });

  test('satisfies', () => {
    // Exact
    expect(satisfies('1.2.3', '1.2.3')).toBe(true);
    expect(satisfies('1.2.4', '1.2.3')).toBe(false);

    // Tilde ~ (Patch updates)
    expect(satisfies('1.2.3', '~1.2.0')).toBe(true); // >=1.2.0 <1.3.0
    expect(satisfies('1.2.9', '~1.2.0')).toBe(true);
    expect(satisfies('1.3.0', '~1.2.0')).toBe(false);
    expect(satisfies('1.1.9', '~1.2.0')).toBe(false);
    
    // Caret ^ (Minor updates for >0.x)
    expect(satisfies('1.2.3', '^1.2.0')).toBe(true); // >=1.2.0 <2.0.0
    expect(satisfies('1.9.9', '^1.2.0')).toBe(true);
    expect(satisfies('2.0.0', '^1.2.0')).toBe(false);

    // Caret ^ (Patch updates for 0.x)
    expect(satisfies('0.2.3', '^0.2.0')).toBe(true); // >=0.2.0 <0.3.0
    expect(satisfies('0.2.9', '^0.2.0')).toBe(true);
    expect(satisfies('0.3.0', '^0.2.0')).toBe(false);
  });

  test('maxSatisfying', () => {
    const versions = ['1.0.0', '1.2.0', '1.2.3', '1.3.0', '2.0.0'];
    expect(maxSatisfying(versions, '^1.2.0')).toBe('1.3.0'); // 1.3.0 is < 2.0.0
    expect(maxSatisfying(versions, '~1.2.0')).toBe('1.2.3'); // 1.2.3 is < 1.3.0
    expect(maxSatisfying(versions, '1.2.0')).toBe('1.2.0');
    expect(maxSatisfying(versions, '9.9.9')).toBe(null);
  });
});
