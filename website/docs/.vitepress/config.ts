import { defineConfig } from 'vitepress';
import {
  buildPageStructuredData,
  SEARCH_VERIFICATION,
  SITE_LINKS,
  SITE_URL,
  type PageFaq,
} from './site';

const UMAMI_SRC = process.env.BVM_UMAMI_SRC?.trim();
const UMAMI_WEBSITE_ID = process.env.BVM_UMAMI_WEBSITE_ID?.trim();
const GOOGLE_SITE_VERIFICATION = process.env.BVM_GOOGLE_SITE_VERIFICATION?.trim() || SEARCH_VERIFICATION.googleDefault;
const BING_SITE_VERIFICATION = process.env.BVM_BING_SITE_VERIFICATION?.trim();

const head: NonNullable<ReturnType<typeof defineConfig>['head']> = [
  ['meta', { name: 'viewport', content: 'width=device-width,initial-scale=1' }],
  ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
  ['link', { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32.png' }],
  ['link', { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16.png' }],
  ['link', { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' }],
  ['link', { rel: 'manifest', href: '/site.webmanifest' }],
  ['meta', { property: 'og:site_name', content: 'BVM' }],
  ['meta', { property: 'og:type', content: 'website' }],
  ['meta', { property: 'og:image', content: SITE_LINKS.ogImage }],
  ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
  ['meta', { name: 'twitter:image', content: SITE_LINKS.ogImage }],
  [
    'script',
    { type: 'application/ld+json' },
    JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          '@id': `${SITE_URL}/#website`,
          name: 'BVM Bun Version Manager',
          alternateName: ['BVM', 'bvm-core'],
          url: SITE_URL,
          inLanguage: ['en-US', 'zh-CN'],
          description: 'Official website for BVM, the independent Bun Version Manager published on npm as bvm-core.',
          sameAs: [
            SITE_LINKS.githubRepo,
            'https://www.npmjs.com/package/bvm-core',
            'https://libraries.io/npm/bvm-core',
            `${SITE_URL}/bun-version-manager`,
            `${SITE_URL}/bvm-core`,
          ],
        },
        {
          '@type': 'SoftwareApplication',
          '@id': `${SITE_URL}/#software`,
          name: 'BVM',
          alternateName: ['Bun Version Manager', 'bvm-core'],
          applicationCategory: 'DeveloperApplication',
          operatingSystem: ['Windows', 'macOS', 'Linux'],
          url: SITE_URL,
          installUrl: SITE_LINKS.fromNpm,
          downloadUrl: 'https://www.npmjs.com/package/bvm-core',
          codeRepository: SITE_LINKS.githubRepo,
          softwareHelp: `${SITE_URL}/guide/troubleshooting`,
          description: 'BVM installs, switches, and isolates Bun versions across Windows, macOS, and Linux.',
          author: {
            '@type': 'Person',
            name: 'EricLLLLLL',
            url: 'https://github.com/EricLLLLLL',
          },
          sameAs: [
            SITE_LINKS.githubRepo,
            'https://www.npmjs.com/package/bvm-core',
            'https://libraries.io/npm/bvm-core',
            `${SITE_URL}/bun-version-manager`,
            `${SITE_URL}/bvm-core`,
          ],
        },
        {
          '@type': 'SoftwareSourceCode',
          '@id': `${SITE_URL}/#source`,
          name: 'EricLLLLLL/bvm',
          codeRepository: SITE_LINKS.githubRepo,
          programmingLanguage: 'TypeScript',
          runtimePlatform: ['Bun', 'Node.js'],
          license: 'https://github.com/EricLLLLLL/bvm/blob/main/LICENSE',
          targetProduct: {
            '@id': `${SITE_URL}/#software`,
          },
        },
      ],
    }),
  ],
];

if (GOOGLE_SITE_VERIFICATION) {
  head.push(['meta', { name: 'google-site-verification', content: GOOGLE_SITE_VERIFICATION }]);
}

if (BING_SITE_VERIFICATION) {
  head.push(['meta', { name: 'msvalidate.01', content: BING_SITE_VERIFICATION }]);
}

if (process.env.NODE_ENV === 'production' && UMAMI_SRC && UMAMI_WEBSITE_ID) {
  head.push(['script', { async: '', src: UMAMI_SRC, 'data-website-id': UMAMI_WEBSITE_ID }]);
}

export default defineConfig({
  head,
  cleanUrls: true,
  lastUpdated: true,
  sitemap: { hostname: SITE_URL },
  srcExclude: ['public/**/*.md'],
  ignoreDeadLinks: [/\.\/install/],

  transformPageData(pageData) {
    // Canonical URL — one authoritative URL per page
    const canonicalUrl = `${SITE_URL}/${pageData.relativePath}`
      .replace(/index\.md$/, '')
      .replace(/\.md$/, '');
    pageData.frontmatter.head ??= [];
    pageData.frontmatter.head.push(['link', { rel: 'canonical', href: canonicalUrl }]);

    // Per-page og:description from frontmatter description
    const desc = pageData.frontmatter.description || pageData.description;
    if (desc) {
      pageData.frontmatter.head.push(
        ['meta', { property: 'og:description', content: desc }],
        ['meta', { name: 'twitter:description', content: desc }],
      );
    }

    // Per-page og:title
    const title = pageData.frontmatter.title || pageData.title;
    if (title) {
      pageData.frontmatter.head.push(
        ['meta', { property: 'og:title', content: `${title} | BVM` }],
        ['meta', { name: 'twitter:title', content: `${title} | BVM` }],
      );
    }

    // Per-page og:url
    pageData.frontmatter.head.push(
      ['meta', { property: 'og:url', content: canonicalUrl }],
    );

    const faqs = pageData.frontmatter.faqs as PageFaq[] | undefined;
    const structuredData = buildPageStructuredData({
      canonicalUrl,
      relativePath: pageData.relativePath,
      title: title || 'BVM',
      description: desc || 'Official BVM documentation.',
      lastUpdated: pageData.lastUpdated,
      faqs,
    });
    pageData.frontmatter.head.push([
      'script',
      { type: 'application/ld+json' },
      JSON.stringify(structuredData),
    ]);
  },

  locales: {
    root: {
      label: 'English',
      lang: 'en-US',
      title: 'BVM',
      titleTemplate: 'BVM Bun Version Manager',
      description: 'Bun Version Manager',
      themeConfig: {
        logo: '/logo.svg',
        siteTitle: 'BVM',
        nav: [
          { text: 'Guide', link: '/guide/getting-started' },
          { text: 'Bun Version Manager', link: '/bun-version-manager' },
          { text: 'About', link: '/about' },
          { text: 'For AI Clients', link: '/for-ai-clients' },
          { text: 'Troubleshooting', link: '/guide/troubleshooting' },
          { text: 'Architecture (中文)', link: '/zh/guide/architecture' },
          { text: '中文', link: '/zh/' },
          { text: 'GitHub', link: SITE_LINKS.githubRepo },
        ],
        sidebar: [
          {
            text: 'Guide',
            items: [
              { text: 'Getting Started', link: '/guide/getting-started' },
              { text: 'Bun Version Manager', link: '/bun-version-manager' },
              { text: 'What is bvm-core?', link: '/bvm-core' },
              { text: 'BVM, BunVM, and Bum', link: '/compare-bun-version-managers' },
              { text: 'About', link: '/about' },
              { text: 'For AI Clients', link: '/for-ai-clients' },
              { text: 'Troubleshooting', link: '/guide/troubleshooting' },
              { text: 'Architecture (中文)', link: '/zh/guide/architecture' },
            ],
          },
        ],
        socialLinks: [{ icon: 'github', link: SITE_LINKS.githubRepo }],
        footer: {
          message: 'Released under the MIT License.',
          copyright: 'Copyright © 2024-present EricLLLLLL',
        },
      },
    },
    zh: {
      label: '简体中文',
      lang: 'zh-CN',
      title: 'BVM',
      titleTemplate: 'BVM Bun 版本管理器',
      description: 'Bun 版本管理器',
      themeConfig: {
        logo: '/logo.svg',
        siteTitle: 'BVM',
        nav: [
          { text: '指南', link: '/zh/guide/getting-started' },
          { text: '关于', link: '/zh/about' },
          { text: 'AI 接入', link: '/zh/for-ai-clients' },
          { text: '排障', link: '/zh/guide/troubleshooting' },
          { text: '架构', link: '/zh/guide/architecture' },
          { text: 'English', link: '/' },
          { text: 'GitHub', link: SITE_LINKS.githubRepo },
        ],
        sidebar: [
          {
            text: '指南',
            items: [
              { text: '快速开始', link: '/zh/guide/getting-started' },
              { text: '关于', link: '/zh/about' },
              { text: 'AI 客户端接入', link: '/zh/for-ai-clients' },
              { text: '排障', link: '/zh/guide/troubleshooting' },
              { text: '架构', link: '/zh/guide/architecture' },
            ],
          },
        ],
        socialLinks: [{ icon: 'github', link: SITE_LINKS.githubRepo }],
        footer: {
          message: '基于 MIT License 发布。',
          copyright: 'Copyright © 2024-present EricLLLLLL',
        },
      },
    },
  },
});
