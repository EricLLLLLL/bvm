import { defineConfig } from 'vitepress';

const SITE_URL = 'https://bvm-core.pages.dev';
const UMAMI_SRC = process.env.BVM_UMAMI_SRC?.trim();
const UMAMI_WEBSITE_ID = process.env.BVM_UMAMI_WEBSITE_ID?.trim();

const head: NonNullable<ReturnType<typeof defineConfig>['head']> = [
  ['meta', { name: 'viewport', content: 'width=device-width,initial-scale=1' }],
  ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
  ['link', { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32.png' }],
  ['link', { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16.png' }],
  ['link', { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' }],
  ['link', { rel: 'manifest', href: '/site.webmanifest' }],
  ['meta', { property: 'og:site_name', content: 'BVM' }],
  ['meta', { property: 'og:type', content: 'website' }],
  ['meta', { property: 'og:image', content: `${SITE_URL}/og.png` }],
  ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
  ['meta', { name: 'twitter:image', content: `${SITE_URL}/og.png` }],
];

if (process.env.NODE_ENV === 'production' && UMAMI_SRC && UMAMI_WEBSITE_ID) {
  head.push(['script', { async: '', src: UMAMI_SRC, 'data-website-id': UMAMI_WEBSITE_ID }]);
}

export default defineConfig({
  head,
  cleanUrls: true,
  lastUpdated: true,
  locales: {
    root: {
      label: 'English',
      lang: 'en-US',
      title: 'BVM',
      description: 'Bun Version Manager',
      themeConfig: {
        logo: '/logo.svg',
        nav: [
          { text: 'Guide', link: '/guide/getting-started' },
          { text: 'For AI Clients', link: '/for-ai-clients' },
          { text: 'Troubleshooting', link: '/guide/troubleshooting' },
          { text: 'WeChat', link: '/wechat' },
          { text: 'Architecture (CN)', link: '/guide/architecture' },
          { text: '中文', link: '/zh/' },
          { text: 'GitHub', link: 'https://github.com/EricLLLLLL/bvm' },
        ],
        sidebar: [
          {
            text: 'Guide',
            items: [
              { text: 'Getting Started', link: '/guide/getting-started' },
              { text: 'For AI Clients', link: '/for-ai-clients' },
              { text: 'Troubleshooting', link: '/guide/troubleshooting' },
              { text: 'Architecture (CN)', link: '/guide/architecture' },
            ],
          },
        ],
        socialLinks: [{ icon: 'github', link: 'https://github.com/EricLLLLLL/bvm' }],
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
      description: 'Bun 版本管理器',
      themeConfig: {
        logo: '/logo.svg',
        nav: [
          { text: '指南', link: '/zh/guide/getting-started' },
          { text: 'AI 接入', link: '/zh/for-ai-clients' },
          { text: '排障', link: '/zh/guide/troubleshooting' },
          { text: '公众号', link: '/zh/wechat' },
          { text: '架构', link: '/zh/guide/architecture' },
          { text: 'English', link: '/' },
          { text: 'GitHub', link: 'https://github.com/EricLLLLLL/bvm' },
        ],
        sidebar: [
          {
            text: '指南',
            items: [
              { text: '快速开始', link: '/zh/guide/getting-started' },
              { text: 'AI 客户端接入', link: '/zh/for-ai-clients' },
              { text: '排障', link: '/zh/guide/troubleshooting' },
              { text: '架构', link: '/zh/guide/architecture' },
            ],
          },
        ],
        socialLinks: [{ icon: 'github', link: 'https://github.com/EricLLLLLL/bvm' }],
        footer: {
          message: '基于 MIT License 发布。',
          copyright: 'Copyright © 2024-present EricLLLLLL',
        },
      },
    },
  },
});
