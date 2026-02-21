# Script de Build para Deploy na Hostinger
# Execute antes de fazer push para o GitHub

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Preparando Deploy para Hostinger" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Build do frontend
Write-Host "[1/4] Build do frontend (npm run build)..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: Build falhou!" -ForegroundColor Red
    exit 1
}
Write-Host "OK: Build concluido" -ForegroundColor Green
Write-Host ""

# 2. Limpar caches do Laravel
Write-Host "[2/4] Limpando caches do Laravel..." -ForegroundColor Yellow
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear
Write-Host "OK: Caches limpos" -ForegroundColor Green
Write-Host ""

# 3. Verificar .env
Write-Host "[3/4] Verificando .env..." -ForegroundColor Yellow
if (Test-Path .env) {
    Write-Host "OK: .env encontrado" -ForegroundColor Green
} else {
    Write-Host "ATENCAO: .env nao encontrado. Copie .env.example e configure." -ForegroundColor Yellow
}
Write-Host ""

# 4. Otimizar autoload
Write-Host "[4/4] Otimizando autoload do Composer..." -ForegroundColor Yellow
if (Test-Path vendor) {
    composer dump-autoload --optimize
    Write-Host "OK: Autoload otimizado" -ForegroundColor Green
} else {
    Write-Host "INFO: vendor nao encontrado. Rode 'composer install' na Hostinger." -ForegroundColor Cyan
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Pronto para commit e push!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Proximos passos:" -ForegroundColor Cyan
Write-Host "  1. git add ." -ForegroundColor White
Write-Host "  2. git commit -m 'Deploy: build e atualizacoes'" -ForegroundColor White
Write-Host "  3. git push origin main" -ForegroundColor White
Write-Host ""
Write-Host "Na Hostinger (via SSH):" -ForegroundColor Cyan
Write-Host "  cd public_html" -ForegroundColor White
Write-Host "  git pull origin main" -ForegroundColor White
Write-Host "  composer install --optimize-autorouter --no-dev" -ForegroundColor White
Write-Host "  php artisan migrate --force" -ForegroundColor White
Write-Host "  php artisan storage:link" -ForegroundColor White
Write-Host "  php artisan config:clear" -ForegroundColor White
Write-Host "  php artisan cache:clear" -ForegroundColor White
Write-Host ""
