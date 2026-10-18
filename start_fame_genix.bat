@echo off
title Launch FAME GENIX Platform
echo Launching FAME GENIX Full-Stack Application...
start "FAME GENIX Backend" cmd /c "start_backend.bat"
timeout /t 15 /nobreak >nul
start "FAME GENIX Frontend" cmd /c "start_frontend.bat"
echo.
echo ===================================================
echo FAME GENIX Platform Launch Initiated!
echo ===================================================
echo Frontend SPA:   http://localhost:3000
echo Backend API:    http://127.0.0.1:8000
echo Swagger Docs:   http://127.0.0.1:8000/docs
echo ===================================================
