---
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
import { ref } from 'vue'

const npmCommand = "npm install -g bvm-core@latest"
const unixCommand = "curl -fsSL https://bvm-core.nexsail.top/install | bash"
const winCommand = "irm https://bvm-core.nexsail.top/install | iex"
const copied = ref('')

const copy = (text, type) => {
  navigator.clipboard.writeText(text)
  copied.value = type
  setTimeout(() => copied.value = '', 2000)
}
</script>

<div class="spotlight-section">
  <div class="star-card">
    <div class="star-eyebrow">Open source support</div>
    <h2>If BVM helps your Bun workflow, give it a GitHub Star.</h2>
    <p>
      A Star helps more developers discover BVM, trust the project faster, and try it in real multi-version Bun setups.
    </p>
    <div class="star-actions">
      <a class="star-primary" href="https://github.com/EricLLLLLL/bvm">Star BVM on GitHub</a>
      <a class="star-secondary" href="https://github.com/EricLLLLLL/bvm/stargazers">See stargazers</a>
    </div>
  </div>

  <div class="spotlight-card">
    <div class="spotlight-eyebrow">From the NexSail ecosystem</div>
    <h2>Need premium lead generation, paid acquisition, SEO, or GEO growth?</h2>
    <p>
      WinWin Media is NexSail's high-end growth brand. If you are looking for qualified pipeline growth instead of developer tooling,
      start there first.
    </p>
    <div class="spotlight-actions">
      <a class="spotlight-primary" href="https://winwin.nexsail.top">Open WinWin Media</a>
      <a class="spotlight-secondary" href="https://www.nexsail.top">About NexSail</a>
    </div>
  </div>
</div>

<div class="install-section">
  <h2>One-Line Installation</h2>

  <div class="command-box recommended">
    <div class="header">
      <span class="os">macOS / Linux (Recommended)</span>
      <span class="badge">Universal</span>
    </div>
    <div class="code-block">
      <code>{{ unixCommand }}</code>
      <button @click="copy(unixCommand, 'unix')" :class="{ copied: copied === 'unix' }">
        {{ copied === 'unix' ? 'Copied!' : 'Copy' }}
      </button>
    </div>
  </div>

  <div class="command-box recommended">
    <div class="header">
      <span class="os">Windows (Recommended)</span>
      <span class="badge">PowerShell</span>
    </div>
    <div class="code-block">
      <code>{{ winCommand }}</code>
      <button @click="copy(winCommand, 'win')" :class="{ copied: copied === 'win' }">
        {{ copied === 'win' ? 'Copied!' : 'Copy' }}
      </button>
    </div>
  </div>

  <div class="command-box optional">
    <div class="header">
      <span class="os">NPM (Optional)</span>
    </div>
    <div class="code-block">
      <code>{{ npmCommand }}</code>
      <button @click="copy(npmCommand, 'npm')" :class="{ copied: copied === 'npm' }">
        {{ copied === 'npm' ? 'Copied!' : 'Copy' }}
      </button>
    </div>
  </div>
</div>

<div class="compare-section">
  <h2>Install methods (choose the best fit)</h2>
  <table class="compare-table">
    <thead>
      <tr>
        <th>Method</th>
        <th>Best for</th>
        <th>Notes</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Shell</strong> (macOS/Linux)</td>
        <td>Most users</td>
        <td>Fastest mirror + auto setup</td>
      </tr>
      <tr>
        <td><strong>PowerShell</strong> (Windows)</td>
        <td>Windows dev</td>
        <td>Same flow as Unix installer</td>
      </tr>
      <tr>
        <td><strong>NPM</strong></td>
        <td>Already using Node</td>
        <td>Runs postinstall; reopen terminal may be needed</td>
      </tr>
    </tbody>
  </table>
</div>

<div class="callout-section">
  <div class="callout-card">
    <div class="callout-title">Having trouble with global isolation?</div>
    <div class="callout-body">If tools still come from <code>~/.bun</code>, run <code>bvm setup</code> and verify <code>which bun</code> points to BVM shims.</div>
    <a class="callout-link" href="/guide/troubleshooting">Open Troubleshooting →</a>
  </div>
</div>

<div class="demo-section">
  <h2>Install methods (animated)</h2>
  <video class="demo-video" controls playsinline preload="metadata" src="/media/bvm-install-methods.mp4"></video>
</div>

<style>
.spotlight-section {
  margin-top: 1.5rem;
}

.star-card,
.spotlight-card {
  padding: 1.4rem;
  border-radius: 18px;
}

.star-card {
  margin-bottom: 1rem;
  background:
    radial-gradient(circle at top left, rgba(59, 130, 246, 0.18), transparent 28%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(241, 245, 249, 0.96));
  border: 1px solid rgba(59, 130, 246, 0.16);
  box-shadow: 0 18px 42px rgba(15, 23, 42, 0.08);
  color: #0f172a;
}

.star-eyebrow {
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #2563eb;
}

.star-card h2,
.spotlight-card h2 {
  margin: 0.45rem 0 0.65rem;
  font-size: 1.7rem;
}

.star-card h2 {
  line-height: 1.15;
  color: #0f172a;
}

.star-card p {
  margin: 0;
  max-width: 52rem;
  color: #334155;
}

.star-actions,
.spotlight-actions {
  margin-top: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.star-actions a,
.spotlight-actions a {
  text-decoration: none;
}

.star-primary,
.star-secondary,
.spotlight-primary,
.spotlight-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0.72rem 1rem;
  border-radius: 999px;
  font-weight: 700;
}

.star-primary {
  background: #0f172a;
  color: #f8fafc;
}

.star-secondary {
  border: 1px solid rgba(15, 23, 42, 0.14);
  color: #0f172a;
}

.spotlight-card {
  background:
    radial-gradient(circle at top right, rgba(245, 158, 11, 0.16), transparent 30%),
    linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(30, 41, 59, 0.94));
  border: 1px solid rgba(245, 158, 11, 0.28);
  box-shadow: 0 18px 42px rgba(15, 23, 42, 0.18);
  color: #f8fafc;
}

.spotlight-eyebrow {
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #fbbf24;
}

.spotlight-card h2 {
  line-height: 1.15;
  color: #fff;
}

.spotlight-card p {
  margin: 0;
  max-width: 52rem;
  color: rgba(248, 250, 252, 0.9);
}

.spotlight-primary {
  background: #f59e0b;
  color: #111827;
}

.spotlight-secondary {
  border: 1px solid rgba(248, 250, 252, 0.24);
  color: #f8fafc;
}

.install-section {
  margin-top: 4rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

@media (max-width: 640px) {
  .star-card h2,
  .spotlight-card h2 {
    font-size: 1.4rem;
  }

  .star-primary,
  .star-secondary,
  .spotlight-primary,
  .spotlight-secondary {
    width: 100%;
  }
}

.command-box {
  width: 100%;
  max-width: 600px;
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
  opacity: 0.85;
  transform: scale(0.98);
  margin-top: 1rem;
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
  transition: all 0.2s;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
}

.code-block button:hover {
  background: var(--vp-c-brand-1);
  color: #ffffff;
}

.code-block button.copied {
  background: var(--vp-c-brand-1);
  color: #fff !important;
  border-color: var(--vp-c-brand-1);
}

.badge {
  font-size: 0.7rem;
  background: var(--vp-c-brand-1);
  color: #fff;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  text-transform: uppercase;
}

.badge.alternative {
  background: var(--vp-c-text-3);
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
  display: table !important;
  width: auto !important;
  border-collapse: separate;
  border-spacing: 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
  background: var(--vp-c-bg-alt);
  margin: 0 auto;
}

.compare-table th,
.compare-table td {
  padding: 0.75rem 1.2rem;
  border-bottom: 1px solid var(--vp-c-divider);
  vertical-align: top;
  white-space: nowrap;
}

.compare-table td:last-child,
.compare-table th:last-child {
  white-space: normal;
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

.compare-table tr:last-child td {
  border-bottom: none;
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
