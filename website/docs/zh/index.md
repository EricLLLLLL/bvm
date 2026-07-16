---
title: BVM Bun 版本管理器（bvm-core）
titleTemplate: false
description: BVM 以 bvm-core 包名发布在 npm 上，是面向 Windows、macOS 和 Linux 的 Bun 版本管理器。
layout: home

hero:
  name: "BVM"
  text: "Bun 版本管理器"
  tagline: "npm 包名是 bvm-core，用于安装、切换和隔离 Windows、macOS、Linux 上的 Bun 版本。"
  image:
    src: /logo.svg
    alt: BVM Logo
  actions:
    - theme: brand
      text: 快速开始
      link: /zh/guide/getting-started
    - theme: alt
      text: 去点 Star
      link: https://github.com/EricLLLLLL/bvm
    - theme: alt
      text: 排障
      link: /zh/guide/troubleshooting

features:
  - title: 🚀 不注入 Shell 启动钩子
    details: BVM 不注入 shell 启动钩子，只在 shim 被调用时解析项目所需的 Bun 版本。
  - title: 🛡️ 地堡架构
    details: BVM 自带隔离运行时，即使系统 Bun 缺失/损坏也能自愈工作。
  - title: 🌏 自动加速
    details: 自动竞速选择最快 registry（npmmirror / npmjs），安装与下载更快。
---

<script setup>
import HomeLanding from '../.vitepress/components/HomeLanding.vue';
</script>

<HomeLanding locale="zh" />
