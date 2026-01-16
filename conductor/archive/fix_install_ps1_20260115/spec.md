# Specification: Fix install.ps1 Compatibility

## Overview
Users on Windows PowerShell 5.1 cannot install BVM because the `$IsWindows` variable is undefined, leading the script to execute the Linux/macOS logic (creating symbolic links) which requires Administrator privileges.

## Functional Requirements
- **Robust OS Detection:** Replace `$IsWindows` with a method that works in both PowerShell 5.1 and Core (e.g., `[Environment]::OSVersion.Platform` or `$PSVersionTable`).
- **User-Level Linking:** Ensure Directory Junctions are used on Windows to avoid "Administrator privilege required" errors.

## Acceptance Criteria
- `install.ps1` runs successfully in Windows PowerShell 5.1 without admin rights.
- `install.ps1` remains functional in PowerShell Core.
