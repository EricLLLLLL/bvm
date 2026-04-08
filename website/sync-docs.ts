import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = join(import.meta.dir, '..');
const docsDest = join(import.meta.dir, 'docs', 'guide');

const FRONTMATTER: Record<string, string> = {
  'getting-started.md': `---
title: Getting Started
description: Install BVM and manage multiple Bun versions on macOS, Linux, and Windows.
---\n\n`,
  'getting-started-zh.md': `---
title: 快速开始
description: 安装 BVM，在 macOS、Linux 和 Windows 上管理多个 Bun 版本。
---\n\n`,
  'architecture.md': `---
title: Architecture
description: BVM internal architecture, install flow, and release mechanism reference for contributors and AI agents.
---\n\n`,
};

async function syncWithFrontmatter(src: string, destFile: string) {
  await copyFile(src, join(docsDest, destFile));
  const fm = FRONTMATTER[destFile];
  if (fm) {
    const content = await readFile(join(docsDest, destFile), 'utf-8');
    await writeFile(join(docsDest, destFile), fm + content);
  }
}

async function sync() {
  try {
    await mkdir(docsDest, { recursive: true });

    await syncWithFrontmatter(join(root, 'README.md'), 'getting-started.md');
    console.log('✅ Synced README.md to website/docs/guide/getting-started.md');

    await syncWithFrontmatter(join(root, 'README.zh-CN.md'), 'getting-started-zh.md');
    console.log('✅ Synced README.zh-CN.md to website/docs/guide/getting-started-zh.md');

    await syncWithFrontmatter(
      join(root, 'my-skills', 'bvm-architect', 'references', 'architecture.md'),
      'architecture.md',
    );
    console.log('✅ Synced architecture.md to website/docs/guide/architecture.md');
  } catch (err: any) {
    console.error('❌ Sync failed:', err.message);
    process.exit(1);
  }
}

sync();
