@echo off
title FAME GENIX Backend (FastAPI)
echo Starting FAME GENIX FastAPI Backend...
cd /d "%~dp0"
python scripts\seed_demo.py
python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload
pause
