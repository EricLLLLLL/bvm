#!/usr/bin/env bun

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';

function md5File(path: string): string {
  const buf = readFileSync(path);
  return createHash('md5').update(buf).digest('hex');
}

function main() {
  const root = process.cwd();
  const pkgPath = join(root, 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));

  const cli = join(root, 'dist', 'index.js');
  const shimWin = join(root, 'dist', 'bvm-shim.js');
  const shimUnix = join(root, 'dist', 'bvm-shim.sh');
  const installSh = join(root, 'install.sh');
  const installPs1 = join(root, 'install.ps1');

  pkg.bvm_fingerprints = {
    cli: md5File(cli),
    shim_win: md5File(shimWin),
    shim_unix: md5File(shimUnix),
    install_sh: md5File(installSh),
    install_ps1: md5File(installPs1),
  };

  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');
  console.log('✓ Fingerprints updated in package.json');
}

main();

