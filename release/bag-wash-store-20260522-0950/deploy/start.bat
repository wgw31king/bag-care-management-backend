@echo off
cd /d "%~dp0.."
title BagWash Running

docker compose ps 2>nul | findstr /i "bagwash-postgres" | findstr /i "running" >nul
if errorlevel 1 (
  echo Starting database...
  docker compose up -d
  timeout /t 5 /nobreak >nul
)

if not exist "frontend\dist\index.html" (
  echo [ERROR] Run install.bat first.
  pause
  exit /b 1
)
if not exist "backend\node_modules\@prisma\client" (
  echo [ERROR] Run install.bat first.
  pause
  exit /b 1
)

cd backend
set FRONTEND_DIST=../frontend/dist
set PORT=3001
echo.
echo Open: http://localhost:3001
echo User:  admin
echo Pass:  admin
echo Close this window to stop the server.
echo.
node dist/main.js
pause
