@echo off
title Everton Portfolio — Stopping
color 0C

echo.
echo  =====================================================
echo   Everton Anyiro Portfolio Website — Shutdown
echo  =====================================================
echo.

echo [1/3] Stopping backend (uvicorn)...
taskkill /F /FI "WINDOWTITLE eq Portfolio Backend" >nul 2>&1
taskkill /F /IM uvicorn.exe >nul 2>&1
echo       Done.

echo [2/3] Stopping frontend (vite)...
taskkill /F /FI "WINDOWTITLE eq Portfolio Frontend" >nul 2>&1
echo       Done.

echo [3/3] Freeing ports 8000 and 5173...
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":8000 "') do (
    taskkill /F /PID %%a >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":5173 "') do (
    taskkill /F /PID %%a >nul 2>&1
)
echo       Done.

echo.
echo  =====================================================
echo   All portfolio servers stopped successfully.
echo  =====================================================
echo.
pause
