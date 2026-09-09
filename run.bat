@echo off
title SmartFarm - Secure Digital Assistant Server
echo ===================================================
echo   SmartFarm - Secure Digital Assistant
echo ===================================================
echo Starting hardened server with security headers...
start http://localhost:8080
py server.py
pause
