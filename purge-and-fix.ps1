# BVM Environment Purger (Clean Slate Only)
# Use this to remove all BVM-related paths from Registry and Session.

Write-Host "🧹 Purging BVM Environment Variables..." -ForegroundColor Yellow

# 1. Clean User Registry
$oldPath = [Environment]::GetEnvironmentVariable("Path", "User")
$cleanPath = ($oldPath -split ";" | Where-Object { $_ -notlike "*\.bvm*" -and $_ -ne "" }) -join ";"
[Environment]::SetEnvironmentVariable("Path", $cleanPath, "User")
[Environment]::SetEnvironmentVariable("BVM_DIR", $null, "User")

Write-Host "✅ User Registry Cleaned (All .bvm entries removed)." -ForegroundColor Green

# 2. Clean Current Session
$env:PATH = ($env:PATH -split ";" | Where-Object { $_ -notlike "*\.bvm*" }) -join ";"
Remove-Item env:BVM_DIR -ErrorAction SilentlyContinue

Write-Host "✅ Current Session Cleaned." -ForegroundColor Green
Write-Host "Now you can run a fresh 'npm install -g bvm-core' to re-initialize." -ForegroundColor Cyan