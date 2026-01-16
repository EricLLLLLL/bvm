import { readdir, mkdir, stat, symlink, unlink, rm, readlink, realpath } from 'fs/promises';
import { join, dirname, basename } from 'path';
import { valid, satisfies, rcompare } from './utils/semver-lite';
import { BVM_VERSIONS_DIR } from './constants';

export async function ensureDir(dirPath: string): Promise<void> {
  await mkdir(dirPath, { recursive: true });
}

export async function pathExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return false;
    }
    throw error;
  }
}

export async function createSymlink(target: string, path: string): Promise<void> {
  try {
    await unlink(path);
  } catch (error) {
    // Ignore if path doesn't exist
    // On Windows, unlink might fail for directory symlinks/junctions, try rm
    try {
        await rm(path, { recursive: true, force: true });
    } catch (e) {}
  }
  const type = process.platform === 'win32' ? 'junction' : 'dir';
  await symlink(target, path, type);
}

export async function getSymlinkTarget(path: string): Promise<string | null> {
  try {
    return await readlink(path);
  } catch (error: any) {
    if (error.code === 'ENOENT' || error.code === 'EINVAL') {
      return null;
    }
    throw error;
  }
}

export async function removeDir(dirPath: string): Promise<void> {
  await rm(dirPath, { recursive: true, force: true });
}

export async function readDir(dirPath: string): Promise<string[]> {
  try {
    return await readdir(dirPath);
  } catch (error: any) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

export async function readTextFile(filePath: string): Promise<string> {
  const file = Bun.file(filePath);
  return await file.text();
}

export async function writeTextFile(filePath: string, data: string | Uint8Array): Promise<void> {
  await Bun.write(filePath, data);
}

/**
 * Atomically replaces a file with new content, with optional backup.
 */
export async function safeSwap(filePath: string, newContent: string | Uint8Array, options: { backup?: boolean } = {}): Promise<void> {
    const { backup = true } = options;
    const dir = dirname(filePath);
    await ensureDir(dir);
    
    const tempPath = `${filePath}.tmp-${Date.now()}`;
    const bakPath = `${filePath}.bak`;

    try {
        // 1. Write to temp file
        await writeTextFile(tempPath, newContent);

        // 2. Backup existing file if requested
        if (backup && await pathExists(filePath)) {
            try {
                const { rename, unlink } = await import('fs/promises');
                if (await pathExists(bakPath)) await unlink(bakPath).catch(() => {});
                await rename(filePath, bakPath);
            } catch (e) {
                // Fallback if backup fails
            }
        }

        // 3. Atomic rename (works best on POSIX, on Windows it might fail if locked)
        const { rename } = await import('fs/promises');
        try {
            await rename(tempPath, filePath);
        } catch (e) {
            // Fallback for Windows if file is locked or cross-device
            await Bun.write(filePath, newContent);
            await unlink(tempPath).catch(() => {});
        }
    } catch (error) {
        const { unlink } = await import('fs/promises');
        await unlink(tempPath).catch(() => {});
        throw error;
    }
}

export function normalizeVersion(version: string): string {
  let normalized = version.trim();
  if (normalized.startsWith('bun-v')) {
    normalized = normalized.substring(4);
  }
  // Only prepend 'v' if it doesn't already have it and looks like a version (starts with digit)
  if (!normalized.startsWith('v') && /^\d/.test(normalized)) {
    normalized = `v${normalized}`;
  }
  return normalized;
}

export async function getInstalledVersions(): Promise<string[]> {
  await ensureDir(BVM_VERSIONS_DIR);
  const dirs = await readDir(BVM_VERSIONS_DIR);
  return dirs.filter(dir => valid(normalizeVersion(dir))).sort(rcompare);
}

/**
 * The core version resolution logic for BVM 2.0.
 * Priority: Env Variable > .bvmrc File > Default Alias
 */
export async function getActiveVersion(): Promise<{ version: string | null, source: 'env' | '.bvmrc' | 'current' | 'default' | null }> {
  // 1. Session Environment Variable
  if (process.env.BVM_ACTIVE_VERSION) {
    return { version: normalizeVersion(process.env.BVM_ACTIVE_VERSION), source: 'env' };
  }

  // 2. Project Local .bvmrc
  const rcPath = join(process.cwd(), '.bvmrc');
  if (await pathExists(rcPath)) {
    const content = (await readTextFile(rcPath)).trim();
    return { version: normalizeVersion(content), source: '.bvmrc' };
  }

  // 3. Current Symlink (set by 'bvm use')
  const { getBvmDir } = await import('./constants');
  const bvmDir = getBvmDir();
  const currentDir = join(bvmDir, 'current');
  const aliasDir = join(bvmDir, 'aliases');

  if (await pathExists(currentDir)) {
      const { realpath } = await import('fs/promises');
      try {
          const realPath = await realpath(currentDir);
          return { version: normalizeVersion(basename(realPath)), source: 'current' };
      } catch (e) {}
  }

  // 4. Global Default Alias
  const defaultPath = join(aliasDir, 'default');
  if (await pathExists(defaultPath)) {
    const content = (await readTextFile(defaultPath)).trim();
    return { version: normalizeVersion(content), source: 'default' };
  }

  return { version: null, source: null };
}

export function resolveVersion(targetVersion: string, availableVersions: string[]): string | null {
  if (!targetVersion || availableVersions.length === 0) {
    return null;
  }

  const normalizedTarget = normalizeVersion(targetVersion);

  // 1. Exact match (Highest priority)
  if (availableVersions.includes(normalizedTarget)) {
    return normalizedTarget;
  }

  // 2. Handle 'latest'
  if (targetVersion.toLowerCase() === 'latest') {
    return availableVersions[0];
  }

  // 3. Strict Check: If it's a full 3-part version (x.y.z) and didn't match exactly, fail.
  // This prevents '1.3.3' from matching '1.3.5' via fuzzy logic.
  const isFullVersion = /^\d+\.\d+\.\d+$/.test(targetVersion.replace(/^v/, ''));
  if (isFullVersion) {
      return null;
  }

  // Ensure targetVersion looks like a version/range before fuzzy matching
  if (!/^[v\d]/.test(targetVersion)) {
    return null;
  }

  // 4. Fuzzy / Range match for partial versions (e.g., "1.3" -> "~1.3.0")
  const range = targetVersion.startsWith('v') ? `~${targetVersion.substring(1)}` : `~${targetVersion}`;
  const matches = availableVersions.filter(v => satisfies(v, range));

  if (matches.length > 0) {
    return matches.sort(rcompare)[0];
  }
  
  return null;
}
