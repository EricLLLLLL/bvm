import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'fs';
import { join } from 'path';

import * as constants from '../src/constants';

describe('AVX2 platform detection', () => {
  test('defers native CPU probes until a command needs platform capabilities', () => {
    const source = readFileSync(join(process.cwd(), 'src', 'constants.ts'), 'utf8');

    expect(source).toContain('export function getCpuArch()');
    expect(source).toContain('export function hasAvx2Support()');
    expect(source).not.toContain('export const HAS_AVX2 = detectAvx2Support');
  });

  test('uses the Windows processor feature probe instead of assuming AVX2', () => {
    const detectAvx2Support = (constants as typeof constants & {
      detectAvx2Support?: (
        platform: string,
        arch: string,
        run: (command: string, args: string[]) => { status: number; stdout: string },
      ) => boolean;
    }).detectAvx2Support;
    const calls: Array<{ command: string; args: string[] }> = [];
    const run = (command: string, args: string[]) => {
      calls.push({ command, args });
      return { status: 0, stdout: 'False\r\n' };
    };

    expect(typeof detectAvx2Support).toBe('function');
    expect(detectAvx2Support!('win32', 'x64', run)).toBe(false);
    expect(calls[0].command).toBe('powershell');
    expect(calls[0].args.join(' ')).toContain('IsProcessorFeaturePresent(40)');
  });
});
