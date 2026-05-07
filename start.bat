@echo off
echo ==============================================
echo Shastika Project Startup Script
echo ==============================================

echo [1/4] Cleaning up existing processes...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3001" ^| find "LISTENING"') do taskkill /f /pid %%a 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8080" ^| find "LISTENING"') do taskkill /f /pid %%a 2>nul

echo [2/4] Starting Backend Server...
cd d:\shastika-project-main\shastika-project\shastika-project-main\server
start "Shastika Backend" cmd /c "npm run dev"

echo [3/4] Starting Frontend Server...
cd d:\shastika-project-main\shastika-project\shastika-project-main
start "Shastika Frontend" cmd /c "npm run dev -- --port 8080 --strictPort"

echo [4/4] Waiting for servers to initialize...
timeout /t 5 /nobreak >nul

echo Opening application in browser...
start http://localhost:8080

echo Startup complete!
exit
