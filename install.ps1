# BVM Installer for Windows (PowerShell)
# Highlights:
# 1. Zero external dependencies (no git, no node, no unzip needed).
# 2. Native .tgz extraction using .NET (works on all Windows versions).
# 3. Always uses fast NPM CDN.

$ErrorActionPreference = "Stop"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

# --- Architecture Check ---
if (-not [Environment]::Is64BitOperatingSystem) {
    Write-Error "BVM requires a 64-bit version of Windows."
    exit 1
}

# --- Configuration ---
$BVM_DIR = "$HOME\.bvm"
$BVM_SRC_DIR = "$BVM_DIR\src"
$BVM_RUNTIME_DIR = "$BVM_DIR\runtime"
$BVM_BIN_DIR = "$BVM_DIR\bin"
$BVM_SHIMS_DIR = "$BVM_DIR\shims"
$BVM_ALIAS_DIR = "$BVM_DIR\aliases"

# --- Helper: Polyfill for extracting .tgz without tar.exe ---
function Expand-Tgz {
    param([string]$Source, [string]$Destination)
    
    Write-Host "Extracting using PowerShell Native (Slow but steady)..." -ForegroundColor Gray
    $fs = [System.IO.File]::OpenRead($Source)
    try {
        $gzip = New-Object System.IO.Compression.GZipStream($fs, [System.IO.Compression.CompressionMode]::Decompress)
        try {
            $chunk = New-Object byte[] 512
            $mem = New-Object System.IO.MemoryStream
            $buffer = New-Object byte[] 8192
            
            # Simple TAR Parser
            while ($true) {
                $read = 0
                while ($read -lt 512) {
                    $n = $gzip.Read($chunk, $read, 512 - $read)
                    if ($n -eq 0) { break }
                    $read += $n
                }
                if ($read -eq 0) { break }
                
                # Check for end of archive (null block)
                if (($chunk | Measure-Object -Sum).Sum -eq 0) { continue }
                
                # Parse Filename (0-100)
                $nameBytes = $chunk[0..99] | Where-Object { $_ -ne 0 }
                $name = [System.Text.Encoding]::ASCII.GetString($nameBytes).Trim()
                if ([string]::IsNullOrWhiteSpace($name)) { continue }
                
                # Parse Size (124-135, octal)
                $sizeBytes = $chunk[124..135] | Where-Object { $_ -ne 0 }
                $sizeStr = [System.Text.Encoding]::ASCII.GetString($sizeBytes).Trim()
                try { $size = [Convert]::ToInt64($sizeStr, 8) } catch { $size = 0 }
                
                # Parse Type (156) - '0' or '\0' is file, '5' is dir
                $type = [char]$chunk[156]
                
                $targetPath = Join-Path $Destination $name
                
                # Blocks to consume
                $blocks = [Math]::Ceiling($size / 512)
                
                if ($type -eq '0' -or $type -eq 0) {
                    # Ensure dir exists
                    $parent = Split-Path $targetPath
                    if (-not (Test-Path $parent)) { New-Item -ItemType Directory -Path $parent -Force | Out-Null }
                    
                    # Read File Data
                    $outFile = [System.IO.File]::Create($targetPath)
                    $remain = $size
                    while ($remain -gt 0) {
                        # We can read in 512 chunks or larger. 
                        # Tar data is block aligned, but file size might not be.
                        # We just need to read exactly $size bytes from the stream, 
                        # BUT we must also consume the padding to finish the block.
                        # Easier strategy: read block by block.
                        
                        $toRead = if ($remain -lt 512) { $remain } else { 512 }
                        $readInBlock = 0
                        while ($readInBlock -lt 512) {
                             $k = $gzip.Read($chunk, $readInBlock, 512 - $readInBlock)
                             if ($k -eq 0) { break }
                             $readInBlock += $k
                        }
                        
                        $outFile.Write($chunk, 0, $toRead)
                        $remain -= $toRead
                    }
                    $outFile.Close()
                } else {
                    # Skip directory or other headers logic
                    # Just consume bytes
                     $skip = $blocks * 512
                     while ($skip -gt 0) {
                        $toSkip = if ($skip -lt 8192) { $skip } else { 8192 }
                        $k = $gzip.Read($buffer, 0, $toSkip)
                        if ($k -eq 0) { break }
                        $skip -= $k
                     }
                }
            }
        } finally { $gzip.Dispose() }
    } finally { $fs.Dispose() }
}

# --- Main Logic ---

# 0. Smart Registry Selection
$REGISTRY = "registry.npmjs.org"

if ($env:BVM_REGISTRY) {
    $REGISTRY = $env:BVM_REGISTRY
    Write-Host "Using registry from BVM_REGISTRY: $REGISTRY" -ForegroundColor Cyan
} else {
    $Mirror = "registry.npmmirror.com"
    $Official = "registry.npmjs.org"
    
    Write-Host -NoNewline "Selecting best registry... "
    
    $TimeMirror = 9999
    $TimeOfficial = 9999
    
    # 1. Test Mirror (Aggressive timeout)
    try {
        $TimeMirror = (Measure-Command { 
            Invoke-WebRequest -Uri "https://$Mirror" -TimeoutSec 1.5 -UseBasicParsing -ErrorAction Stop 
        }).TotalMilliseconds
    } catch {}

    # 2. Test Official
    try {
        $TimeOfficial = (Measure-Command { 
            Invoke-WebRequest -Uri "https://$Official" -TimeoutSec 1.5 -UseBasicParsing -ErrorAction Stop 
        }).TotalMilliseconds
    } catch {}
    
    # 3. Compare
    if ($TimeMirror -lt $TimeOfficial -and $TimeMirror -lt 1500) {
        $REGISTRY = $Mirror
        Write-Host "npmmirror ($([math]::Round($TimeMirror))ms)" -ForegroundColor Green
    } else {
        $REGISTRY = $Official
        # Show time only if successful, else just Official
        if ($TimeOfficial -lt 1500) {
             Write-Host "npmjs ($([math]::Round($TimeOfficial))ms)" -ForegroundColor Green
        } else {
             Write-Host "npmjs (Default)" -ForegroundColor Gray
        }
    }
}

# 1. Resolve BVM and Bun Versions
$BVM_VER = "v1.0.5" # Updated by release script

# Parse BVM Major version to use as Bun Major version for runtime
$BVM_MAJOR = $BVM_VER.TrimStart('v').Split('.')[0]
$BUN_MAJOR = $BVM_MAJOR
$BUN_VER = "" # To be resolved dynamically

Write-Host -NoNewline "Resolving latest BVM version... "
if ($env:BVM_INSTALL_VERSION) {
    $BVM_VER = $env:BVM_INSTALL_VERSION
    $BVM_MAJOR = $BVM_VER.TrimStart('v').Split('.')[0]
    $BUN_MAJOR = $BVM_MAJOR
    Write-Host "$BVM_VER (User Specified)" -ForegroundColor Green
} else {
    Write-Host "$BVM_VER" -ForegroundColor Green
}

Write-Host -NoNewline "Resolving latest Bun $BUN_MAJOR.x runtime... "
try {
    # Fetch latest version for the current major from NPM
    $BunLatest = (Invoke-RestMethod -Uri "https://$REGISTRY/-/package/bun/dist-tags" -TimeoutSec 5).latest
    if ($BunLatest -and $BunLatest.StartsWith("$BUN_MAJOR.")) {
        $BUN_VER = $BunLatest
        Write-Host "v$BUN_VER" -ForegroundColor Green
    } else {
        throw "Could not find compatible Bun version for major $BUN_MAJOR"
    }
} catch {
    # Last resort fallback if registry is completely down - but we prefer dynamic
    if (-not $BUN_VER) { 
        $BUN_VER = "1.3.5" # Safe emergency fallback
        Write-Host "Failed to resolve (Using emergency fallback v$BUN_VER)" -ForegroundColor Yellow
    }
}

# 2. Setup Runtime
$Dirs = @($BVM_DIR, $BVM_SRC_DIR, $BVM_RUNTIME_DIR, $BVM_BIN_DIR, $BVM_SHIMS_DIR, $BVM_ALIAS_DIR)
foreach ($d in $Dirs) { if (-not (Test-Path $d)) { New-Item -ItemType Directory -Force -Path $d | Out-Null } }

$TARGET_DIR = "$BVM_RUNTIME_DIR\v$BUN_VER"

if (-not (Test-Path "$TARGET_DIR\bin\bun.exe")) {
    Write-Host "Downloading Bun v$BUN_VER from NPM ($REGISTRY)..."
    
    # Always use NPM tgz
    $URL = "https://$REGISTRY/@oven/bun-windows-x64/-/bun-windows-x64-$BUN_VER.tgz"
    $TMP = "$BVM_DIR\bun-runtime.tgz"
    $EXT_DIR = "$BVM_DIR\temp_extract"
    if (Test-Path $EXT_DIR) { Remove-Item $EXT_DIR -Recurse -Force -ErrorAction SilentlyContinue }
    New-Item -ItemType Directory -Path $EXT_DIR -Force | Out-Null

    try {
        if (Get-Command curl.exe -ErrorAction SilentlyContinue) {
            & curl.exe "-#SfLo" "$TMP" "$URL"
        } else {
            Invoke-RestMethod -Uri $URL -OutFile $TMP
        }
    } catch {
        Write-Error "Download failed: $_"
        exit 1
    }
    
    # Extract
    if (Get-Command tar.exe -ErrorAction SilentlyContinue) {
        Write-Host "Extracting (using tar.exe)..."
        try {
            & tar -xf "$TMP" -C "$EXT_DIR"
            if ($LASTEXITCODE -ne 0) { throw "tar failed" }
        } catch {
            Write-Warning "tar failed, falling back to PowerShell polyfill..."
            Expand-Tgz -Source "$TMP" -Destination "$EXT_DIR"
        }
    } else {
        Expand-Tgz -Source "$TMP" -Destination "$EXT_DIR"
    }

    # Locate and Move
    # NPM package structure is usually 'package/bin/bun.exe' or 'package/bun.exe'
    $FoundBun = Get-ChildItem -Path $EXT_DIR -Filter "bun.exe" -Recurse | Select-Object -First 1
    if (-not $FoundBun) {
        Write-Error "Extraction failed: bun.exe not found."
        exit 1
    }

    if (Test-Path $TARGET_DIR) { Remove-Item $TARGET_DIR -Recurse -Force -ErrorAction SilentlyContinue }
    New-Item -ItemType Directory -Path "$TARGET_DIR\bin" -Force | Out-Null
    
    Move-Item -Path $FoundBun.FullName -Destination "$TARGET_DIR\bin\bun.exe" -Force
    
    # Clean
    Remove-Item $TMP -Force -ErrorAction SilentlyContinue
    Remove-Item $EXT_DIR -Recurse -Force -ErrorAction SilentlyContinue
}

# 3. Download BVM Source
$LOCAL_DIST = "$PSScriptRoot\dist\index.js"
if (Test-Path $LOCAL_DIST) {
    Copy-Item $LOCAL_DIST "$BVM_SRC_DIR\index.js" -Force
} else {
    Write-Host "Downloading BVM Source..."
    $SRC_URL = "https://cdn.jsdelivr.net/gh/EricLLLLLL/bvm@$BVM_VER/dist/index.js"
    try {
        if (Get-Command curl.exe -ErrorAction SilentlyContinue) {
            & curl.exe "-#SfLo" "$BVM_SRC_DIR\index.js" "$SRC_URL"
        } else {
            Invoke-RestMethod -Uri $SRC_URL -OutFile "$BVM_SRC_DIR\index.js"
        }
    } catch {
        Write-Error "Failed to download BVM source."
        exit 1
    }
}

# 4. Configure Shell & Wrapper
Write-Host -NoNewline "Configuring... "
$Wrapper = "@echo off`r`nset `"BVM_DIR=%USERPROFILE%\.bvm`"`r`n`"%BVM_DIR%\runtime\current\bin\bun.exe`" `"%BVM_DIR%\src\index.js`" %*"
Set-Content -Path "$BVM_BIN_DIR\bvm.cmd" -Value $Wrapper -Encoding Ascii

# Update PATH
$Path = [Environment]::GetEnvironmentVariable("Path", "User")
$New = @("$BVM_SHIMS_DIR", "$BVM_BIN_DIR")
$Changed = $false
foreach ($p in $New) { 
    if ($Path -notlike "*$p*") { 
        $Path = "$p;$Path"
        $Changed = $true
    } 
}
if ($Changed) {
    [Environment]::SetEnvironmentVariable("Path", $Path, "User")
}

# Session Environment
$env:Path = "$BVM_SHIMS_DIR;$BVM_BIN_DIR;$env:Path"
$env:BVM_DIR = $BVM_DIR

# 5. Link Current & Default
$CURRENT_LINK = "$BVM_RUNTIME_DIR\current"
if (Test-Path $CURRENT_LINK) { Remove-Item $CURRENT_LINK -Force -Recurse -ErrorAction SilentlyContinue }
New-Item -ItemType Junction -Path $CURRENT_LINK -Target "$BVM_RUNTIME_DIR\v$BUN_VER" | Out-Null

$DEFAULT_ALIAS = "$BVM_ALIAS_DIR\default"
if (-not (Test-Path $DEFAULT_ALIAS)) {
    # Bootstrap versions folder for 'bvm use'
    $VERSION_DIR = "$BVM_DIR\versions\v$BUN_VER"
    if (-not (Test-Path $VERSION_DIR)) {
        New-Item -ItemType Directory -Path (Split-Path $VERSION_DIR) -Force | Out-Null
        Copy-Item -Path "$BVM_RUNTIME_DIR\v$BUN_VER" -Destination $VERSION_DIR -Recurse -Force
    }
    Set-Content -Path $DEFAULT_ALIAS -Value "v$BUN_VER" -Encoding Ascii
}

# 6. Rehash
Write-Host "Initializing..."
try {
    if (Test-Path "$BVM_SHIMS_DIR\*.ps1") { Remove-Item "$BVM_SHIMS_DIR\*.ps1" -Force }
    & "$BVM_RUNTIME_DIR\current\bin\bun.exe" "$BVM_SRC_DIR\index.js" setup --silent
    & "$BVM_RUNTIME_DIR\current\bin\bun.exe" "$BVM_SRC_DIR\index.js" rehash
} catch {
    Write-Warning "Shim generation failed. You may need to run 'bvm rehash' manually."
}

# Execution Policy Check
try {
    $Policy = Get-ExecutionPolicy -Scope CurrentUser
    if ($Policy -eq "Undefined" -or $Policy -eq "Restricted") {
        Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
    }
} catch {}

Write-Host "`n`e[1;32m[OK] BVM $BVM_VER installed!`e[0m"
Write-Host "Please restart your terminal."
