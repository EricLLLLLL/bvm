import { describe, expect, test } from 'bun:test';

import { buildPageStructuredData } from '../docs/.vitepress/site';

const baseInput = {
  canonicalUrl: 'https://bvm-core.nexsail.top/about',
  relativePath: 'about.md',
  title: 'About BVM',
  description: 'Official BVM entity page.',
};

describe('page structured data', () => {
  test('emits WebPage for every canonical HTML page', () => {
    const data = buildPageStructuredData(baseInput);

    expect(data).toContainEqual(expect.objectContaining({
      '@type': 'WebPage',
      '@id': 'https://bvm-core.nexsail.top/about#webpage',
      url: 'https://bvm-core.nexsail.top/about',
    }));
  });

  test('emits TechArticle for documentation pages with a valid modified date', () => {
    const data = buildPageStructuredData({
      ...baseInput,
      canonicalUrl: 'https://bvm-core.nexsail.top/guide/getting-started',
      relativePath: 'guide/getting-started.md',
      lastUpdated: Date.parse('2026-07-15T08:30:00Z'),
    });

    expect(data).toContainEqual(expect.objectContaining({
      '@type': 'TechArticle',
      dateModified: '2026-07-15T08:30:00.000Z',
      mainEntityOfPage: { '@id': 'https://bvm-core.nexsail.top/guide/getting-started#webpage' },
    }));
  });

  test('omits invalid modified dates', () => {
    const data = buildPageStructuredData({ ...baseInput, lastUpdated: Number.NaN });

    expect(data.some((entry) => 'dateModified' in entry)).toBe(false);
  });

  test('emits FAQPage only when visible FAQ data is supplied', () => {
    const withoutFaq = buildPageStructuredData(baseInput);
    const withFaq = buildPageStructuredData({
      ...baseInput,
      faqs: [{ question: 'Is BVM official Bun?', answer: 'No. BVM is an independent open-source project.' }],
    });

    expect(withoutFaq.some((entry) => entry['@type'] === 'FAQPage')).toBe(false);
    expect(withFaq).toContainEqual(expect.objectContaining({
      '@type': 'FAQPage',
      mainEntity: [expect.objectContaining({
        '@type': 'Question',
        name: 'Is BVM official Bun?',
      })],
    }));
  });
});
