@echo off
setlocal enabledelayedexpansion
title BloodLink - System Launcher
cd /d "%~dp0"

:: Check CLI arguments
if "%1"=="1" goto run_full
if /i "%1"=="run" goto run_full
if "%1"=="2" goto build_project
if /i "%1"=="build" goto build_project
if "%1"=="3" goto run_backend
if "%1"=="4" goto run_frontend
if "%1"=="5" goto init_db

:menu
cls
echo ==============================================================
echo                 BLOODLINK - SYSTEM LAUNCHER                  
echo ==============================================================
echo.
echo   [1] Run Full Project (Backend + Frontend + Auto Open Browser)
echo   [2] Build Project    (Client Production Bundle)
echo   [3] Run Backend Only (Port 5100)
echo   [4] Run Frontend Only(Port 5173)
echo   [5] Initialize / Verify MySQL Tables
echo   [6] Exit
echo.
echo ==============================================================
set /p choice="Enter your choice (1-6) [default: 1]: "

if "%choice%"=="" set choice=1
if "%choice%"=="1" goto run_full
if "%choice%"=="2" goto build_project
if "%choice%"=="3" goto run_backend
if "%choice%"=="4" goto run_frontend
if "%choice%"=="5" goto init_db
if "%choice%"=="6" goto exit_script

echo.
echo [!] Invalid selection, please choose between 1 and 6.
timeout /t 2 >nul
goto menu

:run_full
cls
echo ==============================================================
echo          STARTING BLOODLINK FULL STACK APPLICATION           
echo ==============================================================
echo.
echo [*] Checking dependencies...
if not exist "node_modules\" (
    echo [*] Installing root backend dependencies...
    call npm install
)
if not exist "client\node_modules\" (
    echo [*] Installing client frontend dependencies...
    cd client && call npm install && cd ..
)

echo [*] Clearing any stale processes on ports 5100, 5000, 5173...
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr :5100 ^| findstr LISTENING') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr :5000 ^| findstr LISTENING') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr :5173 ^| findstr LISTENING') do taskkill /f /pid %%a >nul 2>&1

echo [*] Launching Backend ^& Frontend together in this single terminal...
echo      - Backend API : http://localhost:5100
echo      - Frontend UI : http://localhost:5173
echo.
echo [*] Opening default browser in 3 seconds...
start "" cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:5173"

:: Run both Backend and Frontend inside THIS terminal (no extra CMD popup windows!)
call npm run dev:all
goto menu

:build_project
cls
echo ==============================================================
echo                 BUILDING PRODUCTION BUNDLE                   
echo ==============================================================
echo.
echo [*] Building Frontend Client (React + Vite)...
cd /d "%~dp0client"
call npm run build
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ==============================================================
    echo [OK] Production build succeeded! Output files in client/dist/
    echo ==============================================================
) else (
    echo.
    echo [ERROR] Production build failed! Check the error logs above.
)
cd /d "%~dp0"
echo.
pause
goto menu

:run_backend
cls
echo ==============================================================
echo                 STARTING BACKEND API (PORT 5100)             
echo ==============================================================
echo.
cd /d "%~dp0"
npm run dev
goto menu

:run_frontend
cls
echo ==============================================================
echo              STARTING FRONTEND CLIENT (PORT 5173)            
echo ==============================================================
echo.
cd /d "%~dp0client"
echo [*] Opening browser at http://localhost:5173 ...
start http://localhost:5173
npm run dev
goto menu

:init_db
cls
echo ==============================================================
echo               VERIFYING / INITIALIZING TABLES                
echo ==============================================================
echo.
cd /d "%~dp0"
node src/config/tables.js --init
echo.
node src/config/tables.js --status
echo.
pause
goto menu

:exit_script
echo.
echo Exiting BloodLink Launcher. Goodbye!
exit /b 0
