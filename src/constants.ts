import { homedir } from 'os';
import { join } from 'path';

// Platform detection
export const OS_PLATFORM = process.platform;
export const CPU_ARCH = process.arch;
export const IS_TEST_MODE = process.env.BVM_TEST_MODE === 'true';
export const TEST_REMOTE_VERSIONS = ['v1.3.4', 'v1.2.23', 'v1.0.0', 'bun-v1.4.0-canary'];

// Helper to get BVM_DIR dynamically
export function getBvmDir() {
    const HOME = process.env.HOME || homedir();
    return join(HOME, '.bvm');
}

// These are still exported as constants for convenience, but they will be re-evaluated if needed
// Actually, since most commands are short-lived, re-evaluating on startup is fine.
// The issue is when the module is loaded once and HOME changes later (which happens in tests).

export const BVM_DIR = getBvmDir();
export const BVM_SRC_DIR = join(BVM_DIR, 'src');
export const BVM_VERSIONS_DIR = join(BVM_DIR, 'versions');
export const BVM_BIN_DIR = join(BVM_DIR, 'bin');
export const BVM_SHIMS_DIR = join(BVM_DIR, 'shims');
export const BVM_CURRENT_DIR = join(BVM_DIR, 'current');
export const BVM_ALIAS_DIR = join(BVM_DIR, 'aliases');
export const BVM_CACHE_DIR = join(BVM_DIR, 'cache');

export const EXECUTABLE_NAME = OS_PLATFORM === 'win32' ? 'bun.exe' : 'bun';
export const BUN_GITHUB_RELEASES_API = 'https://api.github.com/repos/oven-sh/bun/releases';
export const REPO_FOR_BVM_CLI = 'EricLLLLLL/bvm';
export const ASSET_NAME_FOR_BVM = OS_PLATFORM === 'win32' ? 'bvm.exe' : 'bvm';
export const USER_AGENT = 'bvm (Bun Version Manager)';

export const BVM_CDN_ROOT = 'https://cdn.jsdelivr.net/gh/EricLLLLLL/bvm';

export interface BvmComponent {
    name: string;
    remotePath: string; // Relative to CDN root (dist/)
    localPath: string;  // Relative to BVM_DIR
    platform?: 'win32' | 'posix';
}

export const BVM_COMPONENTS: BvmComponent[] = [
    { name: 'CLI Core', remotePath: 'index.js', localPath: 'src/index.js' },
    { name: 'Windows Shim', remotePath: 'bvm-shim.js', localPath: 'bin/bvm-shim.js', platform: 'win32' },
    { name: 'Unix Shim', remotePath: 'bvm-shim.sh', localPath: 'bin/bvm-shim.sh', platform: 'posix' },
];

export function getBunAssetName(version: string): string {
  let platform = OS_PLATFORM === 'win32' ? 'windows' : OS_PLATFORM;
  let arch = CPU_ARCH === 'arm64' ? 'aarch64' : 'x64';
  return `bun-${platform}-${arch}.zip`;
}
