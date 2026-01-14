import { join } from 'path';
import { readTextFile, writeTextFile, pathExists, ensureDir } from '../utils';
import { BVM_CACHE_DIR, IS_TEST_MODE } from '../constants';
import { fetchLatestBvmReleaseInfo } from '../api';
import { gt } from './semver-lite';
import { colors } from './ui';
import packageJson from '../../package.json';

const UPDATE_CHECK_FILE = 'update-check.json';
const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface UpdateInfo {
  lastChecked: number;
  latestVersion: string;
}

export async function notifyUpdate(): Promise<void> {
  if (IS_TEST_MODE) return;
  const cacheFile = join(BVM_CACHE_DIR, UPDATE_CHECK_FILE);
  try {
    if (await pathExists(cacheFile)) {
      const updateInfo: UpdateInfo = JSON.parse(await readTextFile(cacheFile));
      if (updateInfo.latestVersion && gt(updateInfo.latestVersion, packageJson.version)) {
        printUpdateBox(packageJson.version, updateInfo.latestVersion);
      }
    }
  } catch (e) {}
}

export async function checkUpdateBackground(): Promise<void> {
  if (IS_TEST_MODE) return;
  const cacheFile = join(BVM_CACHE_DIR, UPDATE_CHECK_FILE);
  let lastChecked = 0;
  
  try {
      if (await pathExists(cacheFile)) {
          const info = JSON.parse(await readTextFile(cacheFile));
          lastChecked = info.lastChecked || 0;
      }
  } catch(e) {}

  if (Date.now() - lastChecked > CHECK_INTERVAL_MS) {
     await refreshUpdateInfo(cacheFile);
  }
}

async function refreshUpdateInfo(cacheFile: string) {
    let latestVersion = '';
    try {
        const latestRelease = await fetchLatestBvmReleaseInfo();
        if (latestRelease) {
            latestVersion = latestRelease.tagName.replace(/^v/, '');
        }
    } catch (e) {}

    // Always update timestamp to prevent blocking every run if network is down
    try {
        await ensureDir(BVM_CACHE_DIR);
        let existing: UpdateInfo = { lastChecked: 0, latestVersion: '' };
        if (await pathExists(cacheFile)) {
             try { existing = JSON.parse(await readTextFile(cacheFile)); } catch {}
        }
        
        const newInfo: UpdateInfo = {
            lastChecked: Date.now(),
            latestVersion: latestVersion || existing.latestVersion
        };
        await writeTextFile(cacheFile, JSON.stringify(newInfo));
    } catch (e) {}
}
function printUpdateBox(current: string, latest: string) {
  const message = `Update available! ${colors.dim(current)} -> ${colors.green(latest)}`;
  const command = `Run ${colors.cyan('bvm upgrade')} to update`;
  
  // Simple box drawing
  const lineLength = Math.max(stripAnsi(message).length, stripAnsi(command).length) + 4;
  const top = '╭' + '─'.repeat(lineLength) + '╮';
  const bottom = '╰' + '─'.repeat(lineLength) + '╯';
  const pad = (str: string) => {
      const len = stripAnsi(str).length;
      const rightPad = lineLength - 2 - len;
      return '│ ' + str + ' '.repeat(rightPad) + ' │';
  };

  console.log('\n' + colors.yellow(top));
  console.log(colors.yellow(pad(message)));
  console.log(colors.yellow(pad(command)));
  console.log(colors.yellow(bottom) + '\n');
}

function stripAnsi(str: string) {
  return str.replace(/[][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
}
