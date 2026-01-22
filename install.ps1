# BVM Installer for Windows (PowerShell)
# Unified Installation Logic: strict isolation, idempotency, and path precedence.
$ErrorActionPreference = "Stop"

# --- Fix: Enforce TLS 1.2 ---
try { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 } catch {}

# --- Platform Detection ---
if ($PSVersionTable.ContainsKey('OS')) {
    $osName = $PSVersionTable.OS.ToString()
    $bvmIsWindows = $osName -like '*Windows*'
} else {
    try { $bvmIsWindows = (Get-CimInstance -ClassName Win32_OperatingSystem).Caption -like "*Windows*" } catch { $bvmIsWindows = $true }
}
if (-not $bvmIsWindows) { Write-Error "BVM install.ps1 is intended for Windows."; exit 1 }

# --- Dependency Check ---
if (-not (Get-Command "tar" -ErrorAction SilentlyContinue)) { Write-Error "Error: 'tar' command not found."; exit 1 }
if (-not [Environment]::Is64BitOperatingSystem) { Write-Error "BVM requires a 64-bit version of Windows."; exit 1 }

# --- Path Configuration ---
$BVM_DIR = if ($env:BVM_DIR) { $env:BVM_DIR } else { Join-Path $HOME ".bvm" }
$BVM_BIN_DIR = Join-Path $BVM_DIR "bin"
$BVM_SHIMS_DIR = Join-Path $BVM_DIR "shims"
$BVM_SRC_DIR = Join-Path $BVM_DIR "src"
$BVM_RUNTIME_DIR = Join-Path $BVM_DIR "runtime"
$BVM_ALIAS_DIR = Join-Path $BVM_DIR "aliases"
$BVM_VERSIONS_DIR = Join-Path $BVM_DIR "versions"

# --- 1. Resolve Network & BVM Version ---
function Detect-NetworkZone {
    if ($env:BVM_REGION) { return $env:BVM_REGION }
    try {
        $Test = Invoke-WebRequest -Uri "https://registry.npmmirror.com" -Method Head -TimeoutSec 1.5 -UseBasicParsing -ErrorAction SilentlyContinue
        if ($Test.StatusCode -eq 200) { return "cn" }
    } catch {}
    return "global"
}
$BVM_REGION = Detect-NetworkZone
$REGISTRY = if ($BVM_REGION -eq "cn") { "registry.npmmirror.com" } else { "registry.npmjs.org" }

$DEFAULT_BVM_VER = "v1.1.30"
$BVM_VER = if ($env:BVM_INSTALL_VERSION) { $env:BVM_INSTALL_VERSION } else { "" }
if (-not $BVM_VER) {
    try {
        $Resp = Invoke-RestMethod -Uri "https://$REGISTRY/bvm-core" -TimeoutSec 5
        $BVM_VER = "v" + $Resp."dist-tags".latest
    } catch { $BVM_VER = $DEFAULT_BVM_VER }
}
Write-Host "BVM Installer ($BVM_REGION) - Resolving $BVM_VER..." -ForegroundColor Cyan

# --- 2. Setup Directories (Idempotent) ---
$Dirs = @($BVM_DIR, $BVM_SRC_DIR, $BVM_RUNTIME_DIR, $BVM_BIN_DIR, $BVM_SHIMS_DIR, $BVM_ALIAS_DIR, $BVM_VERSIONS_DIR)
foreach ($d in $Dirs) { 
    if (-not (Test-Path $d)) { 
        New-Item -ItemType Directory -Force -Path $d | Out-Null 
    }
}

# --- 3. Download BVM Source ---
$BVM_PLAIN_VER = $BVM_VER.TrimStart('v')
$TARBALL_URL = "https://$REGISTRY/bvm-core/-/bvm-core-$BVM_PLAIN_VER.tgz"
$CURL_CMD = if (Get-Command "curl.exe" -ErrorAction SilentlyContinue) { "curl.exe" } else { "curl" }

if (Test-Path "dist\index.js") {
    Copy-Item "dist\index.js" (Join-Path $BVM_SRC_DIR "index.js") -Force
    Copy-Item "dist\bvm-shim.js" (Join-Path $BVM_BIN_DIR "bvm-shim.js") -Force
} else {
    $TMP_TGZ = Join-Path $BVM_DIR "bvm-core.tgz"
    & $CURL_CMD "-#SfLo" "$TMP_TGZ" "$TARBALL_URL"
    $EXT_DIR = Join-Path $BVM_DIR "temp_bvm_extract"
    if (Test-Path $EXT_DIR) { Remove-Item $EXT_DIR -Recurse -Force }
    New-Item -ItemType Directory -Path $EXT_DIR | Out-Null
    & tar -xf "$TMP_TGZ" -C "$EXT_DIR"
    Copy-Item (Join-Path $EXT_DIR "package\dist\index.js") (Join-Path $BVM_SRC_DIR "index.js") -Force
    Copy-Item (Join-Path $EXT_DIR "package\dist\bvm-shim.js") (Join-Path $BVM_BIN_DIR "bvm-shim.js") -Force
    Remove-Item $TMP_TGZ -Force
    Remove-Item $EXT_DIR -Recurse -Force
}

# --- 4. Bootstrap Runtime (Using System Bun if available, READ-ONLY) ---
$SYSTEM_BUN_BIN = Get-Command "bun" -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source
if ($SYSTEM_BUN_BIN -and ($SYSTEM_BUN_BIN -like "*\.bvm\shims*" -or $SYSTEM_BUN_BIN -like "*\.bvm\bin*")) {
    $SYSTEM_BUN_BIN = $null
}
$SYSTEM_BUN_VER = ""
if ($SYSTEM_BUN_BIN) { try { $SYSTEM_BUN_VER = (bun --version) -replace "^v", "" } catch {} }

$USE_SYSTEM_AS_RUNTIME = $false
$BUN_VER = ""

if ($SYSTEM_BUN_BIN) {
    # We copy the system bun to BVM's internal version store for bootstrapping.
    # We do NOT touch the system installation.
    Write-Host "Bootstrapping with detected system Bun v$SYSTEM_BUN_VER..." -ForegroundColor Gray
    $SYS_VER_DIR = Join-Path $BVM_VERSIONS_DIR "v$SYSTEM_BUN_VER"
    $SYS_BIN_DIR = Join-Path $SYS_VER_DIR "bin"
    if (-not (Test-Path $SYS_BIN_DIR)) { New-Item -ItemType Directory -Path $SYS_BIN_DIR -Force | Out-Null }
    Copy-Item $SYSTEM_BUN_BIN (Join-Path $SYS_BIN_DIR "bun.exe") -Force
    
    # Smoke Test
    $BvmIndex = Join-Path $BVM_SRC_DIR "index.js"
    & $SYSTEM_BUN_BIN $BvmIndex --version | Out-Null
    if ($LASTEXITCODE -eq 0) {
        $USE_SYSTEM_AS_RUNTIME = $true
        $BUN_VER = "v$SYSTEM_BUN_VER"
    }
}

if ($USE_SYSTEM_AS_RUNTIME) {
    $TARGET_DIR = Join-Path $BVM_VERSIONS_DIR $BUN_VER
} else {
    try {
        $BunLatest = (Invoke-RestMethod -Uri "https://$REGISTRY/-/package/bun/dist-tags" -TimeoutSec 5).latest
        $BUN_VER = "v$BunLatest"
    } catch { $BUN_VER = "v1.3.5" }
    $TARGET_DIR = Join-Path $BVM_VERSIONS_DIR $BUN_VER
    
    if (-not (Test-Path (Join-Path $TARGET_DIR "bin\bun.exe"))) {
        Write-Host "Downloading Runtime (bun@$($BUN_VER.TrimStart('v')))..."
        $URL = "https://$REGISTRY/@oven/bun-windows-x64/-/bun-windows-x64-$($BUN_VER.TrimStart('v')).tgz"
        $TMP = Join-Path $BVM_DIR "bun-runtime.tgz"
        & $CURL_CMD "-#SfLo" "$TMP" "$URL"
        $EXT = Join-Path $BVM_DIR "temp_extract"
        if (Test-Path $EXT) { Remove-Item $EXT -Recurse -Force | Out-Null }
        New-Item -ItemType Directory -Path $EXT | Out-Null
        & tar -xf "$TMP" -C "$EXT"
        $FoundBun = Get-ChildItem -Path $EXT -Filter "bun.exe" -Recurse | Select-Object -First 1
        $BIN_DEST = Join-Path $TARGET_DIR "bin"
        if (-not (Test-Path $BIN_DEST)) { New-Item -ItemType Directory -Path $BIN_DEST -Force | Out-Null }
        Move-Item -Path $FoundBun.FullName -Destination (Join-Path $BIN_DEST "bun.exe") -Force
        Remove-Item $TMP -Force
        Remove-Item $EXT -Recurse -Force
    }
}

# --- 5. Link Runtime ---
$PRIVATE_RUNTIME_LINK = Join-Path $BVM_RUNTIME_DIR "current"
if (Test-Path $PRIVATE_RUNTIME_LINK) { Remove-Item -Recurse -Force $PRIVATE_RUNTIME_LINK | Out-Null }
New-Item -ItemType Junction -Path $PRIVATE_RUNTIME_LINK -Value $TARGET_DIR | Out-Null

$USER_CURRENT_LINK = Join-Path $BVM_DIR "current"
if (Test-Path $USER_CURRENT_LINK) { Remove-Item -Recurse -Force $USER_CURRENT_LINK | Out-Null }
New-Item -ItemType Junction -Path $USER_CURRENT_LINK -Value $TARGET_DIR | Out-Null

Set-Content -Path (Join-Path $BVM_ALIAS_DIR "default") -Value $BUN_VER -Encoding Ascii

# --- 6. Create Shims ---
Write-Host "Updating shims..." -ForegroundColor Gray
$WinBvmDir = $BVM_DIR.Replace('/', '\')
$BvmWrapper = @"
@echo off
set "BVM_DIR=$WinBvmDir"
"%BVM_DIR%\runtime\current\bin\bun.exe" "%BVM_DIR%\src\index.js" %*
"@
Set-Content -Path (Join-Path $BVM_BIN_DIR "bvm.cmd") -Value $BvmWrapper -Encoding Ascii

$CMD_NAMES = @("bun", "bunx")
foreach ($name in $CMD_NAMES) {
    $tpl = @"
@echo off
set "BVM_DIR=$WinBvmDir"
set "BUN_INSTALL=%BVM_DIR%\current"

if not exist ".bvmrc" (
    "%BVM_DIR%\runtime\current\bin\bun.exe" %*
    exit /b %errorlevel%
)

"%BVM_DIR%\runtime\current\bin\bun.exe" "%BVM_DIR%\bin\bvm-shim.js" "$name" %*
"@
    Set-Content -Path (Join-Path $BVM_SHIMS_DIR "$name.cmd") -Value $tpl -Encoding Ascii
}

# --- 7. Configure Path (Prepend for Priority) ---
$RawPath = [Environment]::GetEnvironmentVariable("Path", "User")
$BVM_CURRENT_BIN = Join-Path $BVM_DIR "current\bin"
$PathList = if ($RawPath) { $RawPath.Split(';') } else { @() }
$NewPathList = @()
foreach ($p in $PathList) { if ($p -notlike "*\.bvm\shims*" -and $p -notlike "*\.bvm\bin*" -and $p -notlike "*\.bvm\current\bin*" -and -not [string]::IsNullOrEmpty($p)) { $NewPathList += $p } }
$FinalPath = "$BVM_SHIMS_DIR;$BVM_BIN_DIR;$BVM_CURRENT_BIN;" + ($NewPathList -join ';')
[Environment]::SetEnvironmentVariable("Path", $FinalPath, "User")
$env:Path = "$BVM_SHIMS_DIR;$BVM_BIN_DIR;$BVM_CURRENT_BIN;$env:Path"

# --- 8. Initialize BVM (Self-Repair) ---
& (Join-Path $TARGET_DIR "bin\bun.exe") (Join-Path $BVM_SRC_DIR "index.js") setup --silent

Write-Host "`n[OK] BVM installed successfully!" -ForegroundColor Green
Write-Host "IMPORTANT: Please close this terminal and open a NEW one to apply changes." -ForegroundColor Cyan
