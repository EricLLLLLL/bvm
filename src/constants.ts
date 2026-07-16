import { homedir } from 'os';
import { join } from 'path';

import { spawnSync } from 'child_process';

// Platform detection
export const OS_PLATFORM = process.platform;
export const TEST_REMOTE_VERSIONS = ['v1.3.4', 'v1.2.23', 'v1.1.21', 'v1.1.20', 'v1.1.0', 'v1.0.0', 'bun-v1.4.0-canary'];

export function isTestMode(): boolean {
    return process.env.BVM_TEST_MODE === 'true';
}

function getNativeArch() {
    const arch = process.arch;
    if (OS_PLATFORM === 'darwin' && arch === 'x64') {
        try {
            // Check if we are running under Rosetta 2
            const check = spawnSync('sysctl', ['-n', 'sysctl.proc_translated'], { encoding: 'utf-8' });
            if (check.stdout.trim() === '1') {
                return 'arm64';
            }
        } catch (e) {}
    }
    return arch;
}

type CommandProbe = (command: string, args: string[]) => {
    status: number | null;
    stdout: string;
};

export function detectAvx2Support(
    platform: string,
    arch: string,
    run: CommandProbe = (command, args) => {
        const result = spawnSync(command, args, { encoding: 'utf-8' });
        return { status: result.status, stdout: result.stdout || '' };
    },
): boolean {
    if (arch !== 'x64') return true;
    try {
        if (platform === 'win32') {
            const result = run('powershell', [
                '-NoProfile',
                '-Command',
                `(Add-Type -MemberDefinition '[DllImport("kernel32.dll")] public static extern bool IsProcessorFeaturePresent(int ProcessorFeature);' -Name 'Kernel32' -Namespace 'Win32' -PassThru)::IsProcessorFeaturePresent(40);`,
            ]);
            return result.status === 0 && result.stdout.trim() === 'True';
        }
        if (platform === 'darwin') {
            const result = run('sysctl', ['-n', 'machdep.cpu']);
            return result.status === 0 && result.stdout.includes('AVX2');
        }
        if (platform === 'linux') {
            const result = run('cat', ['/proc/cpuinfo']);
            return result.status === 0 && result.stdout.includes('avx2');
        }
    } catch (e) {}
    return false;
}

let cachedCpuArch: string | undefined;
let cachedAvx2Support: boolean | undefined;

export function getCpuArch(): string {
    cachedCpuArch ??= getNativeArch();
    return cachedCpuArch;
}

export function hasAvx2Support(): boolean {
    cachedAvx2Support ??= detectAvx2Support(OS_PLATFORM, getCpuArch());
    return cachedAvx2Support;
}

// Helper to get BVM_DIR dynamically
export function getBvmDir() {
    if (process.env.BVM_DIR) return process.env.BVM_DIR;
    const HOME = process.env.HOME || homedir();
    return join(HOME, '.bvm');
}

export const BVM_DIR = getBvmDir();
export const BVM_SRC_DIR = join(BVM_DIR, 'src');
export const BVM_VERSIONS_DIR = join(BVM_DIR, 'versions');
export const BVM_RUNTIME_DIR = join(BVM_DIR, 'runtime');
export const BVM_BIN_DIR = join(BVM_DIR, 'bin');
export const BVM_SHIMS_DIR = join(BVM_DIR, 'shims');
export const BVM_CURRENT_DIR = join(BVM_DIR, 'current');
export const BVM_ALIAS_DIR = join(BVM_DIR, 'aliases');
export const BVM_CACHE_DIR = join(BVM_DIR, 'cache');
export const BVM_FINGERPRINTS_FILE = join(BVM_DIR, 'fingerprints.json');

export const EXECUTABLE_NAME = OS_PLATFORM === 'win32' ? 'bun.exe' : 'bun';
export const REPO_FOR_BVM_CLI = 'EricLLLLLL/bvm';
export const ASSET_NAME_FOR_BVM = OS_PLATFORM === 'win32' ? 'bvm.exe' : 'bvm';
export const USER_AGENT = 'bvm (Bun Version Manager)';

export function getBunAssetName(_version: string): string {
  let platform = OS_PLATFORM === 'win32' ? 'windows' : OS_PLATFORM;
  let arch = getCpuArch() === 'arm64' ? 'aarch64' : 'x64';
  let baseline = (!hasAvx2Support() && arch === 'x64') ? '-baseline' : '';
  return `bun-${platform}-${arch}${baseline}.zip`;
}
