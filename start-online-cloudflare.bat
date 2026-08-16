@echo off
title Badwadachoon - Online Server (Cloudflare)
color 0A

echo.
echo  =============================================================
echo   BADWADACHOON - Starting Online Cloudflare Server
echo  =============================================================
echo.

cd /d "%~dp0"

:: Start Next.js local server in background
echo  [*] Starting Badwadachoon Server on http://localhost:3000...
start "Badwadachoon Next.js Server" cmd /k "npm run dev"

echo  [*] Waiting for server to initialize...
timeout /t 4 /nobreak >nul

echo  [*] Launching Cloudflare Tunnel...
echo.

node scripts\tunnel.js

pause
