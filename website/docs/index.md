---
title: BVM Bun Version Manager (bvm-core)
titleTemplate: false
description: BVM provides reliable public-mirror Bun downloads for mainland China, version switching, and runtime isolation on Windows, macOS, and Linux.
layout: home

hero:
  name: "BVM"
  text: "Bun Version Manager"
  tagline: "Reliable public mirrors for mainland China. Install, switch, verify, and isolate Bun versions across Windows, macOS, and Linux."
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
  - title: 🚀 No Shell Startup Hook
    details: BVM adds no shell startup hook; version resolution happens when its shims are invoked.
  - title: 🛡️ Bunker Architecture
    details: BVM manages its own isolated Bun runtime, ensuring stability even if your system Bun is broken or missing.
  - title: 🌏 Mainland China Public Mirrors
    details: Health-ranked npmmirror, Tencent Cloud, and npmjs sources with metadata and archive fallback plus SHA-512 verification.
---

<script setup>
import HomeLanding from './.vitepress/components/HomeLanding.vue';
</script>

<HomeLanding locale="en" />
