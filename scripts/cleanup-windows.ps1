<#
Cleanup bvm environment on Windows (PowerShell / pwsh).

Default:
  - Remove the bvm init block from PowerShell profiles (marker block)
  - Remove bvm shims/bin/current\bin from User PATH
  - Clear User-level BVM_DIR env var

Optional:
  -PurgeBvmDir: delete BvmDir (default: %USERPROFILE%\.bvm)
  -PurgeBun: delete %USERPROFILE%\.bun (global packages + cache)

Recommended run:
  pwsh -ExecutionPolicy Bypass -File .\scripts\cleanup-windows.ps1
#>

param(
  [string] $BvmDir = $(if ($env:BVM_DIR) { $env:BVM_DIR } else { Join-Path $HOME ".bvm" }),
  [switch] $PurgeBvmDir,
  [switch] $PurgeBun,
  [switch] $Yes,
  [switch] $DryRun
)

$StartMarker = '# >>> bvm initialize >>>'
$EndMarker = '# <<< bvm initialize <<<'

function Confirm-OrExit([string] $operation) {
  if ($Yes) { return }
  Write-Host ""
  Write-Host "DANGEROUS OPERATION DETECTED!" -ForegroundColor Yellow
  Write-Host ("Operation: {0}" -f $operation)
  Write-Host "Impact: may modify PowerShell profiles / user env vars / delete directories"
  Write-Host "Risk: bvm/bun may stop working until reinstalled"
  Write-Host ""
  $answer = Read-Host 'Type "1" to continue'
  if ($answer -ne "1") { throw "Cancelled by user" }
}

function Backup-File([string] $path) {
  $ts = Get-Date -Format "yyyyMMdd-HHmmss"
  $bak = "$path.bak-$ts"
  if ($DryRun) {
    Write-Host "[dry-run] backup: $path -> $bak"
    return
  }
  Copy-Item -LiteralPath $path -Destination $bak -Force
  Write-Host "Backup created: $path -> $bak"
}

function Remove-BvmBlockFromProfile([string] $path) {
  if (-not $path) { return }
  if (-not (Test-Path -LiteralPath $path)) { return }
  $content = Get-Content -LiteralPath $path -Raw -ErrorAction SilentlyContinue
  if (-not $content) { return }
  if ($content -notmatch [regex]::Escape($StartMarker)) { return }

  Backup-File $path

  if ($DryRun) {
    Write-Host "[dry-run] will remove bvm init block from profile: $path"
    return
  }

  $escapedStart = [regex]::Escape($StartMarker)
  $escapedEnd = [regex]::Escape($EndMarker)
  $pattern = "(?s)\r?\n?$escapedStart.*?$escapedEnd\r?\n?"
  $newContent = [regex]::Replace($content, $pattern, "`r`n").Trim() + "`r`n"
  Set-Content -LiteralPath $path -Value $newContent -Encoding UTF8
}

function Normalize-PathKey([string] $p) {
  if (-not $p) { return "" }
  return $p.Trim().TrimEnd('\','/').ToLowerInvariant()
}

function Clean-UserPath([string] $bvmDir) {
  $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
  if (-not $userPath) { return }

  $entries = $userPath -split ";" | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne "" }
  $targets = @(
    (Join-Path $bvmDir "shims"),
    (Join-Path $bvmDir "bin"),
    (Join-Path (Join-Path $bvmDir "current") "bin")
  )
  $targetKeys = $targets | ForEach-Object { Normalize-PathKey $_ }

  $filtered = New-Object System.Collections.Generic.List[string]
  foreach ($e in $entries) {
    $k = Normalize-PathKey $e
    if ($targetKeys -contains $k) { continue }
    $filtered.Add($e.TrimEnd('\','/'))
  }

  $newPath = ($filtered | Select-Object -Unique) -join ";"
  if ($DryRun) {
    Write-Host "[dry-run] will update User PATH (remove bvm shims/bin/current\\bin)"
    return
  }
  [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
}

Confirm-OrExit "Cleanup Windows PowerShell environment (Profile + User PATH/BVM_DIR)"

Write-Host ("BVM_DIR: {0}" -f $BvmDir)

# 1) Remove profile blocks
Remove-BvmBlockFromProfile $PROFILE.CurrentUserAllHosts
Remove-BvmBlockFromProfile $PROFILE.CurrentUserCurrentHost

# 2) Clean user env vars
if ($DryRun) {
  Write-Host "[dry-run] will clear User env var: BVM_DIR"
} else {
  [Environment]::SetEnvironmentVariable("BVM_DIR", $null, "User")
}
Clean-UserPath $BvmDir

# 3) Optional deletions
if ($PurgeBun) {
  $bunDir = Join-Path $HOME ".bun"
  Confirm-OrExit ("删除 {0}" -f $bunDir)
  if ($DryRun) { Write-Host "[dry-run] Remove-Item -Recurse -Force $bunDir" }
  else { Remove-Item -LiteralPath $bunDir -Recurse -Force -ErrorAction SilentlyContinue }
}

if ($PurgeBvmDir) {
  Confirm-OrExit ("删除 {0}" -f $BvmDir)
  if ($DryRun) { Write-Host "[dry-run] Remove-Item -Recurse -Force $BvmDir" }
  else { Remove-Item -LiteralPath $BvmDir -Recurse -Force -ErrorAction SilentlyContinue }
}

Write-Host ""
Write-Host "Done." -ForegroundColor Green
Write-Host "Tip: restart your terminal/IDE for User PATH to take effect."
