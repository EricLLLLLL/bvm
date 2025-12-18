import { join } from 'path';

async function getLatestBun1xVersion() {
  // Use npm view to resolve the latest version satisfying ^1
  const proc = Bun.spawn(["npm", "view", "bun@^1", "version"], { stdout: "pipe" });
  const output = await new Response(proc.stdout).text();
  
  // npm view can return a list of versions if multiple match, or a single version.
  // Example list output: 
  // bun@1.0.0 '1.0.0'
  // ...
  // bun@1.3.5 '1.3.5'
  
  // We want the last one.
  const lines = output.trim().split('\n').filter(line => line.trim() !== '');
  let lastLine = lines[lines.length - 1];
  
  // Clean up: sometimes it returns "bun@1.3.5 '1.3.5'", sometimes just "1.3.5"
  // If it contains a quote, take the content inside the last pair of quotes
  if (lastLine.includes("'")) {
    lastLine = lastLine.split("'")[1];
  }
  
  const version = lastLine.trim();
  
  if (!version || !/^\d+\.\d+\.\d+$/.test(version)) {
    throw new Error(`Failed to resolve latest Bun version. Parsed: "${version}". Raw Output tail: ...${output.slice(-100)}`);
  }
  return version;
}

async function syncRuntime() {
  const cwd = process.cwd();
  console.log('🔍 Checking for latest Bun 1.x version...');
  
  try {
    const latestVersion = await getLatestBun1xVersion();
    console.log(`📡 Latest Bun 1.x version found: v${latestVersion}`);

    const installShPath = join(cwd, 'install.sh');
    const installPs1Path = join(cwd, 'install.ps1');
    const packageJsonPath = join(cwd, 'package.json');

    // 1. Update install.sh
    let shContent = await Bun.file(installShPath).text();
    // Match either FALLBACK_BUN_VERSION or REQUIRED_BUN_VERSION to be safe, but we know it's FALLBACK now
    // We'll stick to replacing the value we know exists or finding the pattern
    const shRegex = /(FALLBACK_BUN_VERSION|REQUIRED_BUN_VERSION)="[0-9]+\.[0-9]+\.[0-9]+"/;
    const shMatch = shContent.match(shRegex);
    
    if (shMatch) {
      const varName = shMatch[1];
      const newShLine = `${varName}="${latestVersion}"`;
      if (shMatch[0] !== newShLine) {
        shContent = shContent.replace(shRegex, newShLine);
        await Bun.write(installShPath, shContent);
        console.log(`✅ Updated install.sh (${varName}) to v${latestVersion}`);
      } else {
        console.log(`✓ install.sh is already up to date.`);
      }
    } else {
      console.warn('⚠️  Could not find version variable in install.sh');
    }

    // 2. Update install.ps1
    let ps1Content = await Bun.file(installPs1Path).text();
    const ps1Regex = /\$REQUIRED_BUN_VERSION = "[0-9]+\.[0-9]+\.[0-9]+"/;
    const newPs1Line = `$REQUIRED_BUN_VERSION = "${latestVersion}"`;

    if (ps1Content.match(ps1Regex)) {
      if (ps1Content.match(ps1Regex)?.[0] !== newPs1Line) {
        ps1Content = ps1Content.replace(ps1Regex, newPs1Line);
        await Bun.write(installPs1Path, ps1Content);
        console.log(`✅ Updated install.ps1 to v${latestVersion}`);
      } else {
        console.log(`✓ install.ps1 is already up to date.`);
      }
    } else {
      console.warn('⚠️  Could not find $REQUIRED_BUN_VERSION in install.ps1');
    }

    // 3. Update package.json and run install
    console.log('📦 Checking local package.json...');
    const pkg = await Bun.file(packageJsonPath).json();
    const currentDep = pkg.devDependencies?.bun;
    const targetDep = `^${latestVersion}`;

    if (currentDep !== targetDep) {
      console.log(`⬆️  Updating devDependencies.bun from ${currentDep} to ${targetDep}...`);
      pkg.devDependencies.bun = targetDep;
      await Bun.write(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n');
      
      console.log('📥 Running bun install to update local environment...');
      const installProc = Bun.spawn(["bun", "install"], { 
        stdio: ["inherit", "inherit", "inherit"] 
      });
      await installProc.exited;
      console.log('✅ Local environment updated.');
    } else {
      console.log('✓ package.json is already up to date.');
    }

  } catch (error: any) {
    console.error(`❌ Error syncing runtime: ${error.message}`);
    process.exit(1);
  }
}

syncRuntime();