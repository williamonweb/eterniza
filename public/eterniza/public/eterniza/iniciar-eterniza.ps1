Set-Location -Path $PSScriptRoot
Write-Host "========================================="
Write-Host "       ETERNIZA - SERVIDOR LOCAL"
Write-Host "========================================="
Write-Host "Iniciando em http://localhost:8080"
Write-Host "Para fechar, pressione CTRL+C ou feche esta janela."
Start-Process "http://localhost:8080"
$cmd = Get-Command py -ErrorAction SilentlyContinue
if ($cmd) { py -3 -m http.server 8080; exit }
$cmd = Get-Command python -ErrorAction SilentlyContinue
if ($cmd) { python -m http.server 8080; exit }
$cmd = Get-Command python3 -ErrorAction SilentlyContinue
if ($cmd) { python3 -m http.server 8080; exit }
Write-Host "ERRO: Python nao encontrado. Instale em https://www.python.org/downloads/ e marque Add Python to PATH."
Read-Host "Pressione Enter para fechar"
