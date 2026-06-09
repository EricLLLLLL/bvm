---
description: BVM 是 Bun 原生的零依赖版本管理器。一条命令安装、切换、管理多个 Bun 版本。
layout: home

hero:
  name: "BVM"
  text: "Bun 版本管理器"
  tagline: "原生、零依赖、跨平台的 Bun 版本管理器。"
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
  - title: 🚀 零延迟
    details: Shim 架构带来近乎 0ms 的 shell 启动开销。
  - title: 🛡️ 地堡架构
    details: BVM 自带隔离运行时，即使系统 Bun 缺失/损坏也能自愈工作。
  - title: 🌏 自动加速
    details: 自动竞速选择最快 registry（npmmirror / npmjs），安装与下载更快。
---

<script setup>
import HomeLanding from '../.vitepress/components/HomeLanding.vue';
</script>

<HomeLanding locale="zh" />
