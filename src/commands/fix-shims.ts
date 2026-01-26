import { join } from 'path';
import { readdir, readFile, writeFile } from 'fs/promises';
import { BVM_CURRENT_DIR } from '../constants';
import { colors } from '../utils/ui';
import { fixShimContent } from '../utils/windows-shim-fixer';
import { pathExists, getSymlinkTarget } from '../utils';

export async function fixShimsCommand() {
    if (process.platform !== 'win32') {
        console.log(colors.yellow('This command is only for Windows.'));
        return;
    }

    const binDir = join(BVM_CURRENT_DIR, 'bin');
    if (!(await pathExists(binDir))) {
        console.log(colors.red(`Global bin directory not found at ${binDir}`));
        return;
    }

    // Resolve real path of current version
    const versionDir = await getSymlinkTarget(BVM_CURRENT_DIR);
    if (!versionDir) {
        console.log(colors.red('Could not resolve current Bun version directory.'));
        return;
    }

    console.log(colors.cyan(`Scanning for broken shims in ${binDir}...`));
    
    const files = await readdir(binDir);
    let fixedCount = 0;

    for (const file of files) {
        if (file.endsWith('.cmd')) {
            const filePath = join(binDir, file);
            const content = await readFile(filePath, 'utf8');
            const fixed = fixShimContent(content, versionDir);
            
            if (content !== fixed) {
                await writeFile(filePath, fixed, 'utf8');
                console.log(colors.green(`✓ Fixed ${file}`));
                fixedCount++;
            }
        }
    }

    if (fixedCount === 0) {
        console.log(colors.gray('No broken shims found.'));
    } else {
        console.log(colors.green(`\nSuccessfully fixed ${fixedCount} shim(s).`));
    }
}
