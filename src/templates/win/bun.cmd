@echo off
set "BVM_DIR=__BVM_DIR__"
:: Always delegate to JS shim to guarantee version isolation:
:: - Correct per-version BUN_INSTALL / bunfig.toml injection
:: - Consistent behavior with/without .bvmrc
if exist "%BVM_DIR%\runtime\current\bin\bun.exe" (
    "%BVM_DIR%\runtime\current\bin\bun.exe" "%BVM_DIR%\bin\bvm-shim.js" "bun" %*
    exit /b %errorlevel%
) else (
    echo BVM Error: Bun runtime not found at "%BVM_DIR%\runtime\current\bin\bun.exe"
    exit /b 1
)
