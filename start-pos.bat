@echo off
title 🎆 Cracker Shop Billing POS - Live Multi-Device Server
color 0E
echo ===================================================================
echo   🎆 SRI KRISHNA CRACKERS - LIVE MULTI-DEVICE POS BILLING SOFTWARE
echo ===================================================================
echo.
echo [1/2] Checking production build...
if not exist "client\dist\index.html" (
    echo Building frontend for first-time use...
    call npm run build
)

echo [2/2] Starting Central Live Server...
echo.
echo * Open on THIS computer:       http://localhost:5000
echo * Open on OTHER phones/tablets: (Shown below once server starts)
echo.
echo ===================================================================
echo.

start http://localhost:5000
node server/index.js
pause
