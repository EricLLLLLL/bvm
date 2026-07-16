import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'fs';
import { join } from 'path';

const root = process.cwd();

describe('release safety contract', () => {
  test('local release preparation never stages or commits files', () => {
    const script = readFileSync(join(root, 'scripts/release.ts'), 'utf8');

    expect(script).not.toMatch(/runGit\(['"](?:add|commit|push|tag)['"]/);
    expect(script).not.toMatch(/git\s+(?:add|commit|push|tag)\b/);
    expect(script).toContain('Review these generated changes');
  });

  test('GitHub release verifies before publishing and never force-updates tags', () => {
    const workflow = readFileSync(join(root, '.github/workflows/auto-release.yml'), 'utf8');

    expect(workflow).toContain('run: bun run verify');
    expect(workflow).not.toContain('git tag -f');
    expect(workflow).not.toContain('git push -f');
    expect(workflow).toContain('oven-sh/setup-bun@v2');
    expect(workflow).toContain("bun-version: '1.3.11'");
  });

  test('package exposes one reproducible verification entrypoint', () => {
    const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

    expect(pkg.scripts.typecheck).toBeDefined();
    expect(pkg.scripts['test:unit']).toBeDefined();
    expect(pkg.scripts['test:isolated']).toBeDefined();
    expect(pkg.scripts['test:e2e']).toBeDefined();
    expect(pkg.scripts['test:coverage']).toBeDefined();
    expect(pkg.scripts.verify).toBeDefined();
  });

  test('CI typechecks the isolated Remotion project with its own dependencies', () => {
    const websiteTsconfig = readFileSync(join(root, 'website/tsconfig.json'), 'utf8');
    const workflow = readFileSync(join(root, '.github/workflows/ci.yml'), 'utf8');
    const remotionPkg = JSON.parse(readFileSync(join(root, 'website/remotion-bvm/package.json'), 'utf8'));

    expect(websiteTsconfig).toContain('"exclude": ["remotion-bvm"]');
    expect(workflow).toContain('npm ci --prefix website/remotion-bvm');
    expect(workflow).toContain('npm exec --prefix website/remotion-bvm tsc');
    expect(remotionPkg.devDependencies['@types/node']).toBeDefined();
  });
});
