@echo off
title Everton Portfolio - Starting...
color 0A

echo.
echo  =====================================================
echo   Everton Anyiro Portfolio Website
echo   DeKUT BBIT Final Year Project
echo  =====================================================
echo.

:: Check PostgreSQL
echo [1/3] Checking PostgreSQL...
sc query postgresql-x64-17 | find "RUNNING" >nul 2>&1
if %errorlevel% neq 0 (
    echo       Starting PostgreSQL...
    net start postgresql-x64-17 >nul 2>&1
    timeout /t 3 /nobreak >nul
) else (
    echo       PostgreSQL is running.
)

:: Start Backend - note: no spaces around && in set commands to avoid trailing space in values
echo [2/3] Starting Backend...
start "Portfolio Backend" /D "%~dp0backend" cmd /k run.bat
timeout /t 8 /nobreak >nul
echo       Backend running on http://localhost:8000

:: Start Frontend
echo [3/3] Starting Frontend...
start "Portfolio Frontend" /D "%~dp0frontend" cmd /k "title Portfolio Frontend && npm run dev"
timeout /t 6 /nobreak >nul
echo       Frontend running on http://localhost:5173

:: Open browser
echo.
echo  =====================================================
echo   All servers started!
echo  =====================================================
echo.
echo   Site     : http://localhost:5173
echo   API Docs : http://localhost:8000/docs
echo   Admin    : http://localhost:5173/admin-xk92
echo.
echo   Admin Login:
echo     Email    : everton.anyiro@gmail.com
echo     Password : Admin123
echo  =====================================================
echo.
start "" "http://localhost:5173"
echo  Run stop.bat to shut everything down.
echo.
pause
