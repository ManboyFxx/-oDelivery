@echo off
echo ==========================================
echo   OoPrint - Gerador de Instalador
echo ==========================================
echo.
echo [1/3] Limpando cache e preparando...
if exist dist rmdir /s /q dist
if exist dist-electron rmdir /s /q dist-electron

echo.
echo [2/3] Instalando/Atualizando dependências...
call npm install

echo.
echo [3/3] Gerando instalador Windows...
call npm run electron:build

echo.
echo ==========================================
echo   PROCESSO CONCLUÍDO!
echo   O instalador está em: óoprint\dist-electron
echo ==========================================
pause
