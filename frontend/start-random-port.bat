@echo off
echo 🚀 Starting FHEVM DApp7 Frontend with Random Port...
echo ================================================

cd /d "%~dp0"

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing dependencies first...
    npm install
)

REM Start with random port
node start-random-port.js

pause