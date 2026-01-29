@echo off
set "BVM_DIR=%USERPROFILE%\.bvm"
set "BUN_INSTALL=%BVM_DIR%\current"

:: If it's an installation command, always use the shim for self-healing (fixing global shims)
set "USE_SHIM=0"
if "%1"=="install" set "USE_SHIM=1"
if "%1"=="i" set "USE_SHIM=1"
if "%1"=="add" set "USE_SHIM=1"
if "%1"=="a" set "USE_SHIM=1"
if "%1"=="remove" set "USE_SHIM=1"
if "%1"=="rm" set "USE_SHIM=1"
if "%1"=="upgrade" set "USE_SHIM=1"

if "%USE_SHIM%"=="1" goto slowpath
if exist ".bvmrc" goto slowpath

:fastpath
"%BVM_DIR%\current\bin\bun.exe" %*
exit /b %errorlevel%

:slowpath
:: Hand over to JS shim for version resolution and post-install fixing
"%BVM_DIR%\runtime\current\bin\bun.exe" "%BVM_DIR%\bin\bvm-shim.js" "bun" %*