@echo off
setlocal EnableDelayedExpansion
cd /d "%~dp0.."
title BagWash Install

echo ========================================
echo   Bag Wash Store - First-time Install
echo   Requires: Node.js 18+ and Docker
echo ========================================
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Node.js not found. Install from https://nodejs.org/
  pause
  exit /b 1
)
where docker >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Docker not found. Start Docker Desktop first.
  pause
  exit /b 1
)

echo [1/6] Start PostgreSQL...
docker compose up -d
if errorlevel 1 (
  echo [ERROR] Cannot start database. Is Docker running?
  pause
  exit /b 1
)
echo Waiting for database...
timeout /t 8 /nobreak >nul

echo.
echo [2/6] Backend npm ci (3-10 min first time)...
cd /d "%~dp0..\backend"
if not exist ".env" copy /Y ".env.example" ".env" >nul
call npm ci
if errorlevel 1 goto fail

echo.
echo [3/6] Database migrate and seed...
call npx prisma generate
if errorlevel 1 goto fail
call npx prisma migrate deploy
if errorlevel 1 goto fail
call npm run prisma:seed
if errorlevel 1 goto fail

echo.
echo [4/6] Frontend npm ci...
cd /d "%~dp0..\frontend"
if not exist ".env.production" echo VITE_API_BASE_URL=/api>".env.production"
call npm ci
if errorlevel 1 goto fail

echo.
echo [5/6] Frontend build...
set VITE_API_BASE_URL=/api
call npm run build
if errorlevel 1 goto fail

echo.
echo [6/6] Verify...
if not exist "dist\index.html" (
  echo [ERROR] Missing frontend\dist\index.html
  goto fail
)
if not exist "..\backend\dist\main.js" (
  echo [ERROR] Missing backend\dist\main.js
  goto fail
)

cd /d "%~dp0.."
echo.
echo ========================================
echo   DONE. Next: run start.bat
echo   URL:     http://localhost:3001
echo   User:    admin
echo   Pass:    admin
echo ========================================
pause
exit /b 0

:fail
echo.
echo [FAILED] Send a screenshot of this window for support.
pause
exit /b 1
