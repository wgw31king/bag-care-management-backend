@echo off
cd /d "%~dp0"
start "BagWash" cmd /k "cd /d \"%~dp0\" && call start.bat"
