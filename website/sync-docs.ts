import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const root = join(import.meta.dir, '..');
const docsRoot = join(import.meta.dir, 'docs');

type DocSyncTarget = {
  source: string;
  destination: string;
  title: string;
  description: string;
};

export const DOC_SYNC_TARGETS: readonly DocSyncTarget[] = [
  {
    source: 'README.md',
    destination: 'guide/getting-started.md',
    title: 'Getting Started',
    description: 'Install BVM and manage multiple Bun versions on macOS, Linux, and Windows.',
  },
  {
    source: 'README.zh-CN.md',
    destination: 'zh/guide/getting-started.md',
    title: '快速开始',
    description: '安装 BVM，在 macOS、Linux 和 Windows 上管理多个 Bun 版本。',
  },
  {
    source: 'my-skills/bvm-architect/references/architecture.md',
    destination: 'zh/guide/architecture.md',
    title: '架构',
    description: 'BVM 内部架构、安装流程和发布机制的参考文档，供贡献者和 AI 代理使用。',
  },
] as const;

export function rewriteForDocs(content: string, destination: string): string {
  let rewritten = content;

  if (destination === 'guide/getting-started.md') {
    rewritten = rewritten
      .replaceAll('./README.zh-CN.md', '/zh/guide/getting-started')
      .replaceAll('./install.md', '/for-ai-clients');
  }

  if (destination === 'zh/guide/getting-started.md') {
    rewritten = rewritten
      .replaceAll('./README.md', '/guide/getting-started')
      .replaceAll('./install.md', '/zh/for-ai-clients');
  }

  return rewritten.replace(/[ \t]+$/gm, '');
}

function frontmatter(target: DocSyncTarget): string {
  return `---\ntitle: ${target.title}\ndescription: ${target.description}\n---\n\n`;
}

async function syncWithFrontmatter(target: DocSyncTarget): Promise<void> {
  const sourcePath = join(root, target.source);
  const destinationPath = join(docsRoot, target.destination);
  const content = await readFile(sourcePath, 'utf-8');

  await mkdir(dirname(destinationPath), { recursive: true });
  await writeFile(destinationPath, frontmatter(target) + rewriteForDocs(content, target.destination));
  console.log(`✅ Synced ${target.source} to website/docs/${target.destination}`);
}

export async function syncDocs(): Promise<void> {
  try {
    for (const target of DOC_SYNC_TARGETS) {
      await syncWithFrontmatter(target);
    }
  } catch (err: any) {
    console.error('❌ Sync failed:', err.message);
    process.exit(1);
  }
}

if (import.meta.main) {
  await syncDocs();
}
