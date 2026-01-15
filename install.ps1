# BVM Installer for Windows (PowerShell)
$ErrorActionPreference = "Stop"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

if (-not [Environment]::Is64BitOperatingSystem) {
    Write-Error "BVM requires a 64-bit version of Windows."
    exit 1
}

$BVM_DIR = "$HOME\.bvm"
$BVM_BIN_DIR = "$BVM_DIR\bin"
$BVM_SHIMS_DIR = "$BVM_DIR\shims"
$BVM_SRC_DIR = "$BVM_DIR\src"
$BVM_RUNTIME_DIR = "$BVM_DIR\runtime"
$BVM_ALIAS_DIR = "$BVM_DIR\aliases"

# --- 0. Pre-Installation Cleanup (Crucial) ---
Write-Host "Cleaning up environment..." -ForegroundColor Gray
if (Test-Path $BVM_SHIMS_DIR) {
    # Kill any lingering .ps1 files that take precedence over .cmd
    Get-ChildItem -Path $BVM_SHIMS_DIR -Filter "*.ps1" -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue
}

# --- 1. Smart Registry Selection ---
$REGISTRY = "registry.npmjs.org"
if ($env:BVM_REGISTRY) {
    $REGISTRY = $env:BVM_REGISTRY
} else {
    $Mirror = "registry.npmmirror.com"
    try {
        $Test = Invoke-WebRequest -Uri "https://$Mirror" -TimeoutSec 1.5 -UseBasicParsing -ErrorAction SilentlyContinue
        if ($Test.StatusCode -eq 200) { $REGISTRY = $Mirror }
    } catch {}
}

# --- 2. Resolve Versions ---
$BVM_VER = "v1.0.6" # Updated by release script
$BVM_MAJOR = $BVM_VER.TrimStart('v').Split('.')[0]
$BUN_MAJOR = $BVM_MAJOR
$BUN_VER = "1.3.6" # Fallback

Write-Host "Resolving Bun v$BUN_MAJOR runtime..." -ForegroundColor Gray
try {
    $BunLatest = (Invoke-RestMethod -Uri "https://$REGISTRY/-/package/bun/dist-tags" -TimeoutSec 5).latest
    if ($BunLatest -and $BunLatest.StartsWith("$BUN_MAJOR.")) { $BUN_VER = $BunLatest }
} catch {}

# --- 3. Setup Directories ---
$Dirs = @($BVM_DIR, $BVM_SRC_DIR, $BVM_RUNTIME_DIR, $BVM_BIN_DIR, $BVM_SHIMS_DIR, $BVM_ALIAS_DIR)
foreach ($d in $Dirs) { if (-not (Test-Path $d)) { New-Item -ItemType Directory -Force -Path $d | Out-Null } }

# --- 4. Download & Extract Bun ---
$TARGET_DIR = "$BVM_RUNTIME_DIR\v$BUN_VER"
if (-not (Test-Path "$TARGET_DIR\bin\bun.exe")) {
    Write-Host "Downloading Bun v$BUN_VER..."
    $URL = "https://$REGISTRY/@oven/bun-windows-x64/-/bun-windows-x64-$BUN_VER.tgz"
    $TMP = "$BVM_DIR\bun-runtime.tgz"
    & curl.exe "-#SfLo" "$TMP" "$URL"
    
    $EXT = "$BVM_DIR\temp_extract"
    if (Test-Path $EXT) { Remove-Item $EXT -Recurse -Force | Out-Null }
    New-Item -ItemType Directory -Path $EXT | Out-Null
    
    Write-Host "Extracting..."
    & tar -xf "$TMP" -C "$EXT"
    
    $FoundBun = Get-ChildItem -Path $EXT -Filter "bun.exe" -Recurse | Select-Object -First 1
    New-Item -ItemType Directory -Path "$TARGET_DIR\bin" -Force | Out-Null
    Move-Item -Path $FoundBun.FullName -Destination "$TARGET_DIR\bin\bun.exe" -Force
    
    Remove-Item $TMP -Force
    Remove-Item $EXT -Recurse -Force
}
New-Item -ItemType Junction -Path "$BVM_RUNTIME_DIR\current" -Target "$TARGET_DIR" -Force | Out-Null

# --- 5. Download BVM Source ---
$LOCAL_DIST = "$PSScriptRoot\dist\index.js"
if (Test-Path $LOCAL_DIST) {
    Copy-Item $LOCAL_DIST "$BVM_SRC_DIR\index.js" -Force
} else {
    Write-Host "Downloading BVM Source $BVM_VER..."
    $SRC_URL = "https://cdn.jsdelivr.net/gh/EricLLLLLL/bvm@$BVM_VER/dist/index.js"
    & curl.exe "-#SfLo" "$BVM_SRC_DIR\index.js" "$SRC_URL"
}

# --- 6. Finalize Config ---
$Wrapper = "@echo off`r`nset `"BVM_DIR=%USERPROFILE%\.bvm`"`r`n`"%BVM_DIR%\runtime\current\bin\bun.exe`" `"%BVM_DIR%\src\index.js`" %*"
Set-Content -Path "$BVM_BIN_DIR\bvm.cmd" -Value $Wrapper -Encoding Ascii

# Clean and Update PATH
$RawPath = [Environment]::GetEnvironmentVariable("Path", "User")
$PathList = $RawPath.Split(';', [System.StringSplitOptions]::RemoveEmptyEntries)
$NewPathList = @()
# Remove any existing BVM paths to ensure clean re-entry and correct order
foreach ($p in $PathList) {
    if ($p -notlike "*\.bvm\shims*" -and $p -notlike "*\.bvm\bin*") {
        $NewPathList += $p
    }
}
# Prepend BVM paths in correct order: Shims first, then Bin
$FinalPath = "$BVM_SHIMS_DIR;$BVM_BIN_DIR;" + ($NewPathList -join ';')
[Environment]::SetEnvironmentVariable("Path", $FinalPath, "User")

# Update Current Session
$env:Path = "$BVM_SHIMS_DIR;$BVM_BIN_DIR;$env:Path"

# --- 7. Initial Rehash (The Moment of Truth) ---
Write-Host "Initializing shims..."
& "$BVM_RUNTIME_DIR\current\bin\bun.exe" "$BVM_SRC_DIR\index.js" rehash --silent

Write-Host "`n[OK] BVM installed successfully!" -ForegroundColor Green
Write-Host "IMPORTANT: Please close this terminal and open a NEW one." -ForegroundColor Yellow