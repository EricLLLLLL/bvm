import { colors } from '../utils/ui';
import { homedir } from 'os';
import { delimiter, join } from 'path';
import { rm } from 'fs/promises';
import {
  BVM_DIR,
  BVM_VERSIONS_DIR,
  BVM_BIN_DIR,
  BVM_ALIAS_DIR,
  BVM_SHIMS_DIR,
  OS_PLATFORM,
  CPU_ARCH,
  HAS_AVX2
} from '../constants';
import {
  getInstalledVersions,
  normalizeVersion,
  pathExists,
  ensureDir,
  readDir,
  getActiveVersion,
} from '../utils';
import { withSpinner } from '../command-runner';
import { BunfigManager } from '../utils/bunfig';
import { fetchWithTimeout } from '../utils/network-utils';

type CheckStatus = 'pass' | 'warn' | 'fail';
type ShellType = 'bash' | 'zsh' | 'fish' | 'powershell' | 'cmd' | 'unknown';

export interface DoctorCheckResult {
  key: 'bvm_dir' | 'path' | 'shell' | 'permission' | 'network';
  title: string;
  status: CheckStatus;
  detail: string;
  fixCommand: string;
}

export interface DoctorCheckInput {
  bvmDir: string;
  bvmDirExists: boolean;
  pathHasShims: boolean;
  pathHasBin: boolean;
  shellType: ShellType;
  shellRaw: string;
  directoryWritable: boolean;
  networkReachable: boolean;
  osPlatform: string;
}

interface DoctorReport {
  currentVersion: string | null;
  installedVersions: string[];
  aliases: Array<{ name: string; target: string }>
  env: Record<string, string | undefined>;
  bunfig: { path: string; registry: string | null };
  checks: DoctorCheckResult[];
}

export async function doctor(): Promise<void> {
  await withSpinner('Gathering BVM diagnostics...', async () => {
    const checks = await gatherDoctorChecks();
    const bunfigManager = new BunfigManager();
    const report: DoctorReport = {
      currentVersion: (await getActiveVersion()).version,
      installedVersions: await getInstalledVersions(),
      aliases: await readAliases(),
      env: {
        BVM_DIR,
        BVM_BIN_DIR,
        BVM_SHIMS_DIR,
        BVM_VERSIONS_DIR,
        BVM_TEST_MODE: process.env.BVM_TEST_MODE,
        HOME: process.env.HOME || homedir(),
      },
      bunfig: {
        path: bunfigManager.getPath(),
        registry: bunfigManager.getRegistry(),
      },
      checks,
    };

    printReport(report);
  });
}

async function readAliases(): Promise<Array<{ name: string; target: string }>> {
  if (!(await pathExists(BVM_ALIAS_DIR))) {
    return [];
  }
  const files = await readDir(BVM_ALIAS_DIR);
  const entries: Array<{ name: string; target: string }> = [];
  for (const alias of files) {
    const targetPath = join(BVM_ALIAS_DIR, alias);
    if (await pathExists(targetPath)) {
      const file = await Bun.file(targetPath).text();
      entries.push({ name: alias, target: normalizeVersion(file.trim()) });
    }
  }
  return entries;
}

export function buildDoctorChecks(input: DoctorCheckInput): DoctorCheckResult[] {
  const pathStatus: CheckStatus = input.pathHasShims && input.pathHasBin
    ? 'pass'
    : (!input.pathHasShims && !input.pathHasBin ? 'fail' : 'warn');

  const missingPathTargets: string[] = [];
  if (!input.pathHasShims) missingPathTargets.push(`${input.bvmDir}/shims`);
  if (!input.pathHasBin) missingPathTargets.push(`${input.bvmDir}/bin`);

  const shellStatus: CheckStatus = ['bash', 'zsh', 'fish'].includes(input.shellType) ? 'pass' : 'warn';
  const shellDetail = shellStatus === 'pass'
    ? `Detected ${input.shellType}`
    : `Unsupported or unknown shell (${input.shellRaw || 'empty SHELL'})`;

  const bvmDirCommand = input.osPlatform === 'win32'
    ? '$env:BVM_DIR="$env:USERPROFILE\\.bvm"; New-Item -ItemType Directory -Force -Path $env:BVM_DIR'
    : 'export BVM_DIR="$HOME/.bvm" && mkdir -p "$BVM_DIR"';
  const permCommand = input.osPlatform === 'win32'
    ? 'icacls "$env:BVM_DIR" /grant "$env:USERNAME:(OI)(CI)F" /T'
    : 'chmod -R u+rwX "$BVM_DIR"';
  const pathFixCommand = input.osPlatform === 'win32'
    ? 'bvm setup'
    : 'bvm setup && exec "$SHELL"';
  const shellFixCommand = input.osPlatform === 'win32'
    ? 'bvm setup'
    : 'export SHELL="$(command -v zsh || command -v bash || command -v fish)" && bvm setup';

  return [
    {
      key: 'bvm_dir',
      title: 'BVM_DIR',
      status: input.bvmDirExists ? 'pass' : 'warn',
      detail: input.bvmDirExists ? `Found ${input.bvmDir}` : `Missing directory: ${input.bvmDir}`,
      fixCommand: bvmDirCommand,
    },
    {
      key: 'path',
      title: 'PATH',
      status: pathStatus,
      detail: pathStatus === 'pass'
        ? 'PATH already includes bvm shims/bin'
        : `Missing PATH entries: ${missingPathTargets.join(', ')}`,
      fixCommand: pathFixCommand,
    },
    {
      key: 'shell',
      title: 'Shell Type',
      status: shellStatus,
      detail: shellDetail,
      fixCommand: shellFixCommand,
    },
    {
      key: 'permission',
      title: 'Directory Permission',
      status: input.directoryWritable ? 'pass' : 'fail',
      detail: input.directoryWritable
        ? `Writable: ${input.bvmDir}`
        : `No write permission: ${input.bvmDir}`,
      fixCommand: permCommand,
    },
    {
      key: 'network',
      title: 'Network Connectivity',
      status: input.networkReachable ? 'pass' : 'warn',
      detail: input.networkReachable
        ? 'Able to reach registry.npmjs.org'
        : 'Cannot reach registry.npmjs.org',
      fixCommand: 'bvm config registry auto',
    },
  ];
}

async function gatherDoctorChecks(): Promise<DoctorCheckResult[]> {
  const shellRaw = process.env.SHELL || process.env.ComSpec || '';
  const pathRaw = process.env.PATH || '';
  const bvmDirExists = await pathExists(BVM_DIR);
  const pathHasShims = hasPathEntry(pathRaw, BVM_SHIMS_DIR);
  const pathHasBin = hasPathEntry(pathRaw, BVM_BIN_DIR);
  const directoryWritable = await canWriteBvmDir();
  const networkReachable = await canReachRegistry();

  return buildDoctorChecks({
    bvmDir: BVM_DIR,
    bvmDirExists,
    pathHasShims,
    pathHasBin,
    shellType: detectShellType(shellRaw),
    shellRaw,
    directoryWritable,
    networkReachable,
    osPlatform: OS_PLATFORM,
  });
}

async function canWriteBvmDir(): Promise<boolean> {
  const probeFile = join(BVM_DIR, `.doctor-write-test-${Date.now()}.tmp`);
  try {
    await ensureDir(BVM_DIR);
    await Bun.write(probeFile, 'ok');
    await rm(probeFile, { force: true });
    return true;
  } catch {
    return false;
  }
}

async function canReachRegistry(): Promise<boolean> {
  try {
    const response = await fetchWithTimeout('https://registry.npmjs.org/-/ping', {
      timeout: 2000,
      method: 'GET',
    });
    return response.ok;
  } catch {
    return false;
  }
}

function hasPathEntry(pathValue: string, target: string): boolean {
  const entries = pathValue.split(delimiter).filter(Boolean);
  const normalizedTarget = normalizePath(target);
  return entries.some((entry) => normalizePath(entry) === normalizedTarget);
}

function normalizePath(value: string): string {
  const unified = value.replace(/\\/g, '/').replace(/\/+$/, '');
  return OS_PLATFORM === 'win32' ? unified.toLowerCase() : unified;
}

function detectShellType(shell: string): ShellType {
  const value = shell.toLowerCase();
  if (value.includes('zsh')) return 'zsh';
  if (value.includes('bash')) return 'bash';
  if (value.includes('fish')) return 'fish';
  if (value.includes('pwsh') || value.includes('powershell')) return 'powershell';
  if (value.includes('cmd.exe')) return 'cmd';
  return 'unknown';
}

function formatStatus(status: CheckStatus): string {
  if (status === 'pass') return colors.green('PASS');
  if (status === 'warn') return colors.yellow('WARN');
  return colors.red('FAIL');
}

function printReport(report: DoctorReport): void {
  console.log(colors.bold('\nSystem'));
  console.log(`  OS: ${colors.cyan(OS_PLATFORM)}`);
  console.log(`  Arch: ${colors.cyan(CPU_ARCH)} ${process.arch !== CPU_ARCH ? colors.yellow(`(Process: ${process.arch})`) : ''}`);
  console.log(`  AVX2: ${HAS_AVX2 ? colors.green('Supported') : colors.yellow('Not Supported (Baseline fallback enabled)')}`);

  console.log(colors.bold('\nDoctor Checks'));
  report.checks.forEach((check) => {
    console.log(`  [${formatStatus(check.status)}] ${check.title}: ${check.detail}`);
    console.log(`      Fix: ${colors.cyan(check.fixCommand)}`);
  });

  console.log(colors.bold('\nDirectories'));
  console.log(`  BVM_DIR: ${colors.cyan(report.env.BVM_DIR || '')}`);
  console.log(`  BIN_DIR: ${colors.cyan(BVM_BIN_DIR)}`);
  console.log(`  SHIMS_DIR: ${colors.cyan(BVM_SHIMS_DIR)}`);
  console.log(`  VERSIONS_DIR: ${colors.cyan(BVM_VERSIONS_DIR)}`);

  console.log(colors.bold('\nEnvironment'));
  console.log(`  HOME: ${report.env.HOME || 'n/a'}`);
  console.log(`  BVM_TEST_MODE: ${report.env.BVM_TEST_MODE || 'false'}`);

  console.log(colors.bold('\nInstalled Versions'));
  if (report.installedVersions.length === 0) {
    console.log('  (none installed)');
  } else {
    report.installedVersions.forEach((version) => {
      const isCurrent = version === report.currentVersion;
      const prefix = isCurrent ? colors.green('*') : ' ';
      const display = isCurrent ? colors.green(version) : version;
      const marker = isCurrent ? colors.green(' (current)') : '';
      console.log(`  ${prefix} ${display}${marker}`);
    });
  }

  console.log(colors.bold('\nConfiguration'));
  console.log(`  Bunfig: ${colors.cyan(report.bunfig.path)}`);
  console.log(`  Registry: ${report.bunfig.registry ? colors.green(report.bunfig.registry) : colors.dim('default')}`);

  console.log(colors.bold('\nAliases'));
  if (report.aliases.length === 0) {
    console.log('  (no aliases configured)');
  } else {
    report.aliases.forEach((alias) => {
      console.log(`  ${alias.name} ${colors.gray('->')} ${colors.cyan(alias.target)}`);
    });
  }

  console.log('\n' + colors.green('Diagnostics complete.'));
}
