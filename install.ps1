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
function Draw-Bar($p, $label) {
    $width = 20
    $filled = [Math]::Floor($p * $width / 100)
    $empty = $width - $filled
    
    $filled_str = "█" * $filled
    $empty_str = "░" * $empty
    
    # ANSI Colors: Cyan (36), Gray (90)
    Write-Host -NoNewline "`r `e[1;36m$filled_str`e[0;90m$empty_str`e[0m $(($p).ToString("0"))% | $label"
}

# 1. Platform & Version
Draw-Bar 5 "正在解析架构..."
$ARCH = if ($env:PROCESSOR_ARCHITEW6432 -eq "AMD64" -or $env:PROCESSOR_ARCHITECTURE -eq "AMD64") { "x64" } else { "x64" }
$REQUIRED_BUN_VERSION = "1.3.5"
$DefaultBvmVersion = "v1.0.6"

# 2. Directories
Draw-Bar 15 "正在准备目录..."
$Dirs = @($BVM_DIR, $BVM_SRC_DIR, $BVM_RUNTIME_DIR, $BVM_BIN_DIR, $BVM_SHIMS_DIR, $BVM_ALIAS_DIR)
foreach ($d in $Dirs) { if (-not (Test-Path $d)) { New-Item -ItemType Directory -Force -Path $d | Out-Null } }

# 3. Runtime
$TARGET_RUNTIME_DIR = "$BVM_RUNTIME_DIR\v$REQUIRED_BUN_VERSION"
if (-not (Test-Path "$TARGET_RUNTIME_DIR\bin\bun.exe")) {
    Draw-Bar 30 "正在下载 Runtime..."
    $URL = "https://registry.npmjs.org/@oven/bun-windows-x64/-/bun-windows-x64-$REQUIRED_BUN_VERSION.tgz"
    $TEMP_TGZ = "$BVM_DIR\bun-runtime.tgz"
    
    (New-Object System.Net.WebClient).DownloadFile($URL, $TEMP_TGZ)
    
    Draw-Bar 50 "正在解压..."
    $ExtractDir = "$BVM_DIR\temp_extract"
    if (Test-Path $ExtractDir) { Remove-Item $ExtractDir -Recurse -Force }
    New-Item -ItemType Directory -Path $ExtractDir | Out-Null
    tar -xzf $TEMP_TGZ -C $ExtractDir
    
    New-Item -ItemType Directory -Path "$TARGET_RUNTIME_DIR\bin" -Force | Out-Null
    $bun = Get-ChildItem -Path $ExtractDir -Recurse -Filter "bun.exe" | Select-Object -First 1
    Move-Item $bun.FullName -Destination "$TARGET_RUNTIME_DIR\bin\bun.exe" -Force
    
    $RuntimeCurrent = "$BVM_RUNTIME_DIR\current"
    if (Test-Path $RuntimeCurrent) { Remove-Item $RuntimeCurrent -Force }
    New-Item -ItemType Junction -Path $RuntimeCurrent -Target $TARGET_RUNTIME_DIR | Out-Null
    
    Remove-Item $TEMP_TGZ -Force
    Remove-Item $ExtractDir -Recurse -Force
}

# 4. Source
Draw-Bar 75 "正在下载 BVM 核心..."
$SOURCE_URL = "https://cdn.jsdelivr.net/gh/EricLLLLLL/bvm@$DefaultBvmVersion/dist/index.js"
(New-Object System.Net.WebClient).DownloadFile($SOURCE_URL, "$BVM_SRC_DIR\index.js")

# 5. Finalize
Draw-Bar 90 "正在配置环境..."
$WrapperContent = "@echo off`r`nset `"BVM_DIR=%USERPROFILE%\.bvm`"`r`n`"%BVM_DIR%\runtime\current\bin\bun.exe`" `"%BVM_DIR%\src\index.js`" %*"
Set-Content -Path "$BVM_BIN_DIR\bvm.cmd" -Value $WrapperContent -Encoding Ascii

# Environment Variables
$UserPath = [Environment]::GetEnvironmentVariable("Path", "User")
$NewPaths = @("$BVM_SHIMS_DIR", "$BVM_BIN_DIR")
foreach ($p in $NewPaths) { if ($UserPath -notlike "*$p*") { $UserPath = "$p;$UserPath" } }
[Environment]::SetEnvironmentVariable("Path", $UserPath, "User")

& "$BVM_RUNTIME_DIR\current\bin\bun.exe" "$BVM_SRC_DIR\index.js" setup --silent
& "$BVM_RUNTIME_DIR\current\bin\bun.exe" "$BVM_SRC_DIR\index.js" rehash --silent

Draw-Bar 100 "安装完成！"
Write-Host "`n"
Write-Host "🚀 BVM v$DefaultBvmVersion 安装成功！" -ForegroundColor Cyan
Write-Host "请重启终端，然后运行 'bvm --help' 开始使用。"