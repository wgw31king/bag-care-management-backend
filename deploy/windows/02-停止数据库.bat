@echo off
chcp 65001 >nul
cd /d "%~dp0.."
echo 停止 PostgreSQL...
docker compose down
pause
