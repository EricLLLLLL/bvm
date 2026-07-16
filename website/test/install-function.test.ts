import { afterEach, describe, expect, mock, test } from 'bun:test';

import { onRequest } from '../functions/install';

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
  mock.restore();
});

describe('install Pages Function', () => {
  test('serves an immutable release script without rewriting it', async () => {
    const script = '#!/bin/sh\nREGISTRY="registry.npmjs.org"\n';
    const fetchMock = mock(async (input: string | URL | Request) => {
      const url = String(input);

      if (url === 'https://registry.npmjs.org/-/package/bvm-core/dist-tags') {
        return Response.json({ latest: '1.1.39' });
      }

      if (url === 'https://raw.githubusercontent.com/EricLLLLLL/bvm/v1.1.39/install.sh') {
        return new Response(script);
      }

      throw new Error(`Unexpected URL: ${url}`);
    });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const response = await onRequest({
      request: new Request('https://bvm-core.nexsail.top/install', {
        headers: { 'user-agent': 'curl/8.7.1' },
      }),
    });

    expect(response.status).toBe(200);
    expect(await response.text()).toBe(script);
    expect(response.headers.get('x-bvm-version')).toBe('1.1.39');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  test('selects the tagged PowerShell script explicitly', async () => {
    const fetchMock = mock(async (input: string | URL | Request) => {
      const url = String(input);

      if (url.includes('/dist-tags')) return Response.json({ latest: '1.1.39' });
      if (url.endsWith('/v1.1.39/install.ps1')) return new Response('# PowerShell');

      throw new Error(`Unexpected URL: ${url}`);
    });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const response = await onRequest({
      request: new Request('https://bvm-core.nexsail.top/install?win=1'),
    });

    expect(await response.text()).toBe('# PowerShell');
    expect(response.headers.get('content-type')).toContain('text/plain');
  });

  test('rejects an invalid registry version', async () => {
    globalThis.fetch = mock(async () => Response.json({ latest: '../main' })) as unknown as typeof fetch;

    const response = await onRequest({
      request: new Request('https://bvm-core.nexsail.top/install'),
    });

    expect(response.status).toBe(502);
  });
});
