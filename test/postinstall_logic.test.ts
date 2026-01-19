import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { join, dirname } from 'path';
import { mkdir, rm, writeFile, chmod } from 'fs/promises';
import { tmpdir } from 'os';
import { spawnSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';

const SCRIPT_PATH = join(process.cwd(), 'scripts', 'postinstall.js');
const MOCK_BIN_DIR = join(process.cwd(), 'test', 'mock-bin');

function runPostinstall(env: Record<string, string>) {
  return spawnSync('node', [SCRIPT_PATH], {
    env: { ...process.env, ...env },
    encoding: 'utf-8',
    stdio: 'pipe'
  });
}

function getNodePath() {
    const whichNode = spawnSync('which', ['node'], { encoding: 'utf-8' });
    if (whichNode.status === 0) return dirname(whichNode.stdout.trim());
    return '/usr/bin'; // Fallback
}

const NODE_BIN_DIR = getNodePath();

describe('Postinstall Logic (Integration)', () => {
  let tempBvmDir: string;
  let tempHome: string;
  let tempSrcDir: string;

  beforeEach(async () => {
    tempHome = join(tmpdir(), `bvm-test-home-${Date.now()}`);
    tempBvmDir = join(tempHome, '.bvm');
    tempSrcDir = join(tempBvmDir, 'src');
    
    await mkdir(tempHome, { recursive: true });
    await mkdir(MOCK_BIN_DIR, { recursive: true });
  });

  afterEach(async () => {
    await rm(tempHome, { recursive: true, force: true });
    await rm(MOCK_BIN_DIR, { recursive: true, force: true });
  });

  it('should download runtime when no system bun is present', async () => {
    const env = {
      HOME: tempHome,
      BVM_DIR: tempBvmDir,
      PATH: `/bin:/usr/bin:${NODE_BIN_DIR}`, 
      BVM_FORCE_INSTALL: 'true'
    };

    const result = runPostinstall(env);
    
    const output = result.stdout ? result.stdout.toString() : '';
    expect(output).toContain('No compatible system Bun found');
    expect(output).toContain('Downloading Bun');
  });

  it('should reuse system bun if compatible (Smoke Test Passed)', async () => {
    const mockBunPath = join(MOCK_BIN_DIR, 'bun');
    const mockScript = `#!/bin/sh
if [ "$1" = "--version" ]; then
  echo "1.3.6"
  exit 0
fi
if [ "$2" = "--version" ]; then
  echo "1.0.0"
  exit 0
fi
`;
    await writeFile(mockBunPath, mockScript);
    await chmod(mockBunPath, 0o755);

    const distDir = join(process.cwd(), 'dist');
    if (!existsSync(distDir)) await mkdir(distDir);
    if (!existsSync(join(distDir, 'index.js'))) await writeFile(join(distDir, 'index.js'), '// dummy');
    if (!existsSync(join(distDir, 'bvm-shim.sh'))) await writeFile(join(distDir, 'bvm-shim.sh'), '# dummy');
    if (!existsSync(join(distDir, 'bvm-shim.js'))) await writeFile(join(distDir, 'bvm-shim.js'), '// dummy');

    const env = {
      HOME: tempHome,
      BVM_DIR: tempBvmDir,
      PATH: `${MOCK_BIN_DIR}:${process.env.PATH}`,
    };

    const result = runPostinstall(env);
    const output = result.stdout ? result.stdout.toString() : '';

    expect(output).toContain('System Bun detected at');
    expect(output).toContain('Smoke test passed');
    
    const versionDir = join(tempBvmDir, 'versions', 'v1.3.6');
    expect(existsSync(join(versionDir, 'bin', 'bun'))).toBe(true);
    
    const defaultAlias = join(tempBvmDir, 'aliases', 'default');
    expect(readFileSync(defaultAlias, 'utf-8')).toBe('v1.3.6');
  });

  it('should fallback to download if smoke test fails', async () => {
    const mockBunPath = join(MOCK_BIN_DIR, 'bun');
    const mockScript = `#!/bin/sh
if [ "$1" = "--version" ]; then
  echo "0.1.0"
  exit 0
fi
if [ "$2" = "--version" ]; then
  exit 1
fi
`;
    await writeFile(mockBunPath, mockScript);
    await chmod(mockBunPath, 0o755);

    const distDir = join(process.cwd(), 'dist');
    if (!existsSync(distDir)) await mkdir(distDir);
    if (!existsSync(join(distDir, 'index.js'))) await writeFile(join(distDir, 'index.js'), '// dummy');

    const env = {
      HOME: tempHome,
      BVM_DIR: tempBvmDir,
      PATH: `${MOCK_BIN_DIR}:${process.env.PATH}`,
    };

    const result = runPostinstall(env);
    const output = result.stdout ? result.stdout.toString() : '';

    expect(output).toContain('System Bun detected at');
    expect(output).toContain('No compatible system Bun found');
    expect(output).toContain('Downloading Bun');
    
    const oldVersionDir = join(tempBvmDir, 'versions', 'v0.1.0');
    expect(existsSync(join(oldVersionDir, 'bin', 'bun'))).toBe(true);
  });
});