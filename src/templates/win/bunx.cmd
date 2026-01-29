@echo off
set "BVM_DIR=__BVM_DIR__"
set "BUN_INSTALL=%BVM_DIR%\current"

:: If BVM_INSTALL_RUNNING is set, skip shim
if "%BVM_INSTALL_RUNNING%"=="1" goto fastpath

:: For bunx, if there's no .bvmrc, we usually go fast
if exist ".bvmrc" goto slowpath

:fastpath
if exist "%BVM_DIR%\current\bin\bunx.exe" (
    "%BVM_DIR%\current\bin\bunx.exe" %*
) else (
    if exist "%BVM_DIR%\current\bin\bun.exe" (
        "%BVM_DIR%\current\bin\bun.exe" x %*
    ) else (
        goto slowpath
    )
)
exit /b %errorlevel%

:slowpath
:: Hand over to JS shim for version resolution
if exist "%BVM_DIR%\runtime\current\bin\bun.exe" (
    "%BVM_DIR%\runtime\current\bin\bun.exe" "%BVM_DIR%\bin\bvm-shim.js" "bunx" %*
) else (
    echo BVM Error: Bun runtime not found at "%BVM_DIR%\runtime\current\bin\bun.exe"
    exit /b 1
)