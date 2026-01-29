@echo off
set "BVM_DIR=%USERPROFILE%\.bvm"
set "BUN_INSTALL=%BVM_DIR%\current"

:: If BVM_INSTALL_RUNNING is set, skip shim
if "%BVM_INSTALL_RUNNING%"=="1" goto fastpath

:: For bunx, if there's no .bvmrc, we usually go fast, but if it fails it might need a rehash.
if exist ".bvmrc" goto slowpath

:fastpath
if exist "%BVM_DIR%\current\bin\bunx.exe" (
    "%BVM_DIR%\current\bin\bunx.exe" %*
) else (
    "%BVM_DIR%\current\bin\bun.exe" x %*
)
exit /b %errorlevel%

:slowpath
:: Hand over to JS shim for version resolution
"%BVM_DIR%\runtime\current\bin\bun.exe" "%BVM_DIR%\bin\bvm-shim.js" "bunx" %*