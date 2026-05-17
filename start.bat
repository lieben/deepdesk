@echo off
cd /d "%~dp0"
where node >nul 2>&1 || (echo 请先安装 Node.js: https://nodejs.org && pause && exit)
if not exist node_modules (
    echo 首次运行，安装依赖...
    npm install
)
npx electron .
