@echo off
setlocal EnableDelayedExpansion
cd /d "%~dp0.."
if not exist "backend\package.json" (
  echo [ERROR] backend\package.json not found.
  echo Please extract the FULL zip. Current folder:
  cd
  dir /b
  goto end
)
if not exist "frontend\package.json" (
  echo [ERROR] frontend\package.json not found. Extract full zip.
  goto end
)

title BagWash Install
set LOGFILE=%~dp0..\install-log.txt
echo Log file: %LOGFILE%
echo Install started %date% %time% > "%LOGFILE%"

echo ========================================
echo   Bag Wash Store - First-time Install
echo   Requires: Node.js 18+ and Docker
echo ========================================
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Node.js not found. Install from https://nodejs.org/
  goto end
)
where docker >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Docker not found. Start Docker Desktop first.
  goto end
)

echo [1/6] Start PostgreSQL...
docker compose up -d >>"%LOGFILE%" 2>&1
if errorlevel 1 (
  echo [ERROR] Cannot start database. Is Docker running?
  goto end
)
echo Waiting 10 sec for database...
ping 127.0.0.1 -n 11 >nul
echo Database ready.

echo.
echo [2/6] Backend npm ci - first time 5-15 min, please wait...
cd /d "%~dp0..\backend"
if not exist ".env" copy /Y ".env.example" ".env" >nul
call npm ci >>"%LOGFILE%" 2>&1
if errorlevel 1 (
  echo [ERROR] backend npm ci failed. See install-log.txt
  goto end
)
echo [2/6] Backend deps OK.

echo.
echo [3/6] Database migrate and seed...
call npx prisma generate >>"%LOGFILE%" 2>&1
if errorlevel 1 goto end
call npx prisma migrate deploy >>"%LOGFILE%" 2>&1
if errorlevel 1 goto end
call npm run prisma:seed >>"%LOGFILE%" 2>&1
if errorlevel 1 goto end
echo [3/6] OK.

echo.
echo [4/6] Frontend npm ci - may take several minutes...
cd /d "%~dp0..\frontend"
if not exist ".env.production" echo VITE_API_BASE_URL=/api>".env.production"
call npm ci >>"%LOGFILE%" 2>&1
if errorlevel 1 (
  echo [ERROR] frontend npm ci failed. See install-log.txt
  goto end
)

echo.
echo [5/6] Frontend build...
set VITE_API_BASE_URL=/api
call npm run build >>"%LOGFILE%" 2>&1
if errorlevel 1 (
  echo [ERROR] frontend build failed. See install-log.txt
  goto end
)

echo.
echo [6/6] Verify...
if not exist "dist\index.html" (
  echo [ERROR] Missing frontend\dist\index.html
  goto end
)
if not exist "..\backend\dist\main.js" (
  echo [ERROR] Missing backend\dist\main.js
  goto end
)

cd /d "%~dp0.."
echo.
echo ========================================
echo   DONE. Next: run start.bat or 01-start.bat
echo   URL:     http://localhost:3001
echo   User:    admin
echo   Pass:    admin
echo ========================================
goto end

:end
echo.
echo Log saved: %LOGFILE%
echo Press any key to close...
pause >nul
exit /b 0
