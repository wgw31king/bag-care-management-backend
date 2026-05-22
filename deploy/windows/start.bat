@echo off
setlocal
cd /d "%~dp0"
call "%~dp0_root.bat"
if errorlevel 1 (
  pause
  exit /b 1
)
cd /d "%BAGWASH_ROOT%"
title BagWash

docker compose ps 2>nul | findstr /i "bagwash-postgres" | findstr /i "running" >nul
if errorlevel 1 (
  echo Starting database...
  docker compose up -d
  ping 127.0.0.1 -n 6 >nul
)

if not exist "%BAGWASH_ROOT%\frontend\dist\index.html" (
  echo [ERROR] Run deploy\install.bat first.
  pause
  exit /b 1
)
if not exist "%BAGWASH_ROOT%\backend\node_modules\@prisma\client" (
  echo [ERROR] Run deploy\install.bat first.
  pause
  exit /b 1
)

cd /d "%BAGWASH_ROOT%\backend"
set FRONTEND_DIST=../frontend/dist
set PORT=3001
echo.
echo http://localhost:3001
echo user admin  pass admin
echo Close this window to stop.
echo.
node dist\main.js
pause
endlocal
