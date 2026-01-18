import { copyFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const root = join(import.meta.dir, '..');
const docsDest = join(import.meta.dir, 'docs', 'guide');

async function sync() {
  try {
    await mkdir(docsDest, { recursive: true });
    
    // Sync README.md as Getting Started
    await copyFile(join(root, 'README.md'), join(docsDest, 'getting-started.md'));
    console.log('✅ Synced README.md to website/docs/guide/getting-started.md');

    // Sync README.zh-CN.md if needed
    await copyFile(join(root, 'README.zh-CN.md'), join(docsDest, 'getting-started-zh.md'));
    console.log('✅ Synced README.zh-CN.md to website/docs/guide/getting-started-zh.md');

    // Sync architecture.md
    await copyFile(join(root, 'conductor', 'architecture.md'), join(docsDest, 'architecture.md'));
    console.log('✅ Synced architecture.md to website/docs/guide/architecture.md');

  } catch (err) {
    console.error('❌ Sync failed:', err.message);
    process.exit(1);
  }
}

sync();
