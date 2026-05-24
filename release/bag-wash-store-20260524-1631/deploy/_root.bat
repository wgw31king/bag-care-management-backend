@echo off
REM Sets BAGWASH_ROOT to folder containing backend, frontend, docker-compose.yml
set "BAGWASH_ROOT="
set "DIR=%~dp0"
if "%DIR:~-1%"=="\" set "DIR=%DIR:~0,-1%"

:try
pushd "%DIR%" 2>nul || goto fail
if exist "backend\package.json" if exist "frontend\package.json" if exist "docker-compose.yml" (
  set "BAGWASH_ROOT=%CD%"
  popd
  exit /b 0
)
popd
for %%P in ("%DIR%\..") do set "DIR=%%~fP"
if /i not "%DIR%"=="%CD%" goto try

:fail
echo [ERROR] Project root not found.
echo.
echo You should see these folders in ONE folder:
echo   backend   frontend   deploy   uploads
echo.
echo If path looks like:
echo   bag-wash-store-xxx\bag-wash-store-xxx\deploy
echo then MOVE inner folder contents UP one level, or re-extract zip to Desktop.
echo.
echo Current script folder: %~dp0
exit /b 1
