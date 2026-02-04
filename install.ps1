# BVM Installer for Windows (PowerShell)
# Unified Installation Logic: strict isolation, idempotency, and path precedence.
param([switch]$Local)
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

$DEFAULT_BVM_VER = "v1.1.37"
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
if ($Local) {
    if ((Test-Path "dist\index.js") -and (Test-Path "dist\bvm-shim.js")) {
        Write-Host "Explicitly using local BVM core assets (-Local)." -ForegroundColor Green
        $BVM_VER = "v-local"
        Copy-Item "dist\index.js" (Join-Path $BVM_SRC_DIR "index.js") -Force
        Copy-Item "dist\bvm-shim.js" (Join-Path $BVM_BIN_DIR "bvm-shim.js") -Force
    } else {
        Write-Error "-Local switch provided but dist\index.js or dist\bvm-shim.js not found."
        exit 1
    }
} else {
    $BVM_PLAIN_VER = $BVM_VER.TrimStart('v')
    $TARBALL_URL = "https://$REGISTRY/bvm-core/-/bvm-core-$BVM_PLAIN_VER.tgz"
    $CURL_CMD = if (Get-Command "curl.exe" -ErrorAction SilentlyContinue) { "curl.exe" } else { "curl" }

    $TMP_TGZ = Join-Path $BVM_DIR "bvm-core.tgz"
    & $CURL_CMD "-#SfL" "-C" "-" "--connect-timeout" "20" "--max-time" "600" "--retry" "3" "-o" "$TMP_TGZ" "$TARBALL_URL"
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
    # We copy the system bun to BVM's internal runtime store for bootstrapping.
    Write-Host "Bootstrapping with detected system Bun v$SYSTEM_BUN_VER..." -ForegroundColor Gray
    $SYS_VER_NAME = "v$SYSTEM_BUN_VER"
    $SYS_RUNTIME_DIR = Join-Path $BVM_RUNTIME_DIR $SYS_VER_NAME
    $SYS_BIN_DIR = Join-Path $SYS_RUNTIME_DIR "bin"
    if (-not (Test-Path $SYS_BIN_DIR)) { New-Item -ItemType Directory -Path $SYS_BIN_DIR -Force | Out-Null }
    Copy-Item $SYSTEM_BUN_BIN (Join-Path $SYS_BIN_DIR "bun.exe") -Force
    Copy-Item $SYSTEM_BUN_BIN (Join-Path $SYS_BIN_DIR "bunx.exe") -Force
    
    # Generate bunfig.toml
    $WinRuntimeDir = $SYS_RUNTIME_DIR.Replace('/', '\')
    $WinBinDir = $SYS_BIN_DIR.Replace('/', '\')
    $BunfigContent = "[install]`nglobalDir = `"$($WinRuntimeDir.Replace('\', '\\'))`"`nglobalBinDir = `"$($WinBinDir.Replace('\', '\\'))`"`n"
    Set-Content -Path (Join-Path $SYS_RUNTIME_DIR "bunfig.toml") -Value $BunfigContent -Encoding Ascii

    # Link registry to physical runtime
    $SYS_VERSIONS_LINK = Join-Path $BVM_VERSIONS_DIR $SYS_VER_NAME
    if (Test-Path $SYS_VERSIONS_LINK) { Remove-Item -Recurse -Force $SYS_VERSIONS_LINK | Out-Null }
    New-Item -ItemType Junction -Path $SYS_VERSIONS_LINK -Value $SYS_RUNTIME_DIR | Out-Null

    # Smoke Test
    $BvmIndex = Join-Path $BVM_SRC_DIR "index.js"
    & $SYSTEM_BUN_BIN $BvmIndex --version | Out-Null
    if ($LASTEXITCODE -eq 0) {
        $USE_SYSTEM_AS_RUNTIME = $true
        $BUN_VER = $SYS_VER_NAME
        $TARGET_PHYSICAL_DIR = $SYS_RUNTIME_DIR
    }
}

if ($USE_SYSTEM_AS_RUNTIME) {
    # Already set up
} else {
    try {
        $BunLatest = (Invoke-RestMethod -Uri "https://$REGISTRY/-/package/bun/dist-tags" -TimeoutSec 5).latest
        $BUN_VER = "v$BunLatest"
    } catch { $BUN_VER = "v1.3.5" }
    $TARGET_PHYSICAL_DIR = Join-Path $BVM_RUNTIME_DIR $BUN_VER
    
    if (-not (Test-Path (Join-Path $TARGET_PHYSICAL_DIR "bin\bun.exe"))) {
        $TMP = Join-Path $BVM_DIR "bun-runtime.tgz"
        # ... (keep download logic) ...
        if ($env:BVM_LOCAL_RUNTIME_PATH -and (Test-Path $env:BVM_LOCAL_RUNTIME_PATH)) {
            Write-Host "Using local runtime archive: $env:BVM_LOCAL_RUNTIME_PATH" -ForegroundColor Green
            $TMP = $env:BVM_LOCAL_RUNTIME_PATH
        } else {
            Write-Host "Downloading Runtime (bun@$($BUN_VER.TrimStart('v')))..."
            $URL = "https://$REGISTRY/@oven/bun-windows-x64/-/bun-windows-x64-$($BUN_VER.TrimStart('v')).tgz"
            & $CURL_CMD "-#SfL" "-C" "-" "--connect-timeout" "20" "--max-time" "600" "--retry" "3" "-o" "$TMP" "$URL"
        }

        $EXT = Join-Path $BVM_DIR "temp_extract"
        if (Test-Path $EXT) { Remove-Item $EXT -Recurse -Force | Out-Null }
        New-Item -ItemType Directory -Path $EXT | Out-Null
        & tar -xf "$TMP" -C "$EXT"
        $FoundBun = Get-ChildItem -Path $EXT -Filter "bun.exe" -Recurse | Select-Object -First 1
        $BIN_DEST = Join-Path $TARGET_PHYSICAL_DIR "bin"
        if (-not (Test-Path $BIN_DEST)) { New-Item -ItemType Directory -Path $BIN_DEST -Force | Out-Null }
        Move-Item -Path $FoundBun.FullName -Destination (Join-Path $BIN_DEST "bun.exe") -Force
        Copy-Item (Join-Path $BIN_DEST "bun.exe") (Join-Path $BIN_DEST "bunx.exe") -Force
        
        # Generate bunfig.toml
        $WinRuntimeDir = $TARGET_PHYSICAL_DIR.Replace('/', '\')
        $WinBinDir = $BIN_DEST.Replace('/', '\')
        $BunfigContent = "[install]`nglobalDir = `"$($WinRuntimeDir.Replace('\', '\\'))`"`nglobalBinDir = `"$($WinBinDir.Replace('\', '\\'))`"`n"
        Set-Content -Path (Join-Path $TARGET_PHYSICAL_DIR "bunfig.toml") -Value $BunfigContent -Encoding Ascii

        Remove-Item $TMP -Force
        Remove-Item $EXT -Recurse -Force
    }
    # Link registry to physical runtime
    $VERSIONS_LINK = Join-Path $BVM_VERSIONS_DIR $BUN_VER
    if (Test-Path $VERSIONS_LINK) { Remove-Item -Recurse -Force $VERSIONS_LINK | Out-Null }
    New-Item -ItemType Junction -Path $VERSIONS_LINK -Value $TARGET_PHYSICAL_DIR | Out-Null
}

# --- 5. Link Runtime ---
$PRIVATE_RUNTIME_LINK = Join-Path $BVM_RUNTIME_DIR "current"
if (Test-Path $PRIVATE_RUNTIME_LINK) { Remove-Item -Recurse -Force $PRIVATE_RUNTIME_LINK | Out-Null }
New-Item -ItemType Junction -Path $PRIVATE_RUNTIME_LINK -Value $TARGET_PHYSICAL_DIR | Out-Null

$USER_CURRENT_LINK = Join-Path $BVM_DIR "current"
if (Test-Path $USER_CURRENT_LINK) { Remove-Item -Recurse -Force $USER_CURRENT_LINK | Out-Null }
New-Item -ItemType Junction -Path $USER_CURRENT_LINK -Value (Join-Path $BVM_VERSIONS_DIR $BUN_VER) | Out-Null

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
    "%BVM_DIR%\current\bin\$name.exe" %*
    exit /b %errorlevel%
)

"%BVM_DIR%\runtime\current\bin\bun.exe" "%BVM_DIR%\bin\bvm-shim.js" "$name" %*
"@
    Set-Content -Path (Join-Path $BVM_SHIMS_DIR "$name.cmd") -Value $tpl -Encoding Ascii
}

# --- 7. Configure Path (Purge Old & Prepend New) ---
Write-Host "Configuring PATH (Shim Proxy mode)..." -ForegroundColor Gray
$RawPath = [Environment]::GetEnvironmentVariable("Path", "User")
# Clean previous BVM entries
$cleanPathList = $RawPath -split ";" | Where-Object { $_ -notlike "*\.bvm*" -and -not [string]::IsNullOrEmpty($_) }
$FinalPath = "$BVM_SHIMS_DIR;$BVM_BIN_DIR;" + ($cleanPathList -join ';') + ";$BVM_DIR\current\bin"

[Environment]::SetEnvironmentVariable("Path", $FinalPath, "User")
$env:Path = "$BVM_SHIMS_DIR;$BVM_BIN_DIR;$env:Path;$BVM_DIR\current\bin"

# --- 8. Initialize BVM (Self-Repair) ---
& (Join-Path $TARGET_DIR "bin\bun.exe") (Join-Path $BVM_SRC_DIR "index.js") setup --silent

Write-Host "`n[OK] BVM installed successfully!" -ForegroundColor Green
Write-Host "IMPORTANT: Please close this terminal and open a NEW one to apply changes." -ForegroundColor Cyan
Write-Host "NOTE: Global packages (bun install -g) are isolated per version." -ForegroundColor Yellow
Write-Host "      BVM shims are used to proxy all commands safely." -ForegroundColor Yellow
