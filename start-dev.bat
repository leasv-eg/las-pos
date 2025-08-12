@echo off
set PATH=%PATH%;C:\Program Files\nodejs
cd /d "%~dp0"
echo Starting LAS POS Development Server...
echo Current directory: %CD%
npm run dev
echo.
echo Server stopped. Press any key to close...
pause
