import { join } from 'path';
import { readdir } from 'fs/promises';
import { spawnSync } from 'child_process';

/**
 * BVM Build Guard: Validates all templates for syntax errors.
 */

const TEMPLATE_DIR = join(process.cwd(), 'src', 'templates');

async function checkJsSyntax(filePath: string) {
    const res = spawnSync('node', ['--check', filePath]);
    if (res.status !== 0) {
        console.error(`\n❌ Syntax Error in template: ${filePath}`);
        console.error(res.stderr.toString());
        return false;
    }
    return true;
}

async function main() {
    console.log('🛡️  BVM Template Guard: Scanning for errors...');
    
    let failed = false;
    const walk = async (dir: string) => {
        const files = await readdir(dir, { withFileTypes: true });
        for (const file of files) {
            const fullPath = join(dir, file.name);
            if (file.isDirectory()) {
                await walk(fullPath);
            } else if (file.name.endsWith('.js')) {
                if (!(await checkJsSyntax(fullPath))) failed = true;
            }
        }
    };

    await walk(TEMPLATE_DIR);

    if (failed) {
        console.error('\n🚨 Build failed: One or more templates have errors.');
        process.exit(1);
    } else {
        console.log('✅ All templates passed inspection.');
    }
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
