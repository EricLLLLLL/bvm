import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "BVM",
  description: "Bun Version Manager",
  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Architecture', link: '/guide/architecture' },
      { text: 'GitHub', link: 'https://github.com/EricLLLLLL/bvm' }
    ],
    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'Getting Started', link: '/guide/getting-started' },
          { text: '快速开始 (CN)', link: '/guide/getting-started-zh' },
          { text: 'Architecture', link: '/guide/architecture' }
        ]
      }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/EricLLLLLL/bvm' }
    ],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present EricLLLLLL'
    }
  }
})
