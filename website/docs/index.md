---
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
      text: View on GitHub
      link: https://github.com/EricLLLLLL/bvm

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
  <h2>Quick Installation</h2>

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

  <div class="command-box">
    <div class="header">
      <span class="os">Windows (PowerShell)</span>
    </div>
    <div class="code-block">
      <code>{{ winCommand }}</code>
      <button @click="copy(winCommand, 'win')" :class="{ copied: copied === 'win' }">
        {{ copied === 'win' ? 'Copied!' : 'Copy' }}
      </button>
    </div>
  </div>

  <div class="command-box">
    <div class="header">
      <span class="os">NPM</span>
      <span class="badge alternative">Alternative</span>
    </div>
    <div class="code-block">
      <code>{{ npmCommand }}</code>
      <button @click="copy(npmCommand, 'npm')" :class="{ copied: copied === 'npm' }">
        {{ copied === 'npm' ? 'Copied!' : 'Copy' }}
      </button>
    </div>
  </div>
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
  max-width: 600px;
  background: var(--vp-c-bg-alt); /* Light mode will use a slight grey */
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
}

.command-box.recommended {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
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
  background: var(--vp-code-block-bg) !important; /* Forces standard code background */
}

.code-block code {
  font-family: var(--vp-font-family-mono);
  color: var(--vp-c-brand-1); /* Use brand color for visibility */
  font-size: 0.95rem;
  word-break: break-all;
}

.code-block button {
  background: var(--vp-c-bg-mute);
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-1);
  padding: 0.3rem 0.8rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.8rem;
  font-weight: 500;
  white-space: nowrap;
}

.dark .code-block button {
  background: rgba(255, 255, 255, 0.1);
}

.code-block button:hover {
  background: var(--vp-c-brand-soft);
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
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
</style>

.code-block {
  padding: 0.75rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  background: #1e1e20; /* Consistent dark code background */
}

.code-block code {
  font-family: var(--vp-font-family-mono);
  color: #3dd68c; /* Terminal green */
  font-size: 0.9rem;
  word-break: break-all;
}

.code-block button {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  padding: 0.3rem 0.7rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.8rem;
  white-space: nowrap;
}

.code-block button:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: var(--vp-c-brand);
}

.code-block button.copied {
  background: var(--vp-c-brand);
  color: white;
  border-color: var(--vp-c-brand);
}
</style>
