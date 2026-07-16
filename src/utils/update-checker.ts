import { dirname, join } from 'path';
import { BVM_CACHE_DIR, isTestMode } from '../constants';
import { pathExists, readTextFile, writeTextFile, ensureDir } from '../utils';
import { fetchLatestBvmReleaseInfo } from '../api';
import { gt } from './semver-lite';
import packageJson from '../../package.json';
import { colors } from './ui';

const UPDATE_CACHE_FILE = 'update-check.json';
const CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Checks for updates in the background. 
 * This is non-blocking and writes the result to a local cache.
 */
interface UpdateCheckOptions {
    cacheFile?: string;
    fetchLatest?: typeof fetchLatestBvmReleaseInfo;
    force?: boolean;
    now?: () => number;
}

export async function triggerUpdateCheck(options: UpdateCheckOptions = {}): Promise<void> {
    if (!options.force && (process.env.CI || isTestMode())) return;

    const cachePath = options.cacheFile || join(BVM_CACHE_DIR, UPDATE_CACHE_FILE);
    const now = options.now || Date.now;
    
    try {
        if (await pathExists(cachePath)) {
            const content = await readTextFile(cachePath);
            const cache = JSON.parse(content);
            // Don't check more than once a day
            const lastAttempt = cache.lastAttempt ?? cache.lastCheck;
            if (typeof lastAttempt === 'number' && now() - lastAttempt < CHECK_INTERVAL) return;
        }
    } catch (e) {}

    await ensureDir(dirname(cachePath));
    await writeTextFile(cachePath, JSON.stringify({ lastAttempt: now() }));

    // Perform check
    try {
        const latest = await (options.fetchLatest || fetchLatestBvmReleaseInfo)();
        if (latest) {
            const latestVersion = latest.version.startsWith('v') ? latest.version.slice(1) : latest.version;
            await writeTextFile(cachePath, JSON.stringify({
                lastAttempt: now(),
                latestVersion
            }));
        }
    } catch (e) {
        // Silently fail on network issues
    }
}

/**
 * Returns a formatted notification string if an update is available.
 */
export async function getUpdateNotification(): Promise<string | null> {
    if (process.env.CI || isTestMode()) return null;

    const currentVersion = packageJson.version;
    const cachePath = join(BVM_CACHE_DIR, UPDATE_CACHE_FILE);

    try {
        if (await pathExists(cachePath)) {
            const content = await readTextFile(cachePath);
            const cache = JSON.parse(content);
            if (cache.latestVersion && gt(cache.latestVersion, currentVersion)) {
                return `\n${colors.gray('Update available:')} ${colors.green(`v${cache.latestVersion}`)} ${colors.dim(`(current: v${currentVersion})`)}
${colors.gray('Run')} ${colors.cyan('bvm upgrade')} ${colors.gray('to update.')}`;
            }
        }
    } catch (e) {}
    return null;
}
