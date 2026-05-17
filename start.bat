@echo off
cd /d "%~dp0"
where node >nul 2>&1 || (echo Please install Node.js: https://nodejs.org && pause && exit)
if not exist node_modules (
    echo Installing dependencies...
    npm install --registry=https://registry.npmmirror.com
)
npx electron .
