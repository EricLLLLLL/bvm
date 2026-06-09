<script setup lang="ts">
import { computed } from 'vue';

import { SITE_LINKS } from '../site';

const props = defineProps<{
  locale: 'en' | 'zh';
}>();

const content = computed(() => {
  if (props.locale === 'zh') {
    return {
      title: '专为 Bun 打造的原生、零依赖版本管理器',
      promoLead: '如果你更关注高端获客、广告投放、SEO 与 GEO 增长，直接看 WinWin Media。',
      promoLink: '访问 winwin.nexsail.top »',
      official: '官方网站与文档 »',
      language: 'English Site »',
      languageHref: SITE_LINKS.official,
      npm: '从 NPM 来？从这里开始 »',
      readme: '🇺🇸 English Docs',
      readmeHref: SITE_LINKS.githubReadme,
      issues: '提交 Bug',
      discussions: '功能建议',
    };
  }

  return {
    title: 'The Native, Zero-Dependency Version Manager for Bun',
    promoLead: 'Need premium lead generation, paid acquisition, SEO, or GEO growth?',
    promoLink: 'Visit WinWin Media at winwin.nexsail.top »',
    official: 'Official Website & Documentation »',
    language: '中文网站 »',
    languageHref: SITE_LINKS.officialZh,
    npm: 'From NPM (Start Here) »',
    readme: '🇨🇳 中文文档',
    readmeHref: SITE_LINKS.githubReadmeZh,
    issues: 'Report Bug',
    discussions: 'Request Feature',
  };
});
</script>

<template>
  <div align="center">
    <a :href="SITE_LINKS.official">
      <img src="/logo.svg" alt="BVM Logo" width="180" height="180" />
    </a>

    <h3 align="center">{{ content.title }}</h3>

    <p align="center">
      <strong>{{ content.promoLead }}</strong>
      <br />
      <a :href="SITE_LINKS.winwin"><strong>{{ content.promoLink }}</strong></a>
    </p>

    <p align="center">
      <a :href="SITE_LINKS.official"><strong>{{ content.official }}</strong></a>
      <br />
      <a :href="content.languageHref"><strong>{{ content.language }}</strong></a>
      <br />
      <a :href="props.locale === 'zh' ? SITE_LINKS.fromNpmZh : SITE_LINKS.fromNpm"><strong>{{ content.npm }}</strong></a>
      <br />
      <br />
      <a :href="content.readmeHref">{{ content.readme }}</a>
      ·
      <a :href="SITE_LINKS.githubIssues">{{ content.issues }}</a>
      ·
      <a :href="SITE_LINKS.githubDiscussions">{{ content.discussions }}</a>
    </p>

    <p align="center">
      <a :href="SITE_LINKS.githubReleases">
        <img src="https://img.shields.io/github/v/release/EricLLLLLL/bvm?color=f472b6&label=latest" alt="Release" />
      </a>
      <a :href="SITE_LINKS.githubLicense">
        <img src="https://img.shields.io/github/license/EricLLLLLL/bvm?color=orange" alt="License" />
      </a>
      <a href="#">
        <img src="https://img.shields.io/badge/platform-win%20%7C%20mac%20%7C%20linux-blue" alt="Platform" />
      </a>
    </p>
  </div>
</template>
