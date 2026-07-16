#!/usr/bin/env bun

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';

function sha256File(path: string): string {
  const buf = readFileSync(path);
  return createHash('sha256').update(buf).digest('hex');
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

  delete pkg.bvm_fingerprints;
  pkg.bvm_artifact_sha256 = {
    cli: sha256File(cli),
    shim_win: sha256File(shimWin),
    shim_unix: sha256File(shimUnix),
    install_sh: sha256File(installSh),
    install_ps1: sha256File(installPs1),
  };

  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');
  console.log('✓ Fingerprints updated in package.json');
}

main();
