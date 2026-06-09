---
title: Bun Version Manager for Windows, macOS & Linux
description: BVM is a native, zero-dependency version manager for Bun. Install, switch, and manage multiple Bun versions with one command.
layout: home

hero:
  name: "BVM"
  text: "Bun Version Manager"
  tagline: "The native, zero-dependency version manager for Bun."
  image:
    src: /logo.svg
    alt: BVM Logo
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
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
