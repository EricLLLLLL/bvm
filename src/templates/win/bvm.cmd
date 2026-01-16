@echo off
set "BVM_DIR=%USERPROFILE%\.bvm"
"%BVM_DIR%\runtime\current\bin\bun.exe" "%BVM_DIR%\src\index.js" %*
