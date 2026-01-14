import { join, dirname } from 'path';
import { pathExists } from './utils';

/**
 * Looks for a .bvmrc file starting from the current directory and moving up.
 * @returns The version string found in .bvmrc, or null if not found.
 */
export async function getRcVersion(): Promise<string | null> {
  let currentDir = process.cwd();
  
  while (true) {
    const rcPath = join(currentDir, '.bvmrc');
    if (await pathExists(rcPath)) {
      try {
        const content = await Bun.file(rcPath).text();
        return content.trim();
      } catch (error) {
        // Ignore read errors, proceed or return null
        return null;
      }
    }

    const parentDir = dirname(currentDir);
    if (parentDir === currentDir) {
      // Reached root
      break;
    }
    currentDir = parentDir;
  }
  
  return null;
}
