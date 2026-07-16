import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'fs';
import { join } from 'path';

const root = join(import.meta.dir, '..', '..');
const read = (file: string) => readFileSync(join(root, file), 'utf8');

describe('public mirror documentation', () => {
  test('repository guides state the mainland China product promise and diagnostics', () => {
    const english = read('README.md');
    const chinese = read('README.zh-CN.md');

    expect(english).toContain('reliable Bun installation in mainland China');
    expect(chinese).toContain('在中国大陆可靠下载和安装 Bun');
    for (const source of [english, chinese]) {
      expect(source).toContain('bvm network test');
      expect(source).toContain('https://mirrors.cloud.tencent.com/npm');
      expect(source).toContain('BVM_REGISTRY');
    }
  });

  test('canonical architecture describes npm metadata fallback without stale jsDelivr install claims', () => {
    const architecture = read('my-skills/bvm-architect/references/architecture.md');

    expect(architecture).toContain('src/utils/registry-selector.ts');
    expect(architecture).toContain('BVM_REGISTRY');
    expect(architecture).toContain('Tencent');
    expect(architecture).not.toContain('npm jsDelivr path');
  });

  test('website home pages lead with the public mirror capability', () => {
    expect(read('website/docs/index.md')).toContain('Reliable public mirrors for mainland China');
    expect(read('website/docs/zh/index.md')).toContain('中国大陆公共镜像可靠下载');
  });
});
