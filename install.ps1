# BVM Installer for Windows (PowerShell)
$ErrorActionPreference = "Stop"

# --- Architecture Check ---
if ($env:PROCESSOR_ARCHITECTURE -ne "AMD64" -and $env:PROCESSOR_ARCHITEW6432 -ne "AMD64") {
    Write-Error "BVM requires a 64-bit version of Windows and PowerShell."
    Write-Host "Current Architecture: $env:PROCESSOR_ARCHITECTURE"
    exit 1
}

# Configuration
$BVM_DIR = "$HOME\.bvm"
$BVM_SRC_DIR = "$BVM_DIR\src"
$BVM_RUNTIME_DIR = "$BVM_DIR\runtime"
$BVM_BIN_DIR = "$BVM_DIR\bin"
$BVM_SHIMS_DIR = "$BVM_DIR\shims"
$BVM_ALIAS_DIR = "$BVM_DIR\aliases"

# UI Helper
function Show-Bar($p) {
    $w = 40
    $f = [Math]::Floor($p * $w / 100)
    if ($f -lt 0) { $f = 0 }
    if ($f -gt $w) { $f = $w }
    $e = $w - $f
    $filled = "█" * $f
    $empty = "░" * $e
    Write-Host -NoNewline "`r `e[1;36m$filled`e[0;90m$empty`e[0m $([Math]::Floor($p))%"
}

# 1. Resolve
$BUN_VER = "1.3.5"
$BVM_VER = "v1.0.0"

# 2. Setup Runtime
$Dirs = @($BVM_DIR, $BVM_SRC_DIR, $BVM_RUNTIME_DIR, $BVM_BIN_DIR, $BVM_SHIMS_DIR, $BVM_ALIAS_DIR)
foreach ($d in $Dirs) { if (-not (Test-Path $d)) { New-Item -ItemType Directory -Force -Path $d | Out-Null } }

$TARGET_DIR = "$BVM_RUNTIME_DIR\v$BUN_VER"
# Check both path variants to be safe
if (-not (Test-Path "$TARGET_DIR\bin\bun.exe")) {
    Write-Host "Downloading BVM Runtime (bun@$BUN_VER)"
    $URL = "https://registry.npmjs.org/@oven/bun-windows-x64/-/bun-windows-x64-$BUN_VER.tgz"
    $TMP = "$BVM_DIR\bun-runtime.tgz"
    
    $wc = New-Object System.Net.WebClient
    $event = Register-ObjectEvent -InputObject $wc -EventName DownloadProgressChanged -Action {
        Show-Bar $EventArgs.ProgressPercentage
    }
    
    try {
        Show-Bar 0
        $wc.DownloadFileAsync($URL, $TMP)
        while ($wc.IsBusy) { Start-Sleep -Milliseconds 100 }
    } finally {
        $wc.Dispose()
        Unregister-Event -SourceIdentifier $event.Name
    }
    Write-Host "`n"
    
    $EXT = "$BVM_DIR\temp_extract"
    if (Test-Path $EXT) { Remove-Item $EXT -Recurse -Force }
    New-Item -ItemType Directory -Path $EXT | Out-Null
    
    # Use internal tar if available, otherwise check for 7z or error? 
    # Windows 10 build 17063+ has tar.
    try {
        tar -xzf $TMP -C $EXT
    } catch {
        Write-Error "Failed to extract archive. Please ensure 'tar' is available or use Windows 10+."
        exit 1
    }
    
    New-Item -ItemType Directory -Path "$TARGET_DIR\bin" -Force | Out-Null
    $exe = Get-ChildItem -Path $EXT -Recurse -Filter "bun.exe" | Select-Object -First 1
    if ($null -eq $exe) {
        Write-Error "Could not find bun.exe in the downloaded archive."
        exit 1
    }
    Move-Item $exe.FullName -Destination "$TARGET_DIR\bin\bun.exe" -Force
    
    $cur = "$BVM_RUNTIME_DIR\current"
    if (Test-Path $cur) { Remove-Item $cur -Force }
    # Junction is safer than Symlink on Windows (no admin required usually)
    New-Item -ItemType Junction -Path $cur -Target $TARGET_DIR | Out-Null
    
    Remove-Item $TMP -Force
    if (Test-Path $EXT) { Remove-Item $EXT -Recurse -Force }
}

# 3. Download Source
Write-Host "Downloading BVM: $BVM_VER"
$SRC_URL = "https://cdn.jsdelivr.net/gh/EricLLLLLL/bvm@$BVM_VER/dist/index.js"
Show-Bar 0
try {
    (New-Object System.Net.WebClient).DownloadFile($SRC_URL, "$BVM_SRC_DIR\index.js")
} catch {
    Write-Error "Failed to download BVM source. Please check your internet connection."
    exit 1
}
Show-Bar 100
Write-Host "`n"

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
    $VERSION_BIN = "$VERSION_DIR\bin"
    New-Item -ItemType Directory -Path $VERSION_BIN -Force | Out-Null
    
    # Check if bun.exe exists in runtime
    $RUNTIME_BUN = "$BVM_RUNTIME_DIR\current\bin\bun.exe"
    if (Test-Path $RUNTIME_BUN) {
        # Create a hardlink or copy for the initial version to save space/time
        # Or just copy since it's safer across devices
        Copy-Item $RUNTIME_BUN -Destination "$VERSION_BIN\bun.exe" -Force
    }
    
    Set-Content -Path $DEFAULT_ALIAS -Value "v$BUN_VER" -Encoding Ascii
}

# Run Setup and Rehash
# We use Invoke-Expression or direct call
try {
    & "$BVM_RUNTIME_DIR\current\bin\bun.exe" "$BVM_SRC_DIR\index.js" setup --silent
    & "$BVM_RUNTIME_DIR\current\bin\bun.exe" "$BVM_SRC_DIR\index.js" rehash --silent
} catch {
    Write-Warning "Setup/Rehash step failed. You might need to run 'bvm setup' manually."
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