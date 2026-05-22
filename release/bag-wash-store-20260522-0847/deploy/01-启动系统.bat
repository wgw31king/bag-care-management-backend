@echo off
chcp 65001 >nul
cd /d "%~dp0.."
title 包包洗护 - 运行中

docker compose ps 2>nul | findstr /i "bagwash-postgres" | findstr /i "running" >nul
if errorlevel 1 (
  echo 数据库未运行，正在启动...
  docker compose up -d
  timeout /t 5 /nobreak >nul
)

if not exist "frontend\dist\index.html" (
  echo 未检测到前端编译结果，请先运行 deploy\00-一键安装.bat
  pause
  exit /b 1
)
if not exist "backend\node_modules\@prisma\client" (
  echo 未检测到后端依赖，请先运行 deploy\00-一键安装.bat
  pause
  exit /b 1
)

cd backend
set FRONTEND_DIST=../frontend/dist
set PORT=3001
echo.
echo 系统地址: http://localhost:3001
echo 登录账号: admin  密码: admin
echo 关闭本窗口即停止服务
echo.
node dist/main.js
pause
