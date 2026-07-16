import { describe, expect, it } from 'bun:test';

import { networkCommand } from '../src/commands/network';
import type { RegistrySelection } from '../src/utils/registry-selector';

function selection(overrides: Partial<RegistrySelection> = {}): RegistrySelection {
  return {
    mode: 'automatic',
    candidates: [
      { id: 'npmmirror', url: 'https://registry.npmmirror.com', priority: 0 },
      { id: 'npmjs', url: 'https://registry.npmjs.org', priority: 1 },
    ],
    health: [
      {
        id: 'npmmirror',
        url: 'https://registry.npmmirror.com',
        reachable: true,
        latencyMs: 42,
        checkedAt: 1_000,
      },
      {
        id: 'npmjs',
        url: 'https://registry.npmjs.org',
        reachable: false,
        latencyMs: null,
        checkedAt: 1_000,
        error: 'timeout',
      },
    ],
    cacheExpiresAt: 5_000,
    ...overrides,
  };
}

describe('networkCommand', () => {
  it('shows the cached mirror ranking by default', async () => {
    const lines: string[] = [];
    let forceRefresh: boolean | undefined;

    await networkCommand(undefined, {
      select: async (options) => {
        forceRefresh = options.forceRefresh;
        return selection();
      },
      write: (line) => lines.push(line),
    });

    expect(forceRefresh).toBe(false);
    expect(lines.join('\n')).toContain('npmmirror');
    expect(lines.join('\n')).toContain('42 ms');
    expect(lines.join('\n')).toContain('selected');
  });

  it('forces a fresh health test when requested', async () => {
    let forceRefresh: boolean | undefined;

    await networkCommand('test', {
      select: async (options) => {
        forceRefresh = options.forceRefresh;
        return selection();
      },
      write: () => {},
    });

    expect(forceRefresh).toBe(true);
  });

  it('fails the forced test when every mirror is unreachable', async () => {
    expect(networkCommand('test', {
      select: async () => selection({
        health: [{
          id: 'npmmirror',
          url: 'https://registry.npmmirror.com',
          reachable: false,
          latencyMs: null,
          checkedAt: 1_000,
          error: 'timeout',
        }],
      }),
      write: () => {},
    })).rejects.toThrow('No reachable registry');
  });

  it('rejects unsupported actions', async () => {
    expect(networkCommand('unknown', { write: () => {} }))
      .rejects.toThrow('Usage: bvm network [test]');
  });
});
