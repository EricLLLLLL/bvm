
# BVM Force Environment Fixer
# This script bypasses standard install logic to hard-reset your BVM environment.

$BVM_DIR = if ($env:BVM_DIR) { $env:BVM_DIR } else { "$HOME\.bvm" }
$BVM_SHIMS = "$BVM_DIR\shims"
$BVM_BIN = "$BVM_DIR\bin"
$BVM_CURRENT_BIN = "$BVM_DIR\current\bin"

Write-Host "🛡️ Hard-resetting BVM Registry entries..." -ForegroundColor Cyan

# 1. Clean and Prepend User PATH
$oldPath = [Environment]::GetEnvironmentVariable("Path", "User")
# Filter out ALL existing BVM entries to prevent duplicates and fragmentation
$cleanPathList = $oldPath -split ";" | Where-Object { $_ -notlike "*\.bvm*" -and $_ -ne "" }
# Prepend the three holy pillars of BVM execution
$newPath = "$BVM_CURRENT_BIN;$BVM_SHIMS;$BVM_BIN;" + ($cleanPathList -join ";")

[Environment]::SetEnvironmentVariable("Path", $newPath, "User")
[Environment]::SetEnvironmentVariable("BVM_DIR", $BVM_DIR, "User")

Write-Host "✅ User Registry Updated." -ForegroundColor Green
Write-Host "Current Path Header: $BVM_CURRENT_BIN" -ForegroundColor Gray

# 2. Trigger a physical rehash to ensure shims are healthy
if (Test-Path "$BVM_BIN\bvm.cmd") {
    Write-Host "🔄 Running rehash..." -ForegroundColor Gray
    & "$BVM_BIN\bvm.cmd" rehash --silent
}

Write-Host "`n🚀 DONE! Please CLOSE THIS WINDOW and open a NEW PowerShell window." -ForegroundColor Green
Write-Host "Then run: bun --version" -ForegroundColor Cyan
