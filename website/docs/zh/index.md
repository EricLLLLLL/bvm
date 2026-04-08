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
      text: 排障
      link: /zh/guide/troubleshooting
    - theme: alt
      text: GitHub
      link: https://github.com/EricLLLLLL/bvm

features:
  - title: 🚀 零延迟
    details: Shim 架构带来近乎 0ms 的 shell 启动开销。
  - title: 🛡️ 地堡架构
    details: BVM 自带隔离运行时，即使系统 Bun 缺失/损坏也能自愈工作。
  - title: 🌏 自动加速
    details: 自动竞速选择最快 registry（npmmirror / npmjs），安装与下载更快。

---

<script setup>
import { ref } from 'vue'

const npmCommand = "npm install -g bvm-core@latest --foreground-scripts"
const unixCommand = "curl -fsSL https://bvm-core.pages.dev/install | bash"
const winCommand = "irm https://bvm-core.pages.dev/install | iex"
const copied = ref('')

const copy = (text, type) => {
  navigator.clipboard.writeText(text)
  copied.value = type
  setTimeout(() => copied.value = '', 2000)
}
</script>

<div class="install-section">
  <h2>一键安装</h2>

  <div class="command-box recommended">
    <div class="header">
      <span class="os">macOS / Linux（推荐）</span>
      <span class="badge">Shell</span>
    </div>
    <div class="code-block">
      <code>{{ unixCommand }}</code>
      <button @click="copy(unixCommand, 'unix')" :class="{ copied: copied === 'unix' }">
        {{ copied === 'unix' ? '已复制' : '复制' }}
      </button>
    </div>
  </div>

  <div class="command-box recommended">
    <div class="header">
      <span class="os">Windows（推荐）</span>
      <span class="badge">PowerShell</span>
    </div>
    <div class="code-block">
      <code>{{ winCommand }}</code>
      <button @click="copy(winCommand, 'win')" :class="{ copied: copied === 'win' }">
        {{ copied === 'win' ? '已复制' : '复制' }}
      </button>
    </div>
  </div>

  <div class="command-box optional">
    <div class="header">
      <span class="os">NPM（可选）</span>
    </div>
    <div class="code-block">
      <code>{{ npmCommand }}</code>
      <button @click="copy(npmCommand, 'npm')" :class="{ copied: copied === 'npm' }">
        {{ copied === 'npm' ? '已复制' : '复制' }}
      </button>
    </div>
  </div>
</div>

<div class="compare-section">
  <h2>安装方式对比（怎么选）</h2>
  <table class="compare-table">
    <thead>
      <tr>
        <th>方式</th>
        <th>适合谁</th>
        <th>备注</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Shell</strong>（macOS/Linux）</td>
        <td>大多数用户</td>
        <td>自动竞速选最快源 + 自动 setup</td>
      </tr>
      <tr>
        <td><strong>PowerShell</strong>（Windows）</td>
        <td>Windows 开发</td>
        <td>与 Unix 安装体验一致</td>
      </tr>
      <tr>
        <td><strong>NPM</strong></td>
        <td>已在用 Node/NPM</td>
        <td>依赖 postinstall；可能需要重开终端</td>
      </tr>
    </tbody>
  </table>
</div>

<div class="callout-section">
  <div class="callout-card">
    <div class="callout-title">全局隔离不生效？</div>
    <div class="callout-body">如果命令仍来自 <code>~/.bun</code>，请运行一次 <code>bvm setup</code>，然后检查 <code>which bun</code> 是否命中 BVM shims。</div>
    <a class="callout-link" href="/zh/guide/troubleshooting">打开排障文档 →</a>
  </div>
</div>

<div class="demo-section">
  <h2>安装方式对比（动画）</h2>
  <video class="demo-video" controls playsinline preload="metadata" src="/media/bvm-install-methods.mp4"></video>
</div>

<style>
.install-section {
  margin-top: 4rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.command-box {
  width: 100%;
  max-width: 650px;
  background: var(--vp-c-bg-alt);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
}

.command-box.recommended {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.command-box.optional {
  opacity: 0.9;
  transform: scale(0.99);
  margin-top: 0.5rem;
}

.header {
  padding: 0.6rem 1rem;
  background: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.badge {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
}

.code-block {
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  background: var(--vp-code-block-bg) !important;
}

.code-block code {
  font-family: var(--vp-font-family-mono);
  color: var(--vp-c-brand-1);
  font-size: 0.95rem;
  word-break: break-all;
}

.code-block button {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
  padding: 0.3rem 0.8rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s;
  flex-shrink: 0;
}

.code-block button:hover {
  background: var(--vp-c-brand-1);
  color: white;
}

.code-block button.copied {
  background: var(--vp-c-brand-2);
  border-color: var(--vp-c-brand-2);
  color: white;
}

.compare-section {
  margin-top: 3.5rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.compare-table {
  width: 100%;
  max-width: 900px;
  border-collapse: collapse;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
  background: var(--vp-c-bg-alt);
}

.compare-table th,
.compare-table td {
  padding: 0.75rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
  vertical-align: top;
}

.compare-table th {
  text-align: left;
  background: var(--vp-c-bg-soft);
  font-size: 0.9rem;
}

.compare-table td {
  font-size: 0.95rem;
  color: var(--vp-c-text-1);
}

.callout-section {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
}

.callout-card {
  width: 100%;
  max-width: 900px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  border-radius: 12px;
  padding: 1rem 1.1rem;
}

.callout-title {
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin-bottom: 0.35rem;
}

.callout-body {
  color: var(--vp-c-text-2);
  margin-bottom: 0.6rem;
}

.callout-link {
  color: var(--vp-c-brand-1);
  font-weight: 600;
}

.demo-section {
  margin-top: 3.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.demo-video {
  width: 100%;
  max-width: 900px;
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
  background: #000;
}
</style>
