@echo off
set "BVM_DIR=__BVM_DIR__"
set "BUN_INSTALL=%BVM_DIR%\current"

:: Intercept install-like commands to trigger auto-rehash
set "NEED_REHASH=0"
if "%1"=="install" set "NEED_REHASH=1"
if "%1"=="i" set "NEED_REHASH=1"
if "%1"=="add" set "NEED_REHASH=1"
if "%1"=="a" set "NEED_REHASH=1"
if "%1"=="remove" set "NEED_REHASH=1"
if "%1"=="rm" set "NEED_REHASH=1"
if "%1"=="upgrade" set "NEED_REHASH=1"
if "%1"=="link" set "NEED_REHASH=1"
if "%1"=="unlink" set "NEED_REHASH=1"

:: If .bvmrc exists, we delegate to the JS shim for complex version resolution
if exist ".bvmrc" goto slowpath

:fastpath
if exist "%BVM_DIR%\current\bin\bun.exe" (
    "%BVM_DIR%\current\bin\bun.exe" %*
    set "EXIT_CODE=%errorlevel%"
    goto check_rehash
)

:slowpath
:: Hand over to JS shim for version resolution
if exist "%BVM_DIR%\runtime\current\bin\bun.exe" (
    "%BVM_DIR%\runtime\current\bin\bun.exe" "%BVM_DIR%\bin\bvm-shim.js" "bun" %*
    set "EXIT_CODE=%errorlevel%"
    :: The JS shim already has rehash logic (if we kept it), but doing it here is safer for the fastpath.
    goto check_rehash
) else (
    echo BVM Error: Bun runtime not found at "%BVM_DIR%\runtime\current\bin\bun.exe"
    exit /b 1
)

:check_rehash
if "%EXIT_CODE%"=="0" (
    if "%NEED_REHASH%"=="1" (
        if exist "%BVM_DIR%\bin\bvm.cmd" (
             :: Run rehash silently
             call "%BVM_DIR%\bin\bvm.cmd" rehash --silent >nul 2>&1
        )
    )
)
exit /b %EXIT_CODE%
