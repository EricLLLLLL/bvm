import { afterEach, describe, expect, test, vi } from 'bun:test';

import { checkBunVersionExists } from '../src/api';

const originalFetch = global.fetch;

describe('checkBunVersionExists', () => {
  afterEach(() => {
    global.fetch = originalFetch;
    delete process.env.BVM_REGISTRY;
    vi.restoreAllMocks();
  });

  test('returns true when the registry contains the version', async () => {
    process.env.BVM_REGISTRY = 'https://registry.test';
    global.fetch = vi.fn().mockResolvedValue({ ok: true } as Response) as typeof fetch;

    const result = await checkBunVersionExists('1.1.0');

    expect(result).toBe(true);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  test('returns false when the registry does not contain the version', async () => {
    process.env.BVM_REGISTRY = 'https://registry.test';
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 404 } as Response) as typeof fetch;

    const result = await checkBunVersionExists('999.999.999');

    expect(result).toBe(false);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
