# BVM Installer for Windows (PowerShell)
$ErrorActionPreference = "Stop"

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
$BVM_VER = "v1.0.6"

# 2. Setup Runtime
$Dirs = @($BVM_DIR, $BVM_SRC_DIR, $BVM_RUNTIME_DIR, $BVM_BIN_DIR, $BVM_SHIMS_DIR, $BVM_ALIAS_DIR)
foreach ($d in $Dirs) { if (-not (Test-Path $d)) { New-Item -ItemType Directory -Force -Path $d | Out-Null } }

$TARGET_DIR = "$BVM_RUNTIME_DIR\v$BUN_VER"
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
    tar -xzf $TMP -C $EXT
    
    New-Item -ItemType Directory -Path "$TARGET_DIR\bin" -Force | Out-Null
    $exe = Get-ChildItem -Path $EXT -Recurse -Filter "bun.exe" | Select-Object -First 1
    Move-Item $exe.FullName -Destination "$TARGET_DIR\bin\bun.exe" -Force
    
    $cur = "$BVM_RUNTIME_DIR\current"
    if (Test-Path $cur) { Remove-Item $cur -Force }
    New-Item -ItemType Junction -Path $cur -Target $TARGET_DIR | Out-Null
    Remove-Item $TMP -Force; Remove-Item $EXT -Recurse -Force
}

# 3. Download Source
Write-Host "Downloading BVM: $BVM_VER"
$SRC_URL = "https://cdn.jsdelivr.net/gh/EricLLLLLL/bvm@$BVM_VER/dist/index.js"
Show-Bar 0
(New-Object System.Net.WebClient).DownloadFile($SRC_URL, "$BVM_SRC_DIR\index.js")
Show-Bar 100
Write-Host "`n"

# 4. Finalize
Write-Host -NoNewline "Configuring shell... "
$Wrapper = "@echo off`r`nset `"BVM_DIR=%USERPROFILE%\.bvm`"`r`n`"%BVM_DIR%\runtime\current\bin\bun.exe`" `"%BVM_DIR%\src\index.js`" %*"
Set-Content -Path "$BVM_BIN_DIR\bvm.cmd" -Value $Wrapper -Encoding Ascii

$Path = [Environment]::GetEnvironmentVariable("Path", "User")
$New = @("$BVM_SHIMS_DIR", "$BVM_BIN_DIR")
foreach ($p in $New) { if ($Path -notlike "*$p*") { $Path = "$p;$Path" } }
[Environment]::SetEnvironmentVariable("Path", $Path, "User")

& "$BVM_RUNTIME_DIR\current\bin\bun.exe" "$BVM_SRC_DIR\index.js" setup --silent
& "$BVM_RUNTIME_DIR\current\bin\bun.exe" "$BVM_SRC_DIR\index.js" rehash --silent
Write-Host "Done."

Write-Host "`n`e[1;32m🎉 BVM $BVM_VER installed successfully!`e[0m"
Write-Host "`nNext steps:"
Write-Host "  1. Restart your terminal."
Write-Host "  2. Run 'bvm --help' to get started."