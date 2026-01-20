#!/usr/bin/env node

/**
 * BVM NPM Smart Entry Point
 */

const { spawnSync } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

const IS_WINDOWS = os.platform() === 'win32';
const HOME = process.env.HOME || os.homedir();
const BVM_DIR = process.env.BVM_DIR || path.join(HOME, '.bvm');
const BVM_SRC = path.join(BVM_DIR, 'src', 'index.js');
const BUN_RUNTIME = path.join(BVM_DIR, 'runtime', 'current', 'bin', IS_WINDOWS ? 'bun.exe' : 'bun');

function run(bin, args) {
    return spawnSync(bin, args, {
        stdio: 'inherit',
        env: Object.assign({}, process.env, { BVM_DIR }),
        shell: IS_WINDOWS && bin.indexOf(' ') !== -1
    });
}

// 1. 优先尝试 BVM 内部的地堡运行时
if (fs.existsSync(BUN_RUNTIME)) {
    const result = run(BUN_RUNTIME, [BVM_SRC, ...process.argv.slice(2)]);
    process.exit(result.status || 0);
}

// 2. 其次尝试使用 Node 寻找系统中的 bun (比如通过 npm install -g bun 安装的)
try {
    // 简单通过 spawn 检查 bun 是否在 PATH 中
    const check = spawnSync(IS_WINDOWS ? 'bun.exe' : 'bun', ['--version'], { stdio: 'ignore' });
    if (check.status === 0) {
        const result = run(IS_WINDOWS ? 'bun.exe' : 'bun', [BVM_SRC, ...process.argv.slice(2)]);
        process.exit(result.status || 0);
    }
} catch (e) {}

// 3. 如果都没有，给出清晰的指引（或者在未来版本支持自动下载）
console.error('\x1b[31m[bvm] Error: No Bun runtime found.\x1b[0m');
console.error('BVM requires Bun to function. Since you installed via npm, please run:');
console.error('\x1b[36m  bvm setup\x1b[0m (if available) or install Bun manually.');
process.exit(1);