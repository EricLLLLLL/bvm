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
  - title: 🛡️ Atomic Isolation
    details: Each Bun version has its own global package directory. No more conflicts between projects.
  - title: 🌏 Smart Mirroring
    details: Automatically detects your region and picks the fastest registry (npmmirror/npmjs).

---

<script setup>
import { ref } from 'vue'

const unixCommand = "curl -fsSL https://bvm.app/install | bash"
const winCommand = "irm https://bvm.app/install | iex"
const copied = ref('')

const copy = (text, type) => {
  navigator.clipboard.writeText(text)
  copied.value = type
  setTimeout(() => copied.value = '', 2000)
}
</script>

<div class="install-section">
  <h2>One-Line Installation</h2>
  
  <div class="command-box">
    <div class="header">
      <span class="os">macOS / Linux</span>
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
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
}

.header {
  padding: 0.5rem 1rem;
  background: var(--vp-c-bg-alt);
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
}

.code-block {
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.code-block code {
  font-family: var(--vp-font-family-mono);
  color: var(--vp-c-brand);
  font-size: 0.9rem;
  word-break: break-all;
}

.code-block button {
  background: var(--vp-c-bg-alt);
  border: 1px solid var(--vp-c-divider);
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.85rem;
  white-space: nowrap;
}

.code-block button:hover {
  border-color: var(--vp-c-brand);
  color: var(--vp-c-brand);
}

.code-block button.copied {
  background: var(--vp-c-brand);
  color: white;
  border-color: var(--vp-c-brand);
}
</style>
