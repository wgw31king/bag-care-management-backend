@echo off
REM Double-click this file - opens a window that stays open
cd /d "%~dp0"
if not exist "install.bat" (
  echo [ERROR] install.bat not found in: %~dp0
  pause
  exit /b 1
)
start "BagWash Install" cmd /k "cd /d \"%~dp0\" && call install.bat"
