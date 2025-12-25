import { runCommand } from '../helpers/process';
import { OS_PLATFORM } from '../constants';
import { join } from 'path';

/**
 * Extracts an archive (zip or tar.gz) using system tools.
 * Avoids heavy dependencies like extract-zip or unzipper.
 */
export async function extractArchive(sourcePath: string, destDir: string): Promise<void> {
  if (sourcePath.endsWith('.zip')) {
    if (OS_PLATFORM === 'win32') {
      // Use PowerShell on Windows
      // Expand-Archive -Path "src" -DestinationPath "dest" -Force
      await runCommand(['powershell', '-Command', `Expand-Archive -Path "${sourcePath}" -DestinationPath "${destDir}" -Force`], {
        stdout: 'ignore',
        stderr: 'inherit'
      });
    } else {
      // Use unzip on Unix
      // Check if unzip exists? Most Linux/Mac have it.
      // If not, we might be in trouble, but let's assume standard env.
      await runCommand(['unzip', '-o', '-q', sourcePath, '-d', destDir], {
        stdout: 'ignore',
        stderr: 'inherit'
      });
    }
  } else if (sourcePath.endsWith('.tar.gz') || sourcePath.endsWith('.tgz')) {
    // Use tar on all platforms (Windows 10+ has tar)
    await runCommand(['tar', '-xzf', sourcePath, '-C', destDir], {
        stdout: 'ignore',
        stderr: 'inherit'
    });
  } else {
    throw new Error(`Unsupported archive format: ${sourcePath}`);
  }
}
