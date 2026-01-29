@echo off
set "BVM_DIR=%USERPROFILE%\.bvm"
set "BUN_INSTALL=%BVM_DIR%\current"

:: Fast-path: If no .bvmrc in current directory, run default directly
if not exist ".bvmrc" (
    if exist "%BVM_DIR%\current\bin\bunx.exe" (
        "%BVM_DIR%\current\bin\bunx.exe" %*
    ) else (
        "%BVM_DIR%\current\bin\bun.exe" x %*
    )
    exit /b %errorlevel%
)

:: Slow-path: Hand over to JS shim for version resolution
"%BVM_DIR%\runtime\current\bin\bun.exe" "%BVM_DIR%\bin\bvm-shim.js" "bunx" %*