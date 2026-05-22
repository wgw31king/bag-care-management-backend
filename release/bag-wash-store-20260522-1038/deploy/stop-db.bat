@echo off
cd /d "%~dp0"
call "%~dp0_root.bat"
if errorlevel 1 (
  pause
  exit /b 1
)
cd /d "%BAGWASH_ROOT%"
echo Stopping database...
docker compose down
pause
