@echo off
title Restart Backend
color 0E

echo Stopping old backend processes...
taskkill /F /IM uvicorn.exe /T >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq Portfolio Backend" >nul 2>&1

:: Free port 8000 by killing whoever holds it
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":8000 " ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)
timeout /t 2 /nobreak >nul

echo Starting fresh backend...
start "Portfolio Backend" /D "%~dp0backend" cmd /k "title Portfolio Backend && set DATABASE_URL=postgresql://postgres:1234@127.0.0.1:5432/portfolio && set JWT_SECRET_KEY=everton-portfolio-secret-key-2024-dekut-bbit && set ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173 && set CV_FILE_PATH=./static/Everton_Anyiro_CV.pdf && .venv\Scripts\uvicorn app.main:app --reload --port 8000"

timeout /t 6 /nobreak >nul
echo.
echo  Backend restarted!
echo  Admin: everton.anyiro@gmail.com / Admin123
echo.
pause
