# BVM Installer for Windows (PowerShell)
$ErrorActionPreference = "Stop"

# Ensure TLS 1.2 is enabled for GitHub/CDN downloads
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

# --- Architecture Check ---
$is64bit = [Environment]::Is64BitOperatingSystem
if (-not $is64bit) {
    Write-Host "Current Architecture: $env:PROCESSOR_ARCHITECTURE"
    Write-Error "BVM requires a 64-bit version of Windows."
    exit 1
}

# Configuration
$BVM_DIR = "$HOME\.bvm"
$BVM_SRC_DIR = "$BVM_DIR\src"
$BVM_RUNTIME_DIR = "$BVM_DIR\runtime"
$BVM_BIN_DIR = "$BVM_DIR\bin"
$BVM_SHIMS_DIR = "$BVM_DIR\shims"
$BVM_ALIAS_DIR = "$BVM_DIR\aliases"

# 0. Smart Registry Selection
$REGISTRY = "registry.npmjs.org"
$MIRROR = "registry.npmmirror.com"
try {
    # Test connection to mirror with 2s timeout
    $Test = Invoke-WebRequest -Uri "https://$MIRROR" -TimeoutSec 2 -UseBasicParsing -ErrorAction SilentlyContinue
    if ($Test.StatusCode -eq 200) {
        $REGISTRY = $MIRROR
    }
} catch {
    # Ignore errors, stick to default
}

# 1. Resolve BVM and Bun Versions
$BVM_VER = "v1.0.0" # Fallback
$BUN_VER = "1.3.5"  # Fallback
$BUN_MAJOR = "1"    # Expected Bun Major Version for Runtime

try {
    Write-Host -NoNewline "Resolving latest BVM version... "
    # Get latest BVM version from GitHub main branch via jsDelivr
    $PkgJson = (Invoke-RestMethod -Uri "https://cdn.jsdelivr.net/gh/EricLLLLLL/bvm@main/package.json" -TimeoutSec 5)
    if ($PkgJson -and $PkgJson.version) {
        $BVM_VER = "v$($PkgJson.version)"
        Write-Host "$BVM_VER" -ForegroundColor Green
    } else {
        Write-Host "Using fallback $BVM_VER" -ForegroundColor Yellow
    }

    Write-Host -NoNewline "Resolving latest Bun $BUN_MAJOR.x runtime... "
    # Using irm (Invoke-RestMethod) to get the latest tag from NPM
    $BunLatest = (Invoke-RestMethod -Uri "https://$REGISTRY/-/package/bun/dist-tags" -TimeoutSec 5).latest
    if ($BunLatest -and $BunLatest.StartsWith("$BUN_MAJOR.")) {
        $BUN_VER = $BunLatest
        Write-Host "v$BUN_VER" -ForegroundColor Green
    } else {
        Write-Host "Failed (Using fallback v$BUN_VER)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Network Error (Using fallback versions)" -ForegroundColor Yellow
}

# 2. Setup Runtime
$Dirs = @($BVM_DIR, $BVM_SRC_DIR, $BVM_RUNTIME_DIR, $BVM_BIN_DIR, $BVM_SHIMS_DIR, $BVM_ALIAS_DIR)
foreach ($d in $Dirs) { if (-not (Test-Path $d)) { New-Item -ItemType Directory -Force -Path $d | Out-Null } }

$TARGET_DIR = "$BVM_RUNTIME_DIR\v$BUN_VER"
if (-not (Test-Path "$TARGET_DIR\bin\bun.exe")) {
    Write-Host "Downloading BVM Runtime (bun@$BUN_VER)..."
    $URL = "https://$REGISTRY/@oven/bun-windows-x64/-/bun-windows-x64-$BUN_VER.tgz"
    $TMP = "$BVM_DIR\bun-runtime.tgz"
    
    # Clean up existing temp file to prevent curl write errors (Exit Code 23)
    if (Test-Path $TMP) { Remove-Item $TMP -Force -ErrorAction SilentlyContinue }

    try {
        if (Get-Command curl.exe -ErrorAction SilentlyContinue) {
            # Use curl.exe if available (Best reliability & Progress Bar)
            # -# : Progress Bar
            # -S : Show Error
            # -f : Fail silently (server errors)
            # -L : Follow Redirects
            # -o : Output file
            & curl.exe "-#SfLo" "$TMP" "$URL"
            if ($LASTEXITCODE -ne 0) { throw "curl failed with exit code $LASTEXITCODE" }
        } else {
            throw "curl not found"
        }
    } catch {
        Write-Warning "curl failed or missing. Falling back to Invoke-RestMethod..."
        try {
            Invoke-RestMethod -Uri $URL -OutFile $TMP
        } catch {
            Write-Error "Failed to download runtime. $_"
            exit 1
        }
    }
    Write-Host "Download complete."
    
    $EXT = "$BVM_DIR\temp_extract"
    if (Test-Path $EXT) { Remove-Item $EXT -Recurse -Force -ErrorAction SilentlyContinue }
    New-Item -ItemType Directory -Path $EXT -Force | Out-Null

    Write-Host "Extracting..."
    try {
        # Windows 10+ comes with tar.exe. 
        # npm packages are .tgz, so tar is perfect.
        & tar -xf "$TMP" -C "$EXT"
        if ($LASTEXITCODE -ne 0) { throw "tar failed with exit code $LASTEXITCODE" }
    } catch {
        Write-Error "Failed to extract runtime. Ensure tar is installed or try a newer Windows version. $_"
        exit 1
    }

    # npm packages typically extract into a 'package' folder
    $SourcePath = "$EXT\package"
    if (-not (Test-Path $SourcePath)) {
        # Fallback: Just grab the first directory if 'package' isn't there
        $SourcePath = (Get-ChildItem -Path $EXT -Directory | Select-Object -First 1).FullName
    }

    if ($null -eq $SourcePath -or -not (Test-Path $SourcePath)) {
        Write-Error "Extraction failed: Could not find extracted folder structure."
        exit 1
    }

    # Move to target version directory
    Move-Item -Path $SourcePath -Destination $TARGET_DIR -Force
    
    # Cleanup
    Remove-Item $TMP -Force -ErrorAction SilentlyContinue
    Remove-Item $EXT -Recurse -Force -ErrorAction SilentlyContinue
}

# 3. Download Source
$LOCAL_DIST = "$PSScriptRoot\dist\index.js"

if (Test-Path $LOCAL_DIST) {
    Write-Host "Using local BVM build from $LOCAL_DIST..." -ForegroundColor Cyan
    Copy-Item $LOCAL_DIST "$BVM_SRC_DIR\index.js" -Force
} else {
    Write-Host "Downloading BVM Source ($BVM_VER)..."
    $SRC_URL = "https://cdn.jsdelivr.net/gh/EricLLLLLL/bvm@$BVM_VER/dist/index.js"

    try {
        if (Get-Command curl.exe -ErrorAction SilentlyContinue) {
            # Use curl.exe if available (Best reliability & Progress Bar)
            & curl.exe "-#SfLo" "$BVM_SRC_DIR\index.js" "$SRC_URL"
            if ($LASTEXITCODE -ne 0) { throw "curl failed with exit code $LASTEXITCODE" }
        } else {
            throw "curl not found"
        }
    } catch {
        Write-Warning "curl failed or missing. Falling back to Invoke-RestMethod..."
        try {
            Invoke-RestMethod -Uri $SRC_URL -OutFile "$BVM_SRC_DIR\index.js"
        } catch {
            Write-Error "Failed to download BVM source. $_"
            exit 1
        }
    }
    Write-Host "Download complete."
}

# 4. Finalize
Write-Host -NoNewline "Configuring shell... "

# Create bvm.cmd wrapper
$Wrapper = "@echo off`r`nset `"BVM_DIR=%USERPROFILE%\.bvm`"`r`n`"%BVM_DIR%\runtime\current\bin\bun.exe`" `"%BVM_DIR%\src\index.js`" %*"
Set-Content -Path "$BVM_BIN_DIR\bvm.cmd" -Value $Wrapper -Encoding Ascii

# Update PATH (User Level Persistence)
$Path = [Environment]::GetEnvironmentVariable("Path", "User")
$New = @("$BVM_SHIMS_DIR", "$BVM_BIN_DIR")
$Changed = $false
foreach ($p in $New) { 
    # Simple check; for robustness we might split by ; but this covers most cases
    if ($Path -notlike "*$p*") { 
        $Path = "$p;$Path"
        $Changed = $true
    } 
}
if ($Changed) {
    [Environment]::SetEnvironmentVariable("Path", $Path, "User")
}

# Update Current Session PATH so immediate calls work
$env:Path = "$BVM_SHIMS_DIR;$BVM_BIN_DIR;$env:Path"
$env:BVM_DIR = $BVM_DIR

# 5. Initialize Default Version (Critical for 'bun' to work immediately)
$DEFAULT_ALIAS = "$BVM_ALIAS_DIR\default"
if (-not (Test-Path $DEFAULT_ALIAS)) {
    $VERSION_DIR = "$BVM_DIR\versions\v$BUN_VER"
    
    # Copy the runtime we just downloaded to the versions directory
    # This avoids downloading it again and ensures 'bun' works instantly
    if (-not (Test-Path $VERSION_DIR)) {
        Write-Host "Initializing default Bun version (v$BUN_VER)..."
        New-Item -ItemType Directory -Path "$BVM_DIR\versions" -Force | Out-Null
        
        # Copy from runtime/v1.3.5 to versions/v1.3.5
        # Use Copy-Item -Recurse to copy the whole folder structure (bin/bun.exe)
        Copy-Item -Path "$BVM_RUNTIME_DIR\v$BUN_VER" -Destination $VERSION_DIR -Recurse -Force
    }

    # Set default alias
    Set-Content -Path $DEFAULT_ALIAS -Value "v$BUN_VER" -Encoding Ascii
    Write-Host "Set default version to v$BUN_VER"
}

# Ensure 'current' points to the installed version so bootstrapping works
$CURRENT_LINK = "$BVM_RUNTIME_DIR\current"
if (Test-Path $CURRENT_LINK) {
    Remove-Item $CURRENT_LINK -Force -Recurse -ErrorAction SilentlyContinue
}
Write-Host "Linking 'current' to v$BUN_VER..."
New-Item -ItemType Junction -Path $CURRENT_LINK -Target "$BVM_RUNTIME_DIR\v$BUN_VER" | Out-Null

# Run Setup and Rehash
try {
    & "$BVM_RUNTIME_DIR\current\bin\bun.exe" "$BVM_SRC_DIR\index.js" setup --silent
    & "$BVM_RUNTIME_DIR\current\bin\bun.exe" "$BVM_SRC_DIR\index.js" rehash --silent
} catch {
    Write-Warning "Setup/Rehash step failed. Attempting manual shim patch..."
}

# --- Execution Policy Check ---
try {
    $Policy = Get-ExecutionPolicy -Scope CurrentUser
    if ($Policy -eq "Undefined" -or $Policy -eq "Restricted") {
        Write-Host "`n`e[1;33m[!] Notice: Adjusting PowerShell Execution Policy...`e[0m"
        Write-Host "BVM requires scripts to be executable to load configuration."
        Write-Host "Setting 'RemoteSigned' for CurrentUser."
        Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
    }
} catch {
    Write-Warning "Could not automatically set Execution Policy. If you see 'Running scripts is disabled', please run:"
    Write-Warning "Set-ExecutionPolicy RemoteSigned -Scope CurrentUser"
}

Write-Host "Done."

Write-Host "`n`e[1;32m[OK] BVM $BVM_VER installed successfully!`e[0m"
Write-Host "`nTo start using bvm:"
Write-Host "  1. Restart your terminal (Command Prompt or PowerShell)."
Write-Host "  2. Verify:"
Write-Host "     bvm --version"