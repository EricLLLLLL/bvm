# BVM Installer for Windows (PowerShell)
# Usage: irm https://raw.githubusercontent.com/bvm-cli/bvm/main/install.ps1 | iex

$ErrorActionPreference = "Stop"

$Repo = "bvm-cli/bvm"
$BvmDir = "$HOME\.bvm"
$BinDir = "$BvmDir\bin"
$BvmExe = "$BinDir\bvm.exe"

Write-Host "Installing bvm (Bun Version Manager)..." -ForegroundColor Cyan

# --- 1. Get Latest Version ---
$LatestTag = $env:BVM_INSTALL_VERSION

if ([string]::IsNullOrEmpty($LatestTag)) {
    Write-Host "Fetching latest release tag..." -NoNewline
    
    try {
        # Method 1: GitHub Redirect (Avoids API Rate Limits)
        # We use a HEAD request to get the Location header
        $Request = [System.Net.WebRequest]::Create("https://github.com/$Repo/releases/latest")
        $Request.Method = "HEAD"
        $Request.AllowAutoRedirect = $false
        
        try {
            $Response = $Request.GetResponse()
        } catch [System.Net.WebException] {
            # 3xx redirects often throw WebException in .NET depending on config, 
            # but we can catch it and check the response property.
            $Response = $_.Exception.Response
        }

        if ($Response.StatusCode -eq [System.Net.HttpStatusCode]::Found -or 
            $Response.StatusCode -eq [System.Net.HttpStatusCode]::MovedPermanently) {
            
            $Location = $Response.Headers["Location"]
            if ($Location -match "/tag/(v[0-9.]+)") {
                $LatestTag = $Matches[1]
            }
        }
        
        if ($Response) { $Response.Close() }
    } catch {
        # Ignore errors here, fallback to API
    }

    if ([string]::IsNullOrEmpty($LatestTag)) {
        Write-Host " (Fallback to API)..." -NoNewline
        # Method 2: GitHub API
        try {
            $ApiUrl = "https://api.github.com/repos/$Repo/releases/latest"
            $Json = Invoke-RestMethod -Uri $ApiUrl -UseBasicParsing
            $LatestTag = $Json.tag_name
        } catch {
            Write-Host "`nError: Could not fetch latest version." -ForegroundColor Red
            exit 1
        }
    }
    
    if ([string]::IsNullOrEmpty($LatestTag)) {
        Write-Host "`nError: Could not determine latest version." -ForegroundColor Red
        exit 1
    }
    
    Write-Host " Found: $LatestTag" -ForegroundColor Green
} else {
    Write-Host " Using specified version: $LatestTag" -ForegroundColor Green
}

# --- 2. Download bvm ---
$DownloadUrl = "https://github.com/$Repo/releases/download/$LatestTag/bvm-windows-x64.exe"

if (-not (Test-Path -Path $BinDir)) {
    New-Item -ItemType Directory -Path $BinDir -Force | Out-Null
}

Write-Host "Downloading bvm from: $DownloadUrl" -ForegroundColor Gray

$TempFile = "$BinDir\bvm.tmp.exe"
try {
    Invoke-WebRequest -Uri $DownloadUrl -OutFile $TempFile
    Move-Item -Path $TempFile -Destination $BvmExe -Force
} catch {
    Write-Host "Error downloading bvm: $_" -ForegroundColor Red
    exit 1
}

Write-Host "✓ bvm installed to $BvmExe" -ForegroundColor Green

# --- 3. Configure Shell ---
Write-Host "Configuring shell via 'bvm setup'..."
try {
    & $BvmExe setup
    Write-Host "✓ Shell configured" -ForegroundColor Green
} catch {
    Write-Host "Warning: 'bvm setup' failed. You may need to configure PATH manually." -ForegroundColor Yellow
}

# --- 4. Auto-install Latest Bun ---
Write-Host "Installing latest Bun version..."
try {
    & $BvmExe install latest
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Bun (latest) installed successfully" -ForegroundColor Green
    } else {
        throw "Exit code $LASTEXITCODE"
    }
} catch {
    Write-Host "⚠ Failed to auto-install Bun. You can try running 'bvm install latest' manually later." -ForegroundColor Yellow
}

# --- 5. Final Instructions ---
Write-Host "`n🎉 bvm installation complete!`n" -ForegroundColor Green
Write-Host "To start using bvm and bun immediately, run the following command:`n"

# Check for PowerShell Profile
$ProfilePath = $PROFILE
if (-not (Test-Path $ProfilePath)) {
    # If standard profile doesn't exist, try to guess where 'bvm setup' might have created one
    # or just fallback to the general variable.
    # Usually 'bvm setup' for Windows creates Microsoft.PowerShell_profile.ps1 in Documents\WindowsPowerShell
}

if (Test-Path $ProfilePath) {
    Write-Host "    . `"$ProfilePath`"" -ForegroundColor Cyan
} else {
    Write-Host "    $env:BVM_DIR = `"$BvmDir`"; $env:PATH = `"`$env:BVM_DIR\bin;`$env:PATH`"" -ForegroundColor Cyan
}

Write-Host ""
