# BVM Installer for Windows (PowerShell)
$ErrorActionPreference = "Stop"

# Placeholder for build-time injection.
$BvmEmbeddedVersion = ""

# Current Stable Version on Main Branch (Updated by release script)
$DefaultBvmVersion = "v1.0.5"

# --- Configuration ---
$BVM_DIR = "$HOME\.bvm"
$BVM_SRC_DIR = "$BVM_DIR\src"
$BVM_RUNTIME_DIR = "$BVM_DIR\runtime"
$BVM_BIN_DIR = "$BVM_DIR\bin"
$BVM_SHIMS_DIR = "$BVM_DIR\shims"
$BVM_ALIAS_DIR = "$BVM_DIR\aliases"

# Colors
function Write-Color($Text, $Color) { Write-Host $Text -ForegroundColor $Color }

# Logo
Write-Host -ForegroundColor Magenta @"
______________   _________   
\______   \   \ /   /     \  
 |    |  _/   Y   /  \ /  \ 
 |    |   \ \     /    Y    \ 
 |______  /  \___/\____|__  / 
        \/                \/ 
"@
Write-Color "🚀 Installing BVM (Bun Version Manager)..." Cyan

# --- 1. Platform Detection ---
# Windows is usually x64 or arm64. Handle 32-bit Powershell on 64-bit OS.
$ARCH = $env:PROCESSOR_ARCHITECTURE
$ARCH64 = $env:PROCESSOR_ARCHITEW6432
$NPM_PKG = ""

if ($ARCH -eq "AMD64" -or $ARCH64 -eq "AMD64") {
    $NPM_PKG = "@oven/bun-windows-x64"
    $BUN_ARCH = "x64"
} elseif ($ARCH -eq "ARM64") {
    $NPM_PKG = "@oven/bun-windows-x64" # Fallback to x64 translation for now
    $BUN_ARCH = "x64"
    Write-Color "Warning: ARM64 detected, using x64 build (emulated)." Yellow
} else {
    Write-Color "Unsupported Architecture: $ARCH" Red
    exit 1
}

Write-Color "Detected Platform: Windows ($BUN_ARCH)" Gray

# --- 2. Version Resolution ---
if ($env:BVM_INSTALL_BUN_VERSION) {
    $REQUIRED_BUN_VERSION = $env:BVM_INSTALL_BUN_VERSION
} else {
    $FALLBACK_BUN_VERSION = "1.3.5"
    $REQUIRED_MAJOR_VERSION = $FALLBACK_BUN_VERSION.Split(".")[0]
    
    Write-Host "🔍 Resolving latest Bun v$REQUIRED_MAJOR_VERSION.x version..." -NoNewline -ForegroundColor Gray
    
    try {
        $NpmInfo = Invoke-RestMethod -Uri "https://registry.npmjs.org/bun" -ErrorAction Stop
        if ($NpmInfo -and $NpmInfo.versions) {
            $LatestCompatible = $NpmInfo.versions.PSObject.Properties.Name | 
                Where-Object { $_ -match "^$REQUIRED_MAJOR_VERSION\." } | 
                Sort-Object { [version]$_ } -Descending | 
                Select-Object -First 1
                
            if ($LatestCompatible) {
                $REQUIRED_BUN_VERSION = $LatestCompatible
                Write-Color " v$REQUIRED_BUN_VERSION" Blue
            } else {
                throw "No compatible version found"
            }
        }
    } catch {
        $REQUIRED_BUN_VERSION = $FALLBACK_BUN_VERSION
        Write-Color " v$REQUIRED_BUN_VERSION (fallback)" Gray
    }
}

# --- 3. Setup Directories ---
$Dirs = @($BVM_DIR, $BVM_SRC_DIR, $BVM_RUNTIME_DIR, $BVM_BIN_DIR, $BVM_SHIMS_DIR, $BVM_ALIAS_DIR)
foreach ($d in $Dirs) {
    if (-not (Test-Path $d)) { New-Item -ItemType Directory -Force -Path $d | Out-Null }
}

# --- 4. Install Runtime (NPM-First Strategy) ---
$TARGET_RUNTIME_DIR = "$BVM_DIR\runtime\v$REQUIRED_BUN_VERSION"
$BUN_EXE = "$TARGET_RUNTIME_DIR\bin\bun.exe"

if (-not (Test-Path $BUN_EXE)) {
    Write-Color "📦 Downloading BVM Runtime (v$REQUIRED_BUN_VERSION)..." Blue
    
    $TarballName = "bun-windows-$BUN_ARCH-$REQUIRED_BUN_VERSION.tgz"
    $URL_NPM = "https://registry.npmjs.org/$NPM_PKG/-/$TarballName"
    $URL_MIRROR = "https://registry.npmmirror.com/$NPM_PKG/-/$TarballName"
    
    $TEMP_TGZ = "$BVM_DIR\bun-runtime.tgz"
    
    function Download-WithProgress ($Url, $OutFile) {
        $WebClient = New-Object System.Net.WebClient
        $TotalBytes = -1
        
        # Get content length first (Head request)
        try {
            $Req = [System.Net.WebRequest]::Create($Url)
            $Req.Method = "HEAD"
            $Resp = $Req.GetResponse()
            $TotalBytes = $Resp.ContentLength
            $Resp.Close()
        } catch {}

        $DownloadAction = {
            param($Sender, $E)
            $Percent = $E.ProgressPercentage
            $Received = "{0:N2} MB" -f ($E.BytesReceived / 1MB)
            $Total = "{0:N2} MB" -f ($E.TotalBytesToReceive / 1MB)
            Write-Progress -Activity "Downloading Bun Runtime" -Status "$Received / $Total" -PercentComplete $Percent
        }
        
        Register-ObjectEvent -InputObject $WebClient -EventName DownloadProgressChanged -Action $DownloadAction | Out-Null
        
        try {
            $WebClient.DownloadFileAsync($Url, $OutFile)
            while ($WebClient.IsBusy) { Start-Sleep -Milliseconds 100 }
        } finally {
            $WebClient.Dispose()
            Write-Progress -Activity "Downloading Bun Runtime" -Completed
        }
    }

    $DownloadSuccess = $false
    try {
        Write-Color "Downloading from NPM Registry..." Gray
        Download-WithProgress $URL_NPM $TEMP_TGZ
        $DownloadSuccess = $true
    } catch {
        Write-Color "NPM Registry failed, trying Mirror..." Yellow
        try {
            Write-Color "Downloading from NPM Mirror..." Gray
            Download-WithProgress $URL_MIRROR $TEMP_TGZ
            $DownloadSuccess = $true
        } catch {
            Write-Color "Failed to download Bun runtime." Red
            exit 1
        }
    }

    if ($DownloadSuccess) {
        Write-Color "🔓 Extracting..." Blue
        $ExtractDir = "$BVM_DIR\temp_extract"
        if (Test-Path $ExtractDir) { Remove-Item $ExtractDir -Recurse -Force }
        New-Item -ItemType Directory -Force -Path $ExtractDir | Out-Null

        try {
            tar -xzf $TEMP_TGZ -C $ExtractDir
        } catch {
            Write-Color "Extraction failed. Ensure 'tar' is available on your system." Red
            exit 1
        }

        $FoundBun = Get-ChildItem -Path $ExtractDir -Recurse -Filter "bun.exe" | Select-Object -First 1
        
        if ($FoundBun) {
            if (Test-Path $TARGET_RUNTIME_DIR) { Remove-Item $TARGET_RUNTIME_DIR -Recurse -Force }
            New-Item -ItemType Directory -Force -Path "$TARGET_RUNTIME_DIR\bin" | Out-Null
            Move-Item $FoundBun.FullName -Destination "$TARGET_RUNTIME_DIR\bin\bun.exe" -Force
            Write-Color "Runtime installed." Green

            # Create 'current' junction for runtime
            $RuntimeCurrent = "$BVM_RUNTIME_DIR\current"
            if (Test-Path $RuntimeCurrent) { Remove-Item $RuntimeCurrent -Force }
            New-Item -ItemType Junction -Path $RuntimeCurrent -Target $TARGET_RUNTIME_DIR | Out-Null
        } else {
            Write-Color "Error: bun.exe not found in downloaded archive." Red
            exit 1
        }
        
        Remove-Item $TEMP_TGZ -Force
        Remove-Item $ExtractDir -Recurse -Force
    }
}

# --- 5. Install BVM Source ---
$BVM_SRC_VERSION = $null
if ($env:BVM_INSTALL_VERSION) { 
    $BVM_SRC_VERSION = $env:BVM_INSTALL_VERSION 
} elseif ($BvmEmbeddedVersion) {
    $BVM_SRC_VERSION = $BvmEmbeddedVersion
} else {
    $BVM_SRC_VERSION = $DefaultBvmVersion
}

Write-Color " Version: $BVM_SRC_VERSION" Blue

$SOURCE_URL = "https://cdn.jsdelivr.net/gh/EricLLLLLL/bvm@$BVM_SRC_VERSION/dist/index.js"
if ($env:BVM_SOURCE_URL) { $SOURCE_URL = $env:BVM_SOURCE_URL }

Write-Color "⬇️  Downloading BVM source..." Blue
try {
    # Write-Host "DEBUG: Downloading from $SOURCE_URL"
    Invoke-WebRequest -Uri $SOURCE_URL -OutFile "$BVM_SRC_DIR\index.js" -ErrorAction Stop
} catch {
    Write-Color "Failed to download BVM source." Red
    Write-Color "URL: $SOURCE_URL" Yellow
    if (-not (Test-Path "$BVM_SRC_DIR\index.js")) { exit 1 }
}

# --- 6. Create Wrapper & Shims ---
# Generate bvm.cmd to ensure we use the dedicated runtime (avoids deadlocks with .bvmrc)
$WrapperPath = "$BVM_BIN_DIR\bvm.cmd"
$WrapperContent = "@echo off`r`n" +
                  "set `"BVM_DIR=%USERPROFILE%\.bvm`"`r`n" +
                  "`"%BVM_DIR%\runtime\current\bin\bun.exe`" `"%BVM_DIR%\src\index.js`" %*"
Set-Content -Path $WrapperPath -Value $WrapperContent -Encoding Ascii

& "$BVM_RUNTIME_DIR\v$REQUIRED_BUN_VERSION\bin\bun.exe" "$BVM_SRC_DIR\index.js" setup --silent

# --- 7. Setup Environment Variables (Persistence) ---
Write-Color "🔧 Configuring Environment Variables..." Blue

$UserPath = [Environment]::GetEnvironmentVariable("Path", "User")
# Prefer Shims > Bin > Runtime. 
# Shims handle .bvmrc/default versioning. Bin handles 'bvm' command.
$NewPaths = @("$BVM_SHIMS_DIR", "$BVM_BIN_DIR")
$PathChanged = $false

foreach ($p in $NewPaths) {
    if ($UserPath -notlike "*$p*") {
        $UserPath = "$p;$UserPath"
        $PathChanged = $true
    }
}

if ($PathChanged) {
    [Environment]::SetEnvironmentVariable("Path", $UserPath, "User")
    Write-Color "✓ Added BVM Shims & Bin to User PATH." Green
} else {
    Write-Color "✓ PATH already configured." Green
}

# Refresh current session PATH roughly
$env:PATH = "$BVM_SHIMS_DIR;$BVM_BIN_DIR;" + $env:PATH

Write-Host ""
Write-Color "🎉 BVM installed successfully!" Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor White
Write-Host "  1. Restart your terminal to load the new PATH." -ForegroundColor Cyan
Write-Host "  2. Run 'bvm --help' to get started." -ForegroundColor Cyan

