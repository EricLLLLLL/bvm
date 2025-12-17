# BVM Installer for Windows (PowerShell)
$ErrorActionPreference = "Stop"

$BVM_DIR = "$HOME\.bvm"
$BVM_SRC_DIR = "$BVM_DIR\src"
$BVM_RUNTIME_DIR = "$BVM_DIR\runtime"
$BVM_BIN_DIR = "$BVM_DIR\bin"

$REQUIRED_BUN_VERSION = "1.3.4"

Write-Host "Installing BVM (Bun Version Manager)..." -ForegroundColor Blue

# 1. Setup Directories
New-Item -ItemType Directory -Force -Path $BVM_DIR | Out-Null
New-Item -ItemType Directory -Force -Path $BVM_SRC_DIR | Out-Null
New-Item -ItemType Directory -Force -Path $BVM_RUNTIME_DIR | Out-Null
New-Item -ItemType Directory -Force -Path $BVM_BIN_DIR | Out-Null

# 2. Install Private Bun Runtime
$TARGET_RUNTIME_DIR = "$BVM_RUNTIME_DIR\v$REQUIRED_BUN_VERSION"
$BUN_EXE = "$TARGET_RUNTIME_DIR\bin\bun.exe"

if (Test-Path $BUN_EXE) {
    Write-Host "BVM Runtime (Bun v$REQUIRED_BUN_VERSION) already installed." -ForegroundColor Green
} else {
    Write-Host "Downloading BVM Runtime (Bun v$REQUIRED_BUN_VERSION)..." -ForegroundColor Blue
    $BUN_URL = "https://github.com/oven-sh/bun/releases/download/bun-v$REQUIRED_BUN_VERSION/bun-windows-x64.zip"
    $TEMP_ZIP = "$BVM_DIR\bun-runtime.zip"
    
    Invoke-WebRequest -Uri $BUN_URL -OutFile $TEMP_ZIP
    
    # Extract
    Expand-Archive -Path $TEMP_ZIP -DestinationPath $BVM_DIR -Force
    
    # Move
    if (Test-Path "$BVM_DIR\bun-windows-x64") {
        Move-Item -Path "$BVM_DIR\bun-windows-x64" -Destination $TARGET_RUNTIME_DIR -Force
    }
    Remove-Item $TEMP_ZIP
}

# Link 'current' (Simulated via directory copy or junction on Windows, but let's just use path in wrapper)
# We won't use Symlink on Windows to avoid admin privilege requirement. 
# We will just point the wrapper to the specific version directory.

# 3. Install BVM Source
# Expecting dist/index.js locally for now, or download from release
if (Test-Path "dist\index.js") {
    Write-Host "Installing BVM source from local dist\index.js..." -ForegroundColor Blue
    Copy-Item "dist\index.js" -Destination "$BVM_SRC_DIR\index.js" -Force
} else {
    Write-Host "Downloading BVM source..." -ForegroundColor Blue
    $SOURCE_URL = "https://github.com/bvm-cli/bvm/releases/latest/download/index.js"
    
    # Allow override
    if ($env:BVM_SOURCE_URL) {
        $SOURCE_URL = $env:BVM_SOURCE_URL
    }

    Write-Host "Fetching from: $SOURCE_URL" -ForegroundColor Blue
    try {
        Invoke-WebRequest -Uri $SOURCE_URL -OutFile "$BVM_SRC_DIR\index.js"
        Write-Host "Source downloaded." -ForegroundColor Green
    } catch {
        Write-Host "Failed to download source. Please check your network." -ForegroundColor Red
        exit 1
    }
}

# 4. Create Wrapper Script (bvm.cmd)
$WRAPPER_PATH = "$BVM_BIN_DIR\bvm.cmd"
$BVM_JS_PATH = "$BVM_SRC_DIR\index.js"
$BUN_RUNTIME_EXE = "$TARGET_RUNTIME_DIR\bun.exe"

# Cleanup old runtime versions (excluding the current one)
Write-Host "Cleaning up old BVM Runtimes..." -ForegroundColor Blue
Get-ChildItem -Path "$BVM_RUNTIME_DIR" -Directory | ForEach-Object {
    if ($_.Name -ne "v$REQUIRED_BUN_VERSION") {
        Write-Host "Removing old runtime: $($_.Name)" -ForegroundColor Blue
        Remove-Item -LiteralPath $_.FullName -Recurse -Force
    }
}


$BatchContent = "@echo off
SET BVM_DIR=$BVM_DIR
"$BUN_RUNTIME_EXE" "$BVM_JS_PATH" %*
"
Set-Content -Path $WRAPPER_PATH -Value $BatchContent

Write-Host "BVM installed successfully!" -ForegroundColor Green
Write-Host "Please add $BVM_BIN_DIR to your PATH."