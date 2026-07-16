import { join } from 'path';
import { 
    BVM_SHIM_SH_TEMPLATE, 
    BVM_SHIM_JS_TEMPLATE 
} from '../src/templates/init-scripts';
import { chmodSync, existsSync, mkdirSync } from 'fs';

function replaceRequired(content: string, pattern: RegExp, replacement: string, label: string): string {
    if (!pattern.test(content)) {
        throw new Error(`Unable to synchronize Bun fallback version in ${label}`);
    }
    return content.replace(pattern, replacement);
}

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
    const postinstallPath = join(cwd, 'scripts', 'postinstall.js');

    // 1. Update install.sh
    let shContent = await Bun.file(installShPath).text();
    
    // Sync Bun version
    const shRegex = /FALLBACK_BUN_VERSION="[0-9]+\.[0-9]+\.[0-9]+"/;
    const newShLine = `FALLBACK_BUN_VERSION="${localVersion}"`;
    shContent = replaceRequired(shContent, shRegex, newShLine, 'install.sh');

    // Sync BVM version
    const bvmShRegex = /DEFAULT_BVM_VERSION="v[0-9]+\.[0-9]+\.[0-9]+"/;
    const newBvmShLine = `DEFAULT_BVM_VERSION="v${pkg.version}"`;
    if (shContent.match(bvmShRegex)) {
        shContent = shContent.replace(bvmShRegex, newBvmShLine);
    }
    
    await Bun.write(installShPath, shContent);
    console.log(`✅ Updated install.sh (Bun: v${localVersion}, BVM: v${pkg.version})`);

    // 2. Update install.ps1
    let ps1Content = await Bun.file(installPs1Path).text();
    
    // Sync Bun version
    const ps1Regex = /\$FALLBACK_BUN_VERSION = "[0-9]+\.[0-9]+\.[0-9]+"/;
    const newPs1Line = `$FALLBACK_BUN_VERSION = "${localVersion}"`;
    ps1Content = replaceRequired(ps1Content, ps1Regex, newPs1Line, 'install.ps1');

    // Sync BVM version
    const bvmPs1Regex = /\$DEFAULT_BVM_VER = "v[0-9]+\.[0-9]+\.[0-9]+"/;
    const newBvmPs1Line = `$DEFAULT_BVM_VER = "v${pkg.version}"`;
    if (ps1Content.match(bvmPs1Regex)) {
        ps1Content = ps1Content.replace(bvmPs1Regex, newBvmPs1Line);
    }

    await Bun.write(installPs1Path, ps1Content);
    console.log(`✅ Updated install.ps1 (Bun: v${localVersion}, BVM: v${pkg.version})`);

    // 3. Update postinstall.js
    let postinstallContent = await Bun.file(postinstallPath).text();
    const postinstallRegex = /const FALLBACK_BUN_VERSION = '[0-9]+\.[0-9]+\.[0-9]+';/;
    const newPostinstallLine = `const FALLBACK_BUN_VERSION = '${localVersion}';`;
    postinstallContent = replaceRequired(postinstallContent, postinstallRegex, newPostinstallLine, 'scripts/postinstall.js');
    await Bun.write(postinstallPath, postinstallContent);
    console.log(`✅ Updated postinstall.js (Bun: v${localVersion})`);

    // 4. Export Shims to dist/
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
