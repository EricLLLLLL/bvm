import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

async function getFileMd5(path: string) {
    const data = await Bun.file(path).arrayBuffer();
    const hasher = new Bun.CryptoHasher("md5");
    hasher.update(data);
    return hasher.digest("hex");
}

async function main() {
    console.log('Calculating fingerprints for dist assets...');
    
    const cliMd5 = await getFileMd5('dist/index.js');
    const shimWinMd5 = await getFileMd5('dist/bvm-shim.js');
    const shimUnixMd5 = await getFileMd5('dist/bvm-shim.sh');

    const pkgPath = join(process.cwd(), 'package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));

    pkg.bvm_fingerprints = {
        cli: cliMd5,
        shim_win: shimWinMd5,
        shim_unix: shimUnixMd5
    };

    writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
    console.log('Fingerprints injected into package.json');
    console.log(JSON.stringify(pkg.bvm_fingerprints, null, 2));
}

main().catch(console.error);

