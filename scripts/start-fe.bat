@echo off
cd /d "%~dp0.."
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0service-logs.ps1" -Service frontend
if errorlevel 1 pause
