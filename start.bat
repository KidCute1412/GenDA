@echo off
setlocal
cd /d "%~dp0"

where.exe wt.exe >nul 2>nul
if errorlevel 1 (
  echo Windows Terminal ^(wt.exe^) is required to run both apps in split panes.
  echo Start them manually with:
  echo   call scripts\start-fe.bat
  echo   call scripts\start-be.bat
  exit /b 1
)

wt.exe -w 0 new-tab --title "GenDA FE" --startingDirectory "%~dp0apps\web" cmd.exe /k "call \"%~dp0scripts\start-fe.bat\"" ^; split-pane --horizontal --title "GenDA BE" --startingDirectory "%~dp0apps\api" cmd.exe /k "call \"%~dp0scripts\start-be.bat\""
endlocal
