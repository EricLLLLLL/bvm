# BVM Installer for Windows (PowerShell)
$ErrorActionPreference = "Stop"

$BVM_DIR = "$HOME\.bvm"
$BVM_SRC_DIR = "$BVM_DIR\src"
$BVM_RUNTIME_DIR = "$BVM_DIR\runtime"
$BVM_BIN_DIR = "$BVM_DIR\bin"

$REQUIRED_BUN_VERSION = "1.3.5"
$REQUIRED_MAJOR_VERSION = $REQUIRED_BUN_VERSION.Split(".")[0]

# Resolve latest compatible version from NPM
try {
    Write-Host "Resolving latest Bun v$REQUIRED_MAJOR_VERSION.x version..." -ForegroundColor Gray
    $NpmInfo = Invoke-RestMethod -Uri "https://registry.npmjs.org/bun" -ErrorAction SilentlyContinue
    if ($NpmInfo -and $NpmInfo.versions) {
        $LatestCompatible = $NpmInfo.versions.PSObject.Properties.Name | 
            Where-Object { $_ -match "^$REQUIRED_MAJOR_VERSION\." } | 
            Sort-Object { [version]$_ } -Descending | 
            Select-Object -First 1
            
        if ($LatestCompatible) {
            $REQUIRED_BUN_VERSION = $LatestCompatible
            Write-Host "v$REQUIRED_BUN_VERSION" -ForegroundColor Blue
        } else {
            Write-Host "v$REQUIRED_BUN_VERSION (fallback)" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "v$REQUIRED_BUN_VERSION (fallback)" -ForegroundColor Gray
}

# Optimization: Smart Runtime Reuse
if (Test-Path $BVM_RUNTIME_DIR) {
    $ExistingRuntime = Get-ChildItem -Path $BVM_RUNTIME_DIR -Directory -Filter "v$REQUIRED_MAJOR_VERSION.*" | Sort-Object Name -Descending | Select-Object -First 1
    if ($ExistingRuntime) {
        $ExistingVer = $ExistingRuntime.Name.Substring(1) # Remove 'v'
        $REQUIRED_BUN_VERSION = $ExistingVer
        Write-Host "Reusing existing compatible Runtime v$ExistingVer (skip download)" -ForegroundColor Green
    }
}

Write-Host "Installing BVM (Bun Version Manager)..." -ForegroundColor Blue

# 1. Setup Directories
New-Item -ItemType Directory -Force -Path $BVM_DIR | Out-Null
New-Item -ItemType Directory -Force -Path $BVM_SRC_DIR | Out-Null
New-Item -ItemType Directory -Force -Path $BVM_RUNTIME_DIR | Out-Null
New-Item -ItemType Directory -Force -Path $BVM_BIN_DIR | Out-Null

# 2. Install Private Bun Runtime
$TARGET_RUNTIME_DIR = "$BVM_RUNTIME_DIR\v$REQUIRED_BUN_VERSION"
$BUN_EXE = "$TARGET_RUNTIME_DIR\bin\bun.exe"
$LOCAL_VERSION_EXE = "$BVM_DIR\versions\v$REQUIRED_BUN_VERSION\bun.exe"

if (Test-Path $BUN_EXE) {
    Write-Host "BVM Runtime (Bun v$REQUIRED_BUN_VERSION) already installed." -ForegroundColor Green
} elseif (Test-Path $LOCAL_VERSION_EXE) {
    Write-Host "Found Bun v$REQUIRED_BUN_VERSION in versions. Copying to runtime..." -ForegroundColor Green
    New-Item -ItemType Directory -Force -Path "$TARGET_RUNTIME_DIR\bin" | Out-Null
    Copy-Item $LOCAL_VERSION_EXE -Destination $BUN_EXE -Force
    Write-Host "BVM Runtime installed from local copy." -ForegroundColor Green
} elseif ((Get-Command bun -ErrorAction SilentlyContinue) -and ((bun --version) -eq $REQUIRED_BUN_VERSION)) {
    Write-Host "Found matching global Bun v$REQUIRED_BUN_VERSION. Copying to runtime..." -ForegroundColor Green
    New-Item -ItemType Directory -Force -Path "$TARGET_RUNTIME_DIR\bin" | Out-Null
    $GlobalBunPath = (Get-Command bun).Source
    Copy-Item $GlobalBunPath -Destination $BUN_EXE -Force
    Write-Host "BVM Runtime installed from global copy." -ForegroundColor Green
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
    $SOURCE_URL = "https://github.com/EricLLLLLL/bvm/releases/latest/download/index.js"
    
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

# 5. Create Wrapper Script for BVM (bvm.cmd)
$WRAPPER_PATH = Join-Path $BVM_BIN_DIR "bvm.cmd"
$BVM_JS_PATH = Join-Path $BVM_SRC_DIR "index.js"

$BatchContent = "@echo off
SET BVM_DIR=$BVM_DIR
REM This wrapper executes the main BVM JavaScript code via the active Bun shim.
REM The bun shim internally resolves the version to use.
""%BVM_DIR%\shims\bun.ps1"" ""%BVM_JS_PATH"" %*
"
Set-Content -Path $WRAPPER_PATH -Value $BatchContent

# 6. Setup Shim Scripts (bun.ps1, bunx.ps1)
$ShimsDir = Join-Path $BVM_DIR "shims"
New-Item -ItemType Directory -Force -Path $ShimsDir | Out-Null

$ShimScript = @"
# Shim managed by BVM (Bun Version Manager)
# This script dynamically routes commands to the correct Bun version.

$BvmDir = "$HOME\.bvm"
$Command = $MyInvocation.MyCommand.Name

# Remove .ps1 extension for command name
if ($Command -like "*.ps1") { $Command = $Command.Substring(0, $Command.Length - 4) }


# 1. Determine Bun version based on priority:
#    a) BVM_ACTIVE_VERSION (session override)
#    b) .bvmrc (project specific)
#    c) Global default
$Version = $null
if ($env:BVM_ACTIVE_VERSION) {
    $Version = $env:BVM_ACTIVE_VERSION
} elseif (Test-Path ".\.bvmrc") {
    $Version = "v" + (Get-Content ".\.bvmrc" | Select-Object -First 1)
} elseif (Test-Path "$BvmDir\aliases\default") {
    $Version = Get-Content "$BvmDir\aliases\default" | Select-Object -First 1
}

# 2. Validate and locate the version
if (-not $Version) {
    Write-Error "BVM Error: No Bun version is active or default is set."
    exit 1
}
if ($Version -notmatch "^v") { $Version = "v" + $Version } # Ensure 'v' prefix

$VersionDir = Join-Path $BvmDir "versions\$Version"

if (-not (Test-Path $VersionDir)) {
    Write-Error "BVM Error: Version $Version is not installed."
    exit 1
}

$RealExecutable = Join-Path $VersionDir "bin\$Command.exe" # PowerShell prefers .exe for binaries

# 3. Execution with environment injection
if (Test-Path $RealExecutable) {
    $env:BUN_INSTALL = $VersionDir
    $env:PATH = "$(Join-Path $VersionDir 'bin');$env:PATH" # Prioritize this version's bin for sub-commands
    
    # Smart Hook: If this is 'bun' and it's a global install command, auto-rehash
    if (($Command -eq "bun") -and ($args -match "-g") -and (($args -match "install") -or ($args -match "add") -or ($args -match "remove") -or ($args -match "uninstall"))) {
        # PowerShell needs Start-Process -NoNewWindow for background execution
        Start-Process -FilePath "$BvmDir\bin\bvm.cmd" -ArgumentList "rehash" -NoNewWindow
    }
    
    & $RealExecutable $args
} else {
    Write-Error "BVM Error: Command '$Command' not found in Bun $Version."
    exit 127
}
"@

Set-Content -Path (Join-Path $ShimsDir "bun.ps1") -Value $ShimScript
Set-Content -Path (Join-Path $ShimsDir "bunx.ps1") -Value $ShimScript # bunx is usually a symlink to bun

# 7. Auto-configure Shell
Write-Host "Configuring PowerShell environment..." -ForegroundColor Cyan
& "$WRAPPER_PATH" setup --silent

# 8. Setup Default Version (Only if no default exists)
# New Shim arch: This just creates the default alias file.
$VersionsDir = Join-Path $BVM_DIR "versions"
$DefaultAliasPath = Join-Path (Join-Path $BVM_DIR "aliases") "default"

if ($env:BVM_MODE -ne "upgrade" -and (-not (Test-Path $DefaultAliasPath))) {
    Write-Host "Setting Bun v$REQUIRED_BUN_VERSION (runtime) as the default global version." -ForegroundColor Blue
    
    $DefaultVersionBinDir = Join-Path (Join-Path $VersionsDir "v$REQUIRED_BUN_VERSION") "bin"
    New-Item -ItemType Directory -Force -Path $DefaultVersionBinDir | Out-Null
    
    # Copy bun exe
    $RuntimeBun = Join-Path $TARGET_RUNTIME_DIR "bin\bun.exe"
    if (-not (Test-Path $RuntimeBun)) {
         $RuntimeBun = Join-Path $TARGET_RUNTIME_DIR "bun.exe"
    }
    
    Copy-Item $RuntimeBun -Destination (Join-Path $DefaultVersionBinDir "bun.exe") -Force
    
    $AliasesDir = Join-Path $BVM_DIR "aliases"
    New-Item -ItemType Directory -Force -Path $AliasesDir | Out-Null
    "v$REQUIRED_BUN_VERSION" | Set-Content -Path $DefaultAliasPath -NoNewline
    
    # In Shim architecture, 'use' modifies the default alias file.
    # We call 'use' here to trigger the alias creation.
    & "$WRAPPER_PATH" use "$REQUIRED_BUN_VERSION" | Out-Null # Redirect output
    
    Write-Host "Bun v$REQUIRED_BUN_VERSION is now your default version." -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 BVM installed successfully!" -ForegroundColor Green -NoNoLine
Write-Host ""

Write-Host "Next steps:" -ForegroundColor White -NoNoLine
Write-Host ""
Write-Host "  1. To activate BVM, run:" -ForegroundColor White
Write-Host "     . `$PROFILE" -ForegroundColor Yellow -NoNoLine
Write-Host ""
Write-Host "  2. Now 'bun install -g' will be isolated per version!" -ForegroundColor Cyan
Write-Host "  3. Run bvm --help to get started." -ForegroundColor Cyan