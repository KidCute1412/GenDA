@echo off
setlocal
cd /d "%~dp0"
where.exe docker.exe >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Install Docker Desktop before starting GenDA.
  goto :failed
)
where.exe wt.exe >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Install Windows Terminal to show frontend and backend in split panes.
  goto :failed
)
docker info >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Start Docker Desktop with Linux containers and try again.
  goto :failed
)
docker compose version >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Update Docker Desktop to include Docker Compose.
  goto :failed
)
powershell.exe -NoProfile -Command "$composeVersion = [version]((docker compose version --short).TrimStart('v')); if ($composeVersion -lt [version]'5.0.2') { exit 1 }"
if errorlevel 1 (
  echo [ERROR] Docker Compose 5.0.2 or newer is required for source reload. Update Docker Desktop.
  goto :failed
)
if not exist ".env" (
  copy /y ".env.example" ".env" >nul
  echo [INFO] Created local .env from .env.example.
)
if not exist "apps\api\.env" (
  if exist "apps\api\.env.example" (
    copy /y "apps\api\.env.example" "apps\api\.env" >nul
    echo [INFO] Created local apps\api\.env from apps\api\.env.example.
  )
)
docker compose config --quiet
if errorlevel 1 goto :failed
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\compose-watch.ps1" -Stop
if errorlevel 1 goto :failed
echo [INFO] Building and starting services. The first run downloads dependencies.
docker compose up --build --wait --wait-timeout 300
if errorlevel 1 (
  echo [ERROR] Services did not become healthy. Run docker compose logs.
  goto :failed
)
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\compose-watch.ps1"
if errorlevel 1 goto :failed
echo [INFO] Services ready. See docker compose ps for ports.
echo [INFO] Closing log panes leaves services running. Use stop.bat to stop them.
wt.exe -w new new-tab --title "GenDA Frontend" -d "%~dp0." cmd.exe /k scripts\start-fe.bat ; split-pane -V --title "GenDA Backend" -d "%~dp0." cmd.exe /k scripts\start-be.bat
if errorlevel 1 goto :failed
exit /b 0
:failed
pause
exit /b 1
