<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

import { SITE_LINKS } from '../site';

const props = defineProps<{
  locale: 'en' | 'zh';
}>();

const copied = ref('');
const hasMounted = ref(false);

const content = computed(() => {
  if (props.locale === 'zh') {
    return {
      npmCommand: 'npm install -g bvm-core@latest --foreground-scripts',
      unixCommand: `curl -fsSL ${SITE_LINKS.installScript} | bash`,
      winCommand: `irm ${SITE_LINKS.installScript} | iex`,
      starEyebrow: '开源支持',
      starTitle: '如果 BVM 帮你省了时间，顺手给项目点个 GitHub Star。',
      starBody: 'Star 是最直接的社交证明，能帮助更多开发者更快发现、判断并尝试 BVM。',
      starPrimary: '去 GitHub 点 Star',
      starSecondary: '看看谁在关注',
      promoEyebrow: '来自 NexSail 体系',
      promoTitle: '如果你要的是高端获客、投放增长、SEO 或 GEO，不要先看工具，先看 WinWin Media。',
      promoBody: 'WinWin Media 是 NexSail 旗下高端获客增长品牌，承接广告投放、搜索增长、GEO 可见性、落地页转化和咨询承接这条完整链路。',
      promoPrimary: '打开 WinWin Media',
      promoSecondary: '了解 NexSail',
      installTitle: '一键安装',
      unixOs: 'macOS / Linux（推荐）',
      unixBadge: 'Shell',
      winOs: 'Windows（推荐）',
      winBadge: 'PowerShell',
      npmOs: 'NPM（可选）',
      copiedLabel: '已复制',
      copyLabel: '复制',
      compareTitle: '安装方式对比（怎么选）',
      compareHeaders: ['方式', '适合谁', '备注'],
      compareRows: [
        ['Shell（macOS/Linux）', '大多数用户', '自动竞速选最快源 + 自动 setup'],
        ['PowerShell（Windows）', 'Windows 开发', '与 Unix 安装体验一致'],
        ['NPM', '已在用 Node/NPM', '依赖 postinstall；可能需要重开终端'],
      ],
      calloutTitle: '全局隔离不生效？',
      calloutBody: '如果命令仍来自 ~/.bun，请运行一次 bvm setup，然后检查 which bun 是否命中 BVM shims。',
      calloutLink: '打开排障文档 →',
      calloutHref: '/zh/guide/troubleshooting',
      demoTitle: '安装方式对比（动画）',
    };
  }

  return {
    npmCommand: 'npm install -g bvm-core@latest',
    unixCommand: `curl -fsSL ${SITE_LINKS.installScript} | bash`,
    winCommand: `irm ${SITE_LINKS.installScript} | iex`,
    starEyebrow: 'Open source support',
    starTitle: 'If BVM helps your Bun workflow, give it a GitHub Star.',
    starBody: 'A Star helps more developers discover BVM, trust the project faster, and try it in real multi-version Bun setups.',
    starPrimary: 'Star BVM on GitHub',
    starSecondary: 'See stargazers',
    promoEyebrow: 'From the NexSail ecosystem',
    promoTitle: 'Need premium lead generation, paid acquisition, SEO, or GEO growth?',
    promoBody: "WinWin Media is NexSail's high-end growth brand. If you are looking for qualified pipeline growth instead of developer tooling, start there first.",
    promoPrimary: 'Open WinWin Media',
    promoSecondary: 'About NexSail',
    installTitle: 'One-Line Installation',
    unixOs: 'macOS / Linux (Recommended)',
    unixBadge: 'Universal',
    winOs: 'Windows (Recommended)',
    winBadge: 'PowerShell',
    npmOs: 'NPM (Optional)',
    copiedLabel: 'Copied!',
    copyLabel: 'Copy',
    compareTitle: 'Install methods (choose the best fit)',
    compareHeaders: ['Method', 'Best for', 'Notes'],
    compareRows: [
      ['Shell (macOS/Linux)', 'Most users', 'Fastest mirror + auto setup'],
      ['PowerShell (Windows)', 'Windows dev', 'Same flow as Unix installer'],
      ['NPM', 'Already using Node', 'Runs postinstall; reopen terminal may be needed'],
    ],
    calloutTitle: 'Having trouble with global isolation?',
    calloutBody: 'If tools still come from ~/.bun, run bvm setup and verify which bun points to BVM shims.',
    calloutLink: 'Open Troubleshooting →',
    calloutHref: '/guide/troubleshooting',
    demoTitle: 'Install methods (animated)',
  };
});

const copyCommand = (text: string, type: string) => {
  navigator.clipboard.writeText(text);
  copied.value = type;
  setTimeout(() => {
    copied.value = '';
  }, 2000);
};

onMounted(() => {
  hasMounted.value = true;
});
</script>

<template>
  <div class="home-landing" :class="{ 'is-mounted': hasMounted }">
  <div class="spotlight-section reveal-block reveal-1">
    <div class="star-card surface-card">
      <div class="star-eyebrow">{{ content.starEyebrow }}</div>
      <h2>{{ content.starTitle }}</h2>
      <p>{{ content.starBody }}</p>
      <div class="star-actions">
        <a class="star-primary" :href="SITE_LINKS.githubRepo">{{ content.starPrimary }}</a>
        <a class="star-secondary" :href="SITE_LINKS.githubStargazers">{{ content.starSecondary }}</a>
      </div>
    </div>

    <div class="spotlight-card surface-card">
      <div class="spotlight-eyebrow">{{ content.promoEyebrow }}</div>
      <h2>{{ content.promoTitle }}</h2>
      <p>{{ content.promoBody }}</p>
      <div class="spotlight-actions">
        <a class="spotlight-primary" :href="SITE_LINKS.winwin">{{ content.promoPrimary }}</a>
        <a class="spotlight-secondary" :href="SITE_LINKS.company">{{ content.promoSecondary }}</a>
      </div>
    </div>
  </div>

  <div class="install-section reveal-block reveal-2">
    <h2>{{ content.installTitle }}</h2>

    <div class="command-box recommended surface-card">
      <div class="header">
        <span class="os">{{ content.unixOs }}</span>
        <span class="badge">{{ content.unixBadge }}</span>
      </div>
      <div class="code-block">
        <code>{{ content.unixCommand }}</code>
        <button @click="copyCommand(content.unixCommand, 'unix')" :class="{ copied: copied === 'unix' }">
          {{ copied === 'unix' ? content.copiedLabel : content.copyLabel }}
        </button>
      </div>
    </div>

    <div class="command-box recommended surface-card">
      <div class="header">
        <span class="os">{{ content.winOs }}</span>
        <span class="badge">{{ content.winBadge }}</span>
      </div>
      <div class="code-block">
        <code>{{ content.winCommand }}</code>
        <button @click="copyCommand(content.winCommand, 'win')" :class="{ copied: copied === 'win' }">
          {{ copied === 'win' ? content.copiedLabel : content.copyLabel }}
        </button>
      </div>
    </div>

    <div class="command-box optional surface-card">
      <div class="header">
        <span class="os">{{ content.npmOs }}</span>
      </div>
      <div class="code-block">
        <code>{{ content.npmCommand }}</code>
        <button @click="copyCommand(content.npmCommand, 'npm')" :class="{ copied: copied === 'npm' }">
          {{ copied === 'npm' ? content.copiedLabel : content.copyLabel }}
        </button>
      </div>
    </div>
  </div>

  <div class="compare-section reveal-block reveal-3">
    <h2>{{ content.compareTitle }}</h2>
    <table class="compare-table">
      <thead>
        <tr>
          <th v-for="header in content.compareHeaders" :key="header">{{ header }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in content.compareRows" :key="row[0]">
          <td><strong>{{ row[0] }}</strong></td>
          <td>{{ row[1] }}</td>
          <td>{{ row[2] }}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="callout-section reveal-block reveal-4">
    <div class="callout-card">
      <div class="callout-title">{{ content.calloutTitle }}</div>
      <div class="callout-body">{{ content.calloutBody }}</div>
      <a class="callout-link" :href="content.calloutHref">{{ content.calloutLink }}</a>
    </div>
  </div>

  <div class="demo-section reveal-block reveal-5">
    <h2>{{ content.demoTitle }}</h2>
    <video class="demo-video" controls playsinline preload="metadata" src="/media/bvm-install-methods.mp4"></video>
  </div>
  </div>
</template>

<style scoped>
.home-landing {
  --ease-out-strong: cubic-bezier(0.23, 1, 0.32, 1);
  --ease-in-out-strong: cubic-bezier(0.77, 0, 0.175, 1);
}

.reveal-block {
  opacity: 0;
  transform: translateY(18px) scale(0.985);
  transition:
    transform 520ms var(--ease-out-strong),
    opacity 520ms var(--ease-out-strong),
    filter 520ms var(--ease-out-strong);
  filter: blur(10px);
  will-change: transform, opacity, filter;
}

.home-landing.is-mounted .reveal-block {
  opacity: 1;
  transform: translateY(0) scale(1);
  filter: blur(0);
}

.reveal-1 {
  transition-delay: 0ms;
}

.reveal-2 {
  transition-delay: 70ms;
}

.reveal-3 {
  transition-delay: 120ms;
}

.reveal-4 {
  transition-delay: 160ms;
}

.reveal-5 {
  transition-delay: 210ms;
}

.surface-card {
  transition:
    transform 220ms var(--ease-out-strong),
    box-shadow 220ms var(--ease-out-strong),
    border-color 220ms ease,
    background-position 320ms var(--ease-in-out-strong);
  transform-origin: center top;
}

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

.star-eyebrow,
.spotlight-eyebrow {
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.star-eyebrow {
  color: #2563eb;
}

.spotlight-eyebrow {
  color: #fbbf24;
}

.star-card h2,
.spotlight-card h2 {
  margin: 0.45rem 0 0.65rem;
  font-size: 1.7rem;
}

.star-card h2 {
  line-height: 1.2;
  color: #0f172a;
}

.spotlight-card h2 {
  line-height: 1.2;
  color: #fff;
}

.star-card p,
.spotlight-card p {
  margin: 0;
  max-width: 52rem;
}

.star-card p {
  color: #334155;
}

.spotlight-card p {
  color: rgba(248, 250, 252, 0.9);
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
.spotlight-secondary,
.code-block button,
.callout-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  transition:
    transform 140ms var(--ease-out-strong),
    box-shadow 180ms var(--ease-out-strong),
    background-color 180ms ease,
    color 180ms ease,
    border-color 180ms ease,
    opacity 180ms ease;
}

.star-primary,
.star-secondary,
.spotlight-primary,
.spotlight-secondary {
  padding: 0.72rem 1rem;
  border-radius: 999px;
  font-weight: 700;
}

.star-primary {
  background: #0f172a;
  color: #f8fafc;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.18);
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

.spotlight-primary {
  background: #f59e0b;
  color: #111827;
  box-shadow: 0 12px 26px rgba(245, 158, 11, 0.22);
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

.command-box {
  width: 100%;
  max-width: 650px;
  background: var(--vp-c-bg-alt);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
}

.command-box.recommended {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
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

@media (hover: hover) and (pointer: fine) {
  .surface-card:hover {
    transform: translateY(-3px);
  }

  .star-card:hover {
    box-shadow: 0 24px 48px rgba(15, 23, 42, 0.12);
  }

  .spotlight-card:hover {
    box-shadow: 0 24px 48px rgba(15, 23, 42, 0.24);
  }

  .command-box:hover {
    border-color: color-mix(in srgb, var(--vp-c-brand-1) 32%, var(--vp-c-divider));
    box-shadow: 0 16px 32px rgba(15, 23, 42, 0.09);
  }

  .star-primary:hover,
  .spotlight-primary:hover,
  .star-secondary:hover,
  .spotlight-secondary:hover,
  .code-block button:hover,
  .callout-link:hover {
    transform: translateY(-1px);
  }
}

.star-primary:active,
.star-secondary:active,
.spotlight-primary:active,
.spotlight-secondary:active,
.code-block button:active,
.callout-link:active {
  transform: scale(0.97);
}

@media (prefers-reduced-motion: reduce) {
  .reveal-block,
  .surface-card,
  .star-primary,
  .star-secondary,
  .spotlight-primary,
  .spotlight-secondary,
  .code-block button,
  .callout-link {
    transition-duration: 0ms !important;
    transition-delay: 0ms !important;
    transform: none !important;
    filter: none !important;
  }

  .reveal-block,
  .home-landing.is-mounted .reveal-block {
    opacity: 1;
  }
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
</style>
