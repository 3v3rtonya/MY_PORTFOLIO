@echo off
set DATABASE_URL=postgresql://postgres:1234@127.0.0.1:5432/portfolio
set JWT_SECRET_KEY=everton-portfolio-secret-key-2024-dekut-bbit
set ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
set CV_FILE_PATH=./static/Everton_Anyiro_CV.pdf
title Portfolio Backend
echo Backend starting on http://localhost:8000
.venv\Scripts\uvicorn app.main:app --reload --port 8000
