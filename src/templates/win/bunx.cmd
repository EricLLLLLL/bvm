@echo off
set "BVM_DIR=__BVM_DIR__"
set "BUN_INSTALL=%BVM_DIR%\current"

:: On Windows, bunx is always 'bun x'
if not exist ".bvmrc" (
    "%BVM_DIR%\current\bin\bun.exe" x %*
    exit /b %errorlevel%
)

"%BVM_DIR%\runtime\current\bin\bun.exe" "%BVM_DIR%\bin\bvm-shim.js" "bunx" %*