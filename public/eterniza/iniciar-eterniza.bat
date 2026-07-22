@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo.
echo =========================================
echo        ETERNIZA - SERVIDOR LOCAL
echo =========================================
echo.
echo Iniciando em: http://localhost:8080
echo.
echo Se aparecer aviso do firewall, clique em Permitir.
echo Para fechar o servidor, feche esta janela.
echo.

where py >nul 2>nul
if %errorlevel%==0 (
  start "" "http://localhost:8080"
  py -3 -m http.server 8080
  pause
  exit /b
)

where python >nul 2>nul
if %errorlevel%==0 (
  start "" "http://localhost:8080"
  python -m http.server 8080
  pause
  exit /b
)

where python3 >nul 2>nul
if %errorlevel%==0 (
  start "" "http://localhost:8080"
  python3 -m http.server 8080
  pause
  exit /b
)

echo ERRO: Python nao encontrado no Windows.
echo.
echo Solucao rapida:
echo 1. Instale Python em https://www.python.org/downloads/
echo 2. Na instalacao, marque a opcao Add Python to PATH.
echo 3. Depois rode este arquivo novamente.
echo.
echo Alternativa: abra o index.html direto, mas o YouTube pode bloquear mais recursos.
echo.
pause
