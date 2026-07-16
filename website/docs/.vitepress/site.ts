export const SITE_URL = 'https://bvm-core.nexsail.top';

export const SITE_LINKS = {
  official: SITE_URL,
  officialZh: `${SITE_URL}/zh/`,
  fromNpm: `${SITE_URL}/from/npm`,
  fromNpmZh: `${SITE_URL}/zh/from/npm`,
  installScript: `${SITE_URL}/install`,
  company: 'https://www.nexsail.top',
  winwin: 'https://winwin.nexsail.top',
  githubRepo: 'https://github.com/EricLLLLLL/bvm',
  githubReadme: 'https://github.com/EricLLLLLL/bvm/blob/main/README.md',
  githubReadmeZh: 'https://github.com/EricLLLLLL/bvm/blob/main/README.zh-CN.md',
  githubStargazers: 'https://github.com/EricLLLLLL/bvm/stargazers',
  githubIssues: 'https://github.com/EricLLLLLL/bvm/issues',
  githubDiscussions: 'https://github.com/EricLLLLLL/bvm/discussions',
  githubReleases: 'https://github.com/EricLLLLLL/bvm/releases',
  githubLicense: 'https://github.com/EricLLLLLL/bvm/blob/main/LICENSE',
  ogImage: `${SITE_URL}/og.png`,
  robots: `${SITE_URL}/robots.txt`,
  sitemap: `${SITE_URL}/sitemap.xml`,
} as const;

export const SEARCH_VERIFICATION = {
  googleDefault: 'IMcyUrktAh6wU92AAoSovkOXVHMnnklzBuyjGGyFB6Q',
} as const;

export type PageFaq = {
  question: string;
  answer: string;
};

export type PageStructuredDataInput = {
  canonicalUrl: string;
  relativePath: string;
  title: string;
  description: string;
  lastUpdated?: number;
  faqs?: PageFaq[];
};

function isTechnicalArticle(relativePath: string): boolean {
  const normalized = relativePath.replace(/^zh\//, '');
  return normalized.startsWith('guide/') || [
    'for-ai-clients.md',
    'from/npm.md',
    'bun-version-manager.md',
    'bvm-core.md',
    'compare-bun-version-managers.md',
  ].includes(normalized);
}

export function buildPageStructuredData(input: PageStructuredDataInput): Record<string, unknown>[] {
  const modifiedDate = Number.isFinite(input.lastUpdated)
    ? new Date(input.lastUpdated as number).toISOString()
    : undefined;
  const webpageId = `${input.canonicalUrl}#webpage`;
  const shared = {
    name: input.title,
    description: input.description,
    url: input.canonicalUrl,
    ...(modifiedDate ? { dateModified: modifiedDate } : {}),
  };
  const entries: Record<string, unknown>[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': webpageId,
      ...shared,
      isPartOf: { '@id': `${SITE_URL}/#website` },
      about: { '@id': `${SITE_URL}/#software` },
    },
  ];

  if (isTechnicalArticle(input.relativePath)) {
    entries.push({
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      '@id': `${input.canonicalUrl}#article`,
      ...shared,
      mainEntityOfPage: { '@id': webpageId },
      about: { '@id': `${SITE_URL}/#software` },
      author: {
        '@type': 'Person',
        name: 'EricLLLLLL',
        url: 'https://github.com/EricLLLLLL',
      },
    });
  }

  if (input.faqs?.length) {
    entries.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      '@id': `${input.canonicalUrl}#faq`,
      mainEntity: input.faqs.map(({ question, answer }) => ({
        '@type': 'Question',
        name: question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: answer,
        },
      })),
    });
  }

  return entries;
}
