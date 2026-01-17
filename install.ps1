# BVM Installer for Windows (PowerShell)
$ErrorActionPreference = "Stop"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

if (-not [Environment]::Is64BitOperatingSystem) {
    Write-Error "BVM requires a 64-bit version of Windows."
    exit 1
}

# --- Cross-platform Path Helpers ---
$BVM_DIR = if ($env:BVM_DIR) { $env:BVM_DIR } else { Join-Path $HOME ".bvm" }
$BVM_BIN_DIR = Join-Path $BVM_DIR "bin"
$BVM_SHIMS_DIR = Join-Path $BVM_DIR "shims"
$BVM_SRC_DIR = Join-Path $BVM_DIR "src"
$BVM_RUNTIME_DIR = Join-Path $BVM_DIR "runtime"
$BVM_ALIAS_DIR = Join-Path $BVM_DIR "aliases"
$BVM_VERSIONS_DIR = Join-Path $BVM_DIR "versions"

# --- 0. Smart Network Detection (CN vs Global) ---
function Detect-NetworkZone {
    if ($env:BVM_REGION) { return $env:BVM_REGION }
    if ($env:BVM_TEST_FORCE_CN) { return "cn" }
    if ($env:BVM_TEST_FORCE_GLOBAL) { return "global" }

    $Mirror = "npm.elemecdn.com"
    try {
        $Test = Invoke-WebRequest -Uri "https://$Mirror" -Method Head -TimeoutSec 1.5 -UseBasicParsing -ErrorAction SilentlyContinue
        if ($Test.StatusCode -eq 200) { return "cn" }
    } catch {}
    return "global"
}

$BVM_REGION = Detect-NetworkZone
if ($BVM_REGION -eq "cn") {
    $REGISTRY = "registry.npmmirror.com"
    $NPM_CDN = "https://npm.elemecdn.com"
} else {
    $REGISTRY = "registry.npmjs.org"
    $NPM_CDN = "https://unpkg.com"
}

# --- Setup Curl Command ---
$CURL_CMD = "curl.exe"
if (-not (Get-Command $CURL_CMD -ErrorAction SilentlyContinue)) { $CURL_CMD = "curl" }

# --- 1. Resolve BVM and Bun Versions ---
$DEFAULT_BVM_VER = "v1.0.9"
$BVM_VER = if ($env:BVM_INSTALL_VERSION) { $env:BVM_INSTALL_VERSION } else { "" }

# Resolve BVM Version dynamically if not provided
if (-not $BVM_VER) {
    # Check for local development mode
    if ((Test-Path "dist\index.js") -and (Test-Path "package.json")) {
        $PkgContent = Get-Content "package.json" -Raw | ConvertFrom-Json
        $BVM_VER = "v1.1.0" + $PkgContent.version
        Write-Host "Using local version from package.json: $BVM_VER" -ForegroundColor Gray
    } else {
        try {
            $Resp = Invoke-RestMethod -Uri "https://$REGISTRY/@bvm-cli/core" -TimeoutSec 5
            $BVM_VER = "v" + $Resp."dist-tags".latest
        } catch {
            $BVM_VER = $DEFAULT_BVM_VER
        }
    }
}

$BVM_MAJOR = $BVM_VER.TrimStart('v').Split('.')[0]
$BUN_MAJOR = $BVM_MAJOR
$BUN_VER = "1.3.5" # Fallback

Write-Host "BVM Installer ($BVM_REGION) - Resolving Bun v$BUN_MAJOR runtime..." -ForegroundColor Gray
try {
    $BunLatest = (Invoke-RestMethod -Uri "https://$REGISTRY/-/package/bun/dist-tags" -TimeoutSec 5).latest
    if ($BunLatest -and $BunLatest.StartsWith("$BUN_MAJOR.")) { $BUN_VER = $BunLatest }
} catch {}

# --- 3. Setup Directories ---
$Dirs = @($BVM_DIR, $BVM_SRC_DIR, $BVM_RUNTIME_DIR, $BVM_BIN_DIR, $BVM_SHIMS_DIR, $BVM_ALIAS_DIR, $BVM_VERSIONS_DIR)
foreach ($d in $Dirs) { if (-not (Test-Path $d)) { New-Item -ItemType Directory -Force -Path $d | Out-Null } }

# --- 4. Download & Extract Bun ---
# Note: In bootstrap, we install directly to versions/ and then link to runtime/
$TARGET_DIR = Join-Path $BVM_VERSIONS_DIR "v$BUN_VER"
$BUN_EXE_NAME = if ($IsWin) { "bun.exe" } else { "bun" }

if (-not (Test-Path (Join-Path $TARGET_DIR "bin\$BUN_EXE_NAME"))) {
    Write-Host "Downloading Bun v$BUN_VER..."
    $URL = "https://$REGISTRY/@oven/bun-windows-x64/-/bun-windows-x64-$BUN_VER.tgz"
    $TMP = Join-Path $BVM_DIR "bun-runtime.tgz"
    & $CURL_CMD "-#SfLo" "$TMP" "$URL"
    
    $EXT = Join-Path $BVM_DIR "temp_extract"
    if (Test-Path $EXT) { Remove-Item $EXT -Recurse -Force | Out-Null }
    New-Item -ItemType Directory -Path $EXT | Out-Null
    
    Write-Host "Extracting..."
    & tar -xf "$TMP" -C "$EXT"
    
    $FoundBun = Get-ChildItem -Path $EXT -Filter $BUN_EXE_NAME -Recurse | Select-Object -First 1
    if ($null -eq $FoundBun) {
        # Fallback for different archive structures
        $FoundBun = Get-ChildItem -Path $EXT -Filter "bun*" -Recurse | Where-Object { $_.Name -match "^bun(\.exe)?$" } | Select-Object -First 1
    }

    $BIN_DEST = Join-Path $TARGET_DIR "bin"
    New-Item -ItemType Directory -Path $BIN_DEST -Force | Out-Null
    Move-Item -Path $FoundBun.FullName -Destination (Join-Path $BIN_DEST $BUN_EXE_NAME) -Force
    
    Remove-Item $TMP -Force
    Remove-Item $EXT -Recurse -Force
}

# Sync to runtime for BVM execution
$RUNTIME_VER_DIR = Join-Path $BVM_RUNTIME_DIR "v$BUN_VER"
if (-not (Test-Path $RUNTIME_VER_DIR)) {
    # Windows Junction or Unix Symlink
    if ($IsWin) {
        New-Item -ItemType Junction -Path $RUNTIME_VER_DIR -Target $TARGET_DIR | Out-Null
    } else {
        New-Item -ItemType SymbolicLink -Path $RUNTIME_VER_DIR -Target $TARGET_DIR | Out-Null
    }
}
$CURRENT_LINK = Join-Path $BVM_RUNTIME_DIR "current"
if ($IsWin) {
    New-Item -ItemType Junction -Path $CURRENT_LINK -Target $RUNTIME_VER_DIR -Force | Out-Null
} else {
    New-Item -ItemType SymbolicLink -Path $CURRENT_LINK -Target $RUNTIME_VER_DIR -Force | Out-Null
}

# --- 5. Download BVM Source & Shim ---
$BVM_PLAIN_VER = $BVM_VER.TrimStart('v')
$BASE_URL = "$NPM_CDN/@bvm-cli/core@$BVM_PLAIN_VER"

$LOCAL_DIST = Join-Path $PSScriptRoot "dist"
$INDEX_JS = Join-Path $LOCAL_DIST "index.js"
if (Test-Path $INDEX_JS) {
    Copy-Item $INDEX_JS (Join-Path $BVM_SRC_DIR "index.js") -Force
    $SHIM_JS_SRC = Join-Path $LOCAL_DIST "bvm-shim.js"
    if (Test-Path $SHIM_JS_SRC) {
        Copy-Item $SHIM_JS_SRC (Join-Path $BVM_BIN_DIR "bvm-shim.js") -Force
    }
} else {
    Write-Host "Downloading BVM Source & Shim $BVM_VER..."
    $SRC_URL = "$BASE_URL/dist/index.js"
    $SHIM_URL = "$BASE_URL/dist/bvm-shim.js"
    & $CURL_CMD "-#SfLo" (Join-Path $BVM_SRC_DIR "index.js") "$SRC_URL"
    & $CURL_CMD "-#SfLo" (Join-Path $BVM_BIN_DIR "bvm-shim.js") "$SHIM_URL"
}

# --- 6. Bootstrap Shims (Pure PowerShell, No index.js dependency) ---
Write-Host "Initializing shims..." -ForegroundColor Gray

$CMD_NAMES = @("bun", "bunx")
foreach ($name in $CMD_NAMES) {
    $tpl = "@echo off`r`nset `"BVM_DIR=%USERPROFILE%\.bvm`"`r`n`r`n"
    $tpl += ":: Fast-path: If no .bvmrc in current directory, run default directly`r`n"
    $tpl += "if not exist `".bvmrc`" (`r`n"
    $tpl += "    `"%BVM_DIR%\\runtime\\current\\bin\\bun.exe`" %*`r`n"
    $tpl += "    exit /b %errorlevel%`r`n"
    $tpl += ")`r`n`r`n"
    $tpl += ":: Slow-path: Hand over to JS shim for version resolution`r`n"
    $tpl += "`"%BVM_DIR%\\runtime\\current\\bin\\bun.exe`" `"%BVM_DIR%\\bin\\bvm-shim.js`" `"$name`" %*"
    
    $SHIM_PATH = Join-Path $BVM_SHIMS_DIR "$name.cmd"
    Set-Content -Path $SHIM_PATH -Value $tpl -Encoding Ascii
    
    $OLD_PS1 = Join-Path $BVM_SHIMS_DIR "$name.ps1"
    if (Test-Path $OLD_PS1) { Remove-Item $OLD_PS1 -Force }
}

# Create bvm.cmd
$BvmWrapper = "@echo off`r`nset `"BVM_DIR=%USERPROFILE%\.bvm`"`r`n`"%BVM_DIR%\runtime\current\bin\bun.exe`" `"%BVM_DIR%\src\index.js`" %*"
Set-Content -Path (Join-Path $BVM_BIN_DIR "bvm.cmd") -Value $BvmWrapper -Encoding Ascii

# Set initial default alias
$DEFAULT_ALIAS = Join-Path $BVM_ALIAS_DIR "default"
if (-not (Test-Path $DEFAULT_ALIAS)) {
    Set-Content -Path $DEFAULT_ALIAS -Value "v$BUN_VER" -Encoding Ascii
}

# --- 7. Finalize Environment ---
$RawPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($null -eq $RawPath) { $RawPath = "" }
$PathList = $RawPath.Split(';', [System.StringSplitOptions]::RemoveEmptyEntries)
$NewPathList = @()
foreach ($p in $PathList) {
    if ($p -notlike "*\.bvm\shims*" -and $p -notlike "*\.bvm\bin*") {
        $NewPathList += $p
    }
}
$FinalPath = "$BVM_SHIMS_DIR;$BVM_BIN_DIR;" + ($NewPathList -join ';')
[Environment]::SetEnvironmentVariable("Path", $FinalPath, "User")

# Update Current Session
$env:Path = "$BVM_SHIMS_DIR;$BVM_BIN_DIR;$env:Path"

if ([Environment]::OSVersion.Platform -eq "Win32NT") {
    & (Join-Path (Join-Path $BVM_RUNTIME_DIR "current\bin") "bun.exe") (Join-Path $BVM_SRC_DIR "index.js") setup --silent
}

Write-Host "`n[OK] BVM installed successfully!" -ForegroundColor Green
Write-Host "IMPORTANT: Please close this terminal and open a NEW one." -ForegroundColor Yellow