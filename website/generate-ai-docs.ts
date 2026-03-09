import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

type DocPage = {
  source: string;
  route: string;
  title: string;
  locale: 'en' | 'zh';
  includeInFull?: boolean;
};

const docsRoot = join(import.meta.dir, 'docs');
const publicRoot = join(docsRoot, 'public');

const docPages: DocPage[] = [
  { source: 'index.md', route: '/', title: 'Home', locale: 'en', includeInFull: false },
  { source: 'from/npm.md', route: '/from/npm', title: 'From NPM', locale: 'en' },
  { source: 'wechat.md', route: '/wechat', title: 'WeChat', locale: 'en', includeInFull: false },
  { source: 'guide/getting-started.md', route: '/guide/getting-started', title: 'Getting Started', locale: 'en' },
  { source: 'guide/troubleshooting.md', route: '/guide/troubleshooting', title: 'Troubleshooting', locale: 'en' },
  { source: 'guide/architecture.md', route: '/guide/architecture', title: 'Architecture', locale: 'en' },
  { source: 'for-ai-clients.md', route: '/for-ai-clients', title: 'For AI Clients', locale: 'en' },
  { source: 'zh/index.md', route: '/zh/', title: '首页', locale: 'zh', includeInFull: false },
  { source: 'zh/from/npm.md', route: '/zh/from/npm', title: '来自 NPM', locale: 'zh' },
  { source: 'zh/wechat.md', route: '/zh/wechat', title: '公众号', locale: 'zh', includeInFull: false },
  { source: 'zh/guide/getting-started.md', route: '/zh/guide/getting-started', title: '快速开始', locale: 'zh' },
  { source: 'zh/guide/troubleshooting.md', route: '/zh/guide/troubleshooting', title: '排障', locale: 'zh' },
  { source: 'zh/guide/architecture.md', route: '/zh/guide/architecture', title: '架构', locale: 'zh' },
  { source: 'zh/for-ai-clients.md', route: '/zh/for-ai-clients', title: 'AI 客户端接入', locale: 'zh' },
];

function stripFrontmatter(markdown: string): string {
  if (!markdown.startsWith('---\n')) {
    return markdown.trim();
  }
  const end = markdown.indexOf('\n---\n', 4);
  if (end === -1) {
    return markdown.trim();
  }
  return markdown.slice(end + 5).trim();
}

function sanitizeMarkdown(markdown: string): string {
  const withoutScripts = markdown.replace(/<script[\s\S]*?<\/script>/gi, '');
  const withoutStyles = withoutScripts.replace(/<style[\s\S]*?<\/style>/gi, '');
  return withoutStyles.replace(/\n{3,}/g, '\n\n').trim();
}

function routeToMirrorPath(route: string): string {
  const normalized = route.replace(/^\//, '').replace(/\/$/, '');
  if (!normalized) {
    return join(publicRoot, 'index.md');
  }
  return join(publicRoot, normalized, 'index.md');
}

function joinUrl(base: string, path: string): string {
  return `${base}${path}`;
}

async function ensureParentDir(filePath: string): Promise<void> {
  await mkdir(dirname(filePath), { recursive: true });
}

async function generateMirrors(siteUrl: string): Promise<Array<{ page: DocPage; content: string; mirrorUrl: string; pageUrl: string }>> {
  const outputs: Array<{ page: DocPage; content: string; mirrorUrl: string; pageUrl: string }> = [];

  for (const page of docPages) {
    const sourcePath = join(docsRoot, page.source);
    const raw = await readFile(sourcePath, 'utf8');
    const content = sanitizeMarkdown(stripFrontmatter(raw));
    const mirrorPath = routeToMirrorPath(page.route);

    await ensureParentDir(mirrorPath);
    await writeFile(mirrorPath, `${content}\n`, 'utf8');

    const pageUrl = joinUrl(siteUrl, page.route === '/' ? '/' : page.route);
    const mirrorUrl = joinUrl(siteUrl, page.route === '/' ? '/index.md' : `${page.route.replace(/\/$/, '')}/index.md`);
    outputs.push({ page, content, mirrorUrl, pageUrl });
  }

  return outputs;
}

function buildLlmsTxt(entries: Array<{ page: DocPage; mirrorUrl: string; pageUrl: string }>, siteUrl: string): string {
  const enEntries = entries.filter((entry) => entry.page.locale === 'en');
  const zhEntries = entries.filter((entry) => entry.page.locale === 'zh');

  const lines: string[] = [];
  lines.push('# BVM Documentation');
  lines.push('');
  lines.push('> LLM-friendly index for BVM docs. Use page Markdown mirrors (`/xxx/index.md`) for cleaner context, or use the full aggregate file.');
  lines.push('');
  lines.push('## Primary Context');
  lines.push('');
  lines.push(`- [LLMs Full Context](${siteUrl}/llms-full.txt): Full combined documentation for retrieval and long-context models.`);
  lines.push('');
  lines.push('## English Docs');
  lines.push('');
  for (const entry of enEntries) {
    lines.push(`- [${entry.page.title}](${entry.pageUrl}): Mirror at [${entry.page.route === '/' ? '/index.md' : `${entry.page.route.replace(/\/$/, '')}/index.md`}](${entry.mirrorUrl})`);
  }
  lines.push('');
  lines.push('## 中文文档');
  lines.push('');
  for (const entry of zhEntries) {
    lines.push(`- [${entry.page.title}](${entry.pageUrl}): 镜像 [${entry.page.route.replace(/\/$/, '')}/index.md](${entry.mirrorUrl})`);
  }
  lines.push('');
  lines.push('## Optional');
  lines.push('');
  lines.push(`- [GitHub Repository](https://github.com/EricLLLLLL/bvm)`);
  lines.push(`- [AI Installer Guide](https://github.com/EricLLLLLL/bvm/blob/main/install.md)`);

  return `${lines.join('\n')}\n`;
}

function buildLlmsFull(entries: Array<{ page: DocPage; content: string; pageUrl: string; mirrorUrl: string }>): string {
  const fullEntries = entries.filter((entry) => entry.page.includeInFull !== false);
  const lines: string[] = [];
  lines.push('# BVM Docs — llms-full');
  lines.push('');
  lines.push('> Aggregated markdown context for BVM documentation. Source pages and mirror links are included per section.');
  lines.push('');
  lines.push('## Included Pages');
  lines.push('');
  for (const entry of fullEntries) {
    lines.push(`- ${entry.page.locale.toUpperCase()} · ${entry.page.title}: ${entry.pageUrl}`);
  }
  lines.push('');

  for (const entry of fullEntries) {
    lines.push('---');
    lines.push('');
    lines.push(`## ${entry.page.title} (${entry.page.locale.toUpperCase()})`);
    lines.push('');
    lines.push(`- URL: ${entry.pageUrl}`);
    lines.push(`- Mirror: ${entry.mirrorUrl}`);
    lines.push('');
    lines.push(entry.content);
    lines.push('');
  }

  return `${lines.join('\n')}\n`;
}

async function main(): Promise<void> {
  const siteUrl = 'https://bvm-core.pages.dev';
  const entries = await generateMirrors(siteUrl);

  const llmsTxtPath = join(publicRoot, 'llms.txt');
  const llmsFullPath = join(publicRoot, 'llms-full.txt');

  await writeFile(llmsTxtPath, buildLlmsTxt(entries, siteUrl), 'utf8');
  await writeFile(llmsFullPath, buildLlmsFull(entries), 'utf8');

  console.log(`✅ Generated ${entries.length} markdown mirrors`);
  console.log('✅ Generated website/docs/public/llms.txt');
  console.log('✅ Generated website/docs/public/llms-full.txt');
}

main().catch((err) => {
  console.error('❌ AI docs generation failed:', err instanceof Error ? err.message : String(err));
  process.exit(1);
});
