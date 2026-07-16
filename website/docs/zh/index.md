---
title: BVM Bun 版本管理器（bvm-core）
titleTemplate: false
description: BVM 通过公共镜像改善中国大陆的 Bun 下载可用性，并提供跨平台版本切换和运行时隔离。
layout: home

hero:
  name: "BVM"
  text: "Bun 版本管理器"
  tagline: "中国大陆公共镜像可靠下载，跨 Windows、macOS、Linux 安装、切换、校验和隔离 Bun 版本。"
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
  - title: 🌏 中国大陆公共镜像
    details: 按健康状态排序 npmmirror、腾讯云和 npmjs，元数据与压缩包失败自动回退，并执行 SHA-512 校验。
---

<script setup>
import HomeLanding from '../.vitepress/components/HomeLanding.vue';
</script>

<HomeLanding locale="zh" />
