@echo off
setlocal
cd /d "%~dp0"

where.exe node.exe >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js is not found in PATH!
  echo Please install Node.js ^(v20+^) to run GenDA.
  pause
  exit /b 1
)

echo [1/2] Checking and syncing dependencies...
call npx.cmd --yes pnpm@10.15.0 install
if errorlevel 1 (
  echo [ERROR] Dependency installation failed!
  pause
  exit /b 1
)

echo [2/2] Starting Frontend and Backend...
where.exe wt.exe >nul 2>nul
if errorlevel 1 (
  echo [INFO] Windows Terminal ^(wt.exe^) not found. Opening in separate windows...
  start "GenDA FE" cmd.exe /k "call \"%~dp0scripts\start-fe.bat\""
  start "GenDA BE" cmd.exe /k "call \"%~dp0scripts\start-be.bat\""
  exit /b 0
)

wt.exe -w 0 new-tab --title "GenDA FE" --startingDirectory "%~dp0apps\web" cmd.exe /k "call \"%~dp0scripts\start-fe.bat\"" ^; split-pane --horizontal --title "GenDA BE" --startingDirectory "%~dp0apps\api" cmd.exe /k "call \"%~dp0scripts\start-be.bat\""
endlocal
