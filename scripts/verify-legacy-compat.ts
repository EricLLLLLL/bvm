import { file } from 'bun';

const installPs1 = await file('install.ps1').text();

console.log("🔍 Verifying Legacy PowerShell Compatibility in install.ps1...");

const errors: string[] = [];

// 1. Check for TLS 1.2 Enforcement
// Required for Win7/Win10 (Legacy) to access GitHub/NPM
const tlsCheck = '[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12';
if (!installPs1.includes(tlsCheck)) {
    errors.push("❌ Missing TLS 1.2 enforcement! Legacy Windows will fail to download.");
} else {
    console.log("✅ TLS 1.2 enforcement found.");
}

// 2. Check for unsafe RuntimeInformation usage without guards
// We look for the API call. It MUST be inside an `if` block checking for PSVersion >= 6.
// Since simple regex can't parse blocks, we'll do a heuristic check:
// The modern API usage should be *after* the version check in the file.
const modernApi = '[Runtime.InteropServices.RuntimeInformation]::IsOSPlatform';
const versionCheck = '$PSVersionTable.PSVersion.Major -ge 6';

const modernApiIndex = installPs1.indexOf(modernApi);
const versionCheckIndex = installPs1.indexOf(versionCheck);

if (modernApiIndex !== -1) {
    if (versionCheckIndex === -1) {
        errors.push("❌ Modern API 'RuntimeInformation' used, but no version check ($PSVersionTable.PSVersion) found!");
    } else if (modernApiIndex < versionCheckIndex) {
        errors.push("❌ Modern API 'RuntimeInformation' appears BEFORE the version check! It might execute on legacy systems.");
    } else {
        console.log("✅ Modern API usage seems guarded by version check (heuristic).");
    }
}

// 3. Check for tar command dependency warning
// We should check if 'tar' exists before using it
const tarCheck = 'Get-Command "tar"';
if (!installPs1.includes(tarCheck)) {
    errors.push("❌ Missing 'tar' command availability check! Script will crash on Win7 during extraction.");
} else {
    console.log("✅ 'tar' command check found.");
}

if (errors.length > 0) {
    console.error("\n" + errors.join("\n"));
    process.exit(1);
} else {
    console.log("\n🎉 All legacy compatibility checks passed!");
    process.exit(0);
}
