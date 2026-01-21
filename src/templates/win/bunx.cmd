@echo off
set "BVM_DIR=%USERPROFILE%\.bvm"
set "BUN_INSTALL=%BVM_DIR%\current"

if not exist ".bvmrc" (
    "%BVM_DIR%\runtime\current\bin\bun.exe" %*
    exit /b %errorlevel%
)

"%BVM_DIR%\runtime\current\bin\bun.exe" "%BVM_DIR%\bin\bvm-shim.js" "bunx" %*

