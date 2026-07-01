---
title: BVM Bun Version Manager (bvm-core)
description: BVM, published on npm as bvm-core, is a native zero-dependency version manager for Bun on Windows, macOS, and Linux.
layout: home

hero:
  name: "BVM"
  text: "Bun Version Manager"
  tagline: "Published as bvm-core on npm. Install, switch, and isolate Bun versions on Windows, macOS, and Linux."
  image:
    src: /logo.svg
    alt: BVM Logo
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: Bun Version Manager
      link: /bun-version-manager
    - theme: alt
      text: Star on GitHub
      link: https://github.com/EricLLLLLL/bvm
    - theme: alt
      text: 中文
      link: /zh/
    - theme: alt
      text: Troubleshooting
      link: /guide/troubleshooting

features:
  - title: 🚀 Zero Latency
    details: Shim-based design ensures ~0ms shell startup overhead. No more slow terminal inits.
  - title: 🛡️ Bunker Architecture
    details: BVM manages its own isolated Bun runtime, ensuring stability even if your system Bun is broken or missing.
  - title: 🌏 Smart Mirroring
    details: Automatically detects your region and picks the fastest registry (npmmirror/npmjs).
---

<script setup>
import HomeLanding from './.vitepress/components/HomeLanding.vue';
</script>

<HomeLanding locale="en" />
