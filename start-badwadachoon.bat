@echo off
title Badwadachoon - Local Database Server
color 0A

echo.
echo  ============================================
echo   BADWADACHOON - Starting Server...
echo  ============================================
echo.

cd /d "%~dp0"

:: Check if node_modules exists
if not exist "node_modules\" (
    echo  [*] First run detected - installing dependencies...
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo  [!] npm install failed. Make sure Node.js is installed.
        echo      Download from: https://nodejs.org
        pause
        exit /b 1
    )
    echo.
    echo  [OK] Dependencies installed successfully.
    echo.
)

:: Generate Prisma client
echo  [*] Generating Prisma client...
call npx prisma generate
echo  [OK] Prisma ready.
echo.

:: Open browser after a short delay
echo  [*] Opening browser in 5 seconds...
start "" cmd /c "timeout /t 5 /nobreak >nul && start http://localhost:3000"

:: Start the dev server
echo  [*] Starting server on http://localhost:3000
echo.
echo  ============================================
echo   Server is running! 
echo   Open: http://localhost:3000
echo   Database: SQLite + Desktop Excel Live Sync
echo   Press Ctrl+C to stop the server.
echo  ============================================
echo.

call npm run dev
