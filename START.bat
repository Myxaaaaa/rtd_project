@echo off
chcp 65001 >nul
cd /d "%~dp0"
set "PATH=%~dp0.tools\node;%PATH%"

echo.
echo  LifeGift — локальный запуск
echo  Сайт:    http://localhost:5173
echo  API:     http://localhost:3000
echo  Админка: http://localhost:5173/admin
echo.

if not exist "node_modules" (
  echo  Устанавливаю зависимости...
  call npm install
)

call npm run dev
