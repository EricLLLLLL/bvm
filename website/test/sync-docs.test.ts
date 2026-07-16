import { describe, expect, test } from 'bun:test';

import { DOC_SYNC_TARGETS, rewriteForDocs } from '../sync-docs';

describe('documentation sync targets', () => {
  test('routes repository docs to their canonical locale paths', () => {
    expect(DOC_SYNC_TARGETS).toContainEqual(expect.objectContaining({
      source: 'README.md',
      destination: 'guide/getting-started.md',
    }));
    expect(DOC_SYNC_TARGETS).toContainEqual(expect.objectContaining({
      source: 'README.zh-CN.md',
      destination: 'zh/guide/getting-started.md',
    }));
    expect(DOC_SYNC_TARGETS).toContainEqual(expect.objectContaining({
      source: 'my-skills/bvm-architect/references/architecture.md',
      destination: 'zh/guide/architecture.md',
    }));
    expect(DOC_SYNC_TARGETS.some(({ destination }) => destination.endsWith('getting-started-zh.md'))).toBe(false);
  });

  test('rewrites cross-language and AI guide links for Chinese docs', () => {
    const source = '[English](./README.md) [AI](./install.md)';

    expect(rewriteForDocs(source, 'zh/guide/getting-started.md')).toBe(
      '[English](/guide/getting-started) [AI](/zh/for-ai-clients)',
    );
  });

  test('removes trailing whitespace from generated documentation', () => {
    expect(rewriteForDocs('first  \nsecond\t\n', 'zh/guide/architecture.md')).toBe('first\nsecond\n');
  });
});
