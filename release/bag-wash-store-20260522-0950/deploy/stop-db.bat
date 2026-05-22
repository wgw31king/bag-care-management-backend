@echo off
cd /d "%~dp0.."
echo Stopping PostgreSQL container...
docker compose down
pause
