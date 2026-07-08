@echo off
title Eterniza Next.js
cd /d "%~dp0"
echo =====================================
echo        ETERNIZA - NEXT.JS LOCAL
echo =====================================
echo.
echo Se for a primeira vez, instalando dependencias pelo npm oficial...
if exist package-lock.json del package-lock.json
call npm.cmd install --registry=https://registry.npmjs.org/
if errorlevel 1 (
  echo.
  echo ERRO: npm install falhou.
  echo Verifique sua internet e se o Node.js LTS esta instalado em https://nodejs.org/
  pause
  exit /b
)
echo.
echo Iniciando em http://localhost:3000
echo Se ja existir uma janela antiga da Eterniza aberta, feche ela antes.
echo Para parar, feche esta janela.
start http://localhost:3000
call npm.cmd run dev
pause
