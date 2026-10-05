@echo off
setlocal
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\compose-watch.ps1" -Stop
if errorlevel 1 goto :failed
docker compose stop
if errorlevel 1 goto :failed
echo [INFO] Watcher and services stopped. Database volume is preserved.
exit /b 0
:failed
pause
exit /b 1
