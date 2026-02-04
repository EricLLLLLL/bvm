import { defineConfig } from 'vitepress';

const SITE_URL = 'https://bvm-core.pages.dev';

export default defineConfig({
  head: [
    ['meta', { name: 'viewport', content: 'width=device-width,initial-scale=1' }],
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32.png' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16.png' }],
    ['link', { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' }],
    ['link', { rel: 'manifest', href: '/site.webmanifest' }],
    ['meta', { property: 'og:site_name', content: 'BVM' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:image', content: `${SITE_URL}/logo.svg` }],
    ['meta', { name: 'twitter:card', content: 'summary' }],
    ['meta', { name: 'twitter:image', content: `${SITE_URL}/logo.svg` }],
  ],
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
          { text: 'Troubleshooting', link: '/guide/troubleshooting' },
          { text: 'Architecture (CN)', link: '/guide/architecture' },
          { text: '中文', link: '/zh/' },
          { text: 'GitHub', link: 'https://github.com/EricLLLLLL/bvm' },
        ],
        sidebar: [
          {
            text: 'Guide',
            items: [
              { text: 'Getting Started', link: '/guide/getting-started' },
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
          { text: '排障', link: '/zh/guide/troubleshooting' },
          { text: '架构', link: '/zh/guide/architecture' },
          { text: 'English', link: '/' },
          { text: 'GitHub', link: 'https://github.com/EricLLLLLL/bvm' },
        ],
        sidebar: [
          {
            text: '指南',
            items: [
              { text: '快速开始', link: '/zh/guide/getting-started' },
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
