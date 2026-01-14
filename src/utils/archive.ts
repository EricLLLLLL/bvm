import { runCommand } from '../helpers/process';
import { OS_PLATFORM } from '../constants';
import { join } from 'path';
import { spawn } from 'node:child_process';

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
      await runCommand(['unzip', '-o', '-q', sourcePath, '-d', destDir], {
        stdout: 'ignore',
        stderr: 'inherit'
      });
    }
  } else if (sourcePath.endsWith('.tar.gz') || sourcePath.endsWith('.tgz')) {
    // Use node:child_process spawn for tar to avoid Bun.spawn hangs on Windows VMs
    await new Promise<void>((resolve, reject) => {
        const p = spawn('tar', ['-xzf', sourcePath, '-C', destDir], {
            stdio: 'inherit', // Important: inherit ensures buffers don't fill up
            shell: false
        });
        
        p.on('close', (code) => {
            if (code === 0) resolve();
            else reject(new Error(`tar exited with code ${code}`));
        });
        
        p.on('error', (err) => reject(err));
    });
  } else {
    throw new Error(`Unsupported archive format: ${sourcePath}`);
  }
}
