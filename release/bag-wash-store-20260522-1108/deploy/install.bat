@echo off
setlocal EnableExtensions
cd /d "%~dp0"
call "%~dp0_root.bat"
if errorlevel 1 goto end
cd /d "%BAGWASH_ROOT%"

title BagWash Install
set "LOGFILE=%BAGWASH_ROOT%\install-log.txt"
echo Root: %BAGWASH_ROOT%
echo Log:  %LOGFILE%
echo Install %date% %time% > "%LOGFILE%"

echo ========================================
echo   Bag Wash Store - First-time Install
echo   Node.js 18+ and Docker required
echo ========================================
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Node.js not found. https://nodejs.org/
  goto end
)
where docker >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Docker not found. Start Docker Desktop.
  goto end
)

echo [1/6] Start PostgreSQL...
docker compose up -d
if errorlevel 1 (
  echo [ERROR] Database start failed. See install-log.txt
  docker compose up -d >>"%LOGFILE%" 2>&1
  goto end
)
echo Waiting 10 seconds...
ping 127.0.0.1 -n 11 >nul

echo.
echo [2/6] Backend npm ci (5-15 min first time)...
cd /d "%BAGWASH_ROOT%\backend"
if not exist ".env" copy /Y ".env.example" ".env" >nul
call npm ci
if errorlevel 1 (
  echo [ERROR] backend npm ci failed
  goto end
)

echo.
echo [3/6] Database migrate...
call npx prisma generate
if errorlevel 1 goto end
call npx prisma migrate deploy
if errorlevel 1 goto end
call npm run prisma:seed
if errorlevel 1 goto end

echo.
echo [4/6] Frontend npm ci...
cd /d "%BAGWASH_ROOT%\frontend"
if not exist ".env.production" (
  echo VITE_API_BASE_URL=/api> ".env.production"
)
call npm ci
if errorlevel 1 (
  echo [ERROR] frontend npm ci failed
  goto end
)

echo.
echo [5/6] Frontend build...
set VITE_API_BASE_URL=/api
call npm run build
if errorlevel 1 (
  echo [ERROR] frontend build failed
  goto end
)

echo.
echo [6/6] Verify...
if not exist "%BAGWASH_ROOT%\frontend\dist\index.html" (
  echo [ERROR] Missing frontend\dist\index.html
  goto end
)
if not exist "%BAGWASH_ROOT%\backend\dist\main.js" (
  echo [ERROR] Missing backend\dist\main.js
  goto end
)

echo.
echo ========================================
echo   SUCCESS
echo   Next: double-click deploy\start.bat
echo   Browser: http://localhost:3001
echo   Login: admin / admin
echo ========================================
goto end

:end
echo.
if exist "%LOGFILE%" echo Log: %LOGFILE%
pause
endlocal
