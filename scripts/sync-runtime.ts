import { join } from 'path';

async function syncRuntime() {
  const currentBunVersion = Bun.version;
  console.log(`📡 Current local Bun version: ${currentBunVersion}`);

  const cwd = process.cwd();
  const installShPath = join(cwd, 'install.sh');
  const installPs1Path = join(cwd, 'install.ps1');

  // 1. Update install.sh
  let shContent = await Bun.file(installShPath).text();
  const shRegex = /REQUIRED_BUN_VERSION=".*?"/;
  const newShLine = `REQUIRED_BUN_VERSION="${currentBunVersion}"`;
  
  if (shContent.match(shRegex)?.[0] !== newShLine) {
    shContent = shContent.replace(shRegex, newShLine);
    await Bun.write(installShPath, shContent);
    console.log(`✅ Updated install.sh to use Bun v${currentBunVersion}`);
  } else {
    console.log(`✓ install.sh is already up to date.`);
  }

  // 2. Update install.ps1
  let ps1Content = await Bun.file(installPs1Path).text();
  const ps1Regex = /\$REQUIRED_BUN_VERSION = ".*?"/;
  const newPs1Line = `$REQUIRED_BUN_VERSION = "${currentBunVersion}"`;

  if (ps1Content.match(ps1Regex)?.[0] !== newPs1Line) {
    ps1Content = ps1Content.replace(ps1Regex, newPs1Line);
    await Bun.write(installPs1Path, ps1Content);
    console.log(`✅ Updated install.ps1 to use Bun v${currentBunVersion}`);
  } else {
    console.log(`✓ install.ps1 is already up to date.`);
  }
}

syncRuntime();
