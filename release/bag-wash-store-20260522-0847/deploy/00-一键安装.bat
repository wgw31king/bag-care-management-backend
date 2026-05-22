@echo off
chcp 65001 >nul
setlocal EnableDelayedExpansion
cd /d "%~dp0.."
title 包包洗护 - 一键安装

echo ========================================
echo   包包洗护门店系统 - 首次一键安装
echo   需已安装 Node.js 20 与 Docker Desktop
echo ========================================
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo [错误] 未找到 Node.js，请先安装 https://nodejs.org/
  pause
  exit /b 1
)
where docker >nul 2>&1
if errorlevel 1 (
  echo [错误] 未找到 Docker，请先安装 Docker Desktop 并启动
  pause
  exit /b 1
)

echo [1/6] 启动 PostgreSQL...
docker compose up -d
if errorlevel 1 (
  echo [错误] 数据库启动失败，请确认 Docker Desktop 正在运行
  pause
  exit /b 1
)
echo 等待数据库就绪...
timeout /t 8 /nobreak >nul

echo.
echo [2/6] 安装后端依赖（首次约 3～10 分钟）...
cd /d "%~dp0..\backend"
if not exist ".env" copy /Y ".env.example" ".env" >nul
call npm ci
if errorlevel 1 goto :fail

echo.
echo [3/6] 数据库迁移与管理员...
call npx prisma generate
if errorlevel 1 goto :fail
call npx prisma migrate deploy
if errorlevel 1 goto :fail
call npm run prisma:seed
if errorlevel 1 goto :fail

echo.
echo [4/6] 安装前端依赖...
cd /d "%~dp0..\frontend"
if not exist ".env.production" (
  echo VITE_API_BASE_URL=/api> .env.production
)
call npm ci
if errorlevel 1 goto :fail

echo.
echo [5/6] 编译前端页面...
set VITE_API_BASE_URL=/api
call npm run build
if errorlevel 1 goto :fail

echo.
echo [6/6] 检查产物...
if not exist "dist\index.html" (
  echo [错误] 前端编译失败，未找到 frontend\dist\index.html
  goto :fail
)
if not exist "..\backend\dist\main.js" (
  echo [错误] 未找到 backend\dist\main.js
  goto :fail
)

cd /d "%~dp0.."
echo.
echo ========================================
echo   安装完成！
echo   下一步: 双击 deploy\01-启动系统.bat
echo   浏览器: http://localhost:3001
echo   账号 admin  密码 admin
echo ========================================
pause
exit /b 0

:fail
echo.
echo [失败] 安装中断，请截图本窗口联系技术支持
pause
exit /b 1
