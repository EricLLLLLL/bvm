<# 
  bvm-init.ps1: PowerShell integration for BVM
  Goals:
  - Ensure shims/bin have priority in current session PATH
  - Provide `bvm` function wrapper so `bvm use` feels immediate (no new terminal required)
#>

if (-not $env:BVM_DIR) {
  return
}

function __bvm_normalize_path {
  $bvm = $env:BVM_DIR
  $shims = Join-Path $bvm "shims"
  $bin = Join-Path $bvm "bin"
  $currentBin = Join-Path (Join-Path $bvm "current") "bin"

  $parts = @()
  if ($env:PATH) {
    $parts = $env:PATH -split ";" | Where-Object { $_ -and $_.Trim() -ne "" }
  }

  $norm = @{}
  foreach ($p in $parts) {
    $k = $p.Trim().TrimEnd('\','/').ToLowerInvariant()
    if (-not $norm.ContainsKey($k)) { $norm[$k] = $p.Trim().TrimEnd('\','/') }
  }

  foreach ($p in @($shims, $bin, $currentBin)) {
    $k = $p.Trim().TrimEnd('\','/').ToLowerInvariant()
    if ($norm.ContainsKey($k)) { $norm.Remove($k) }
  }

  $rest = $norm.Values
  $env:PATH = (@($shims, $bin) + $rest + @($currentBin)) -join ";"
}

__bvm_normalize_path

function bvm {
  param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]] $Args
  )

  $subcmd = if ($Args.Count -ge 1) { $Args[0] } else { "" }
  $bvmCmd = Join-Path (Join-Path $env:BVM_DIR "bin") "bvm.cmd"

  if (Test-Path $bvmCmd) {
    & $bvmCmd @Args
  } else {
    Write-Error "BVM Error: bvm.cmd not found at $bvmCmd"
    return 1
  }

  $code = $LASTEXITCODE
  $global:LASTEXITCODE = $code

  switch ($subcmd) {
    "use" { __bvm_normalize_path }
    "install" { __bvm_normalize_path }
    "i" { __bvm_normalize_path }
    "uninstall" { __bvm_normalize_path }
    "rehash" { __bvm_normalize_path }
    "default" { __bvm_normalize_path }
    "alias" { __bvm_normalize_path }
    "unalias" { __bvm_normalize_path }
    "setup" { __bvm_normalize_path }
    "deactivate" { __bvm_normalize_path }
    default { }
  }

  return $code
}
