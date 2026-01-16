import { join } from 'path';
import { 
    BVM_SHIM_SH_TEMPLATE, 
    BVM_SHIM_JS_TEMPLATE 
} from '../src/templates/init-scripts';
import { chmodSync, existsSync, mkdirSync } from 'fs';

async function syncRuntime() {
  const cwd = process.cwd();
  console.log('📦 Reading local package.json for Bun version...');
  
  try {
    const pkgPath = join(cwd, 'package.json');
    const pkg = await Bun.file(pkgPath).json();
    
    // Extract version, removing caret/tilde if present
    let localVersion = pkg.devDependencies?.bun;
    if (!localVersion) {
        throw new Error('bun not found in devDependencies');
    }
    localVersion = localVersion.replace(/^[\^~]/, '');
    
    console.log(`🔒 Locking install scripts to local Bun version: v${localVersion}`);

    const installShPath = join(cwd, 'install.sh');
    const installPs1Path = join(cwd, 'install.ps1');

    // 1. Update install.sh
    let shContent = await Bun.file(installShPath).text();
    const shRegex = /(FALLBACK_BUN_VERSION|REQUIRED_BUN_VERSION)="[0-9]+\.[0-9]+\.[0-9]+"/;
    const newShLine = `FALLBACK_BUN_VERSION="${localVersion}"`;
    
    if (shContent.match(shRegex)) {
      if (shContent.match(shRegex)?.[0] !== newShLine) {
        shContent = shContent.replace(shRegex, newShLine);
        await Bun.write(installShPath, shContent);
        console.log(`✅ Updated install.sh to v${localVersion}`);
      } else {
        console.log(`✓ install.sh is already up to date.`);
      }
    }

    // 2. Update install.ps1
    let ps1Content = await Bun.file(installPs1Path).text();
    const ps1Regex = /\$REQUIRED_BUN_VERSION = "[0-9]+\.[0-9]+\.[0-9]+"/;
    const newPs1Line = `$REQUIRED_BUN_VERSION = "${localVersion}"`;

    if (ps1Content.match(ps1Regex)) {
      if (ps1Content.match(ps1Regex)?.[0] !== newPs1Line) {
        ps1Content = ps1Content.replace(ps1Regex, newPs1Line);
        await Bun.write(installPs1Path, ps1Content);
        console.log(`✅ Updated install.ps1 to v${localVersion}`);
      } else {
        console.log(`✓ install.ps1 is already up to date.`);
      }
    }

    // 3. Export Shims to dist/
    console.log('🚀 Exporting shims to dist/ directory...');
    const distDir = join(cwd, 'dist');
    if (!existsSync(distDir)) {
        mkdirSync(distDir, { recursive: true });
    }

    const shimShPath = join(distDir, 'bvm-shim.sh');
    const shimJsPath = join(distDir, 'bvm-shim.js');

    await Bun.write(shimShPath, BVM_SHIM_SH_TEMPLATE);
    chmodSync(shimShPath, 0o755); // Ensure executable
    console.log(`✅ Exported bvm-shim.sh`);

    await Bun.write(shimJsPath, BVM_SHIM_JS_TEMPLATE);
    console.log(`✅ Exported bvm-shim.js`);

  } catch (error: any) {
    console.error(`❌ Error syncing runtime: ${error.message}`);
    process.exit(1);
  }
}

syncRuntime();
