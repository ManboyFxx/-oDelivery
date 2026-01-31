<?php
/**
 * Script para descompactar e fazer setup do deploy no servidor Hostinger (UNIFIED)
 * Use com o arquivo: deploy.zip
 */

set_time_limit(600); // 10 minutos
ini_set('memory_limit', '512M');

$output = [];
$errors = [];

function log_message($msg, $is_error = false)
{
    $color = $is_error ? 'red' : 'green';
    $icon = $is_error ? '❌' : '✅';
    echo "<div style='color: $color; margin-bottom: 5px; font-family: sans-serif;'>$icon $msg</div>";
    flush();
}

echo "<!DOCTYPE html><html><head><title>Deploy V2</title></head><body style='font-family: monospace; padding: 20px;'>";
echo "<h2>🚀 Deploy Unificado - ÓoDelivery</h2>";

$zipFile = 'deploy.zip';
$extractPath = __DIR__;

// 1. Unzip
if (file_exists($zipFile)) {
    echo "<h3>📦 Descompactando...</h3>";
    $zip = new ZipArchive;
    if ($zip->open($zipFile) === TRUE) {
        $zip->extractTo($extractPath);
        $zip->close();
        log_message("Arquivos extraídos com sucesso!");

        // Delete zip to save space
        unlink($zipFile);
    } else {
        log_message("Erro ao abrir o arquivo ZIP.", true);
        die();
    }
} else {
    log_message("Arquivo $zipFile não encontrado (Já foi extraído?).", true);
}

// 2. Setup Env
if (!file_exists('.env') && file_exists('.env.production')) {
    copy('.env.production', '.env');
    log_message("Arquivo .env criado.");
}

// 3. Permissions
$dirs = [
    'storage',
    'storage/app',
    'storage/app/public',
    'storage/framework',
    'storage/framework/cache',
    'storage/framework/sessions',
    'storage/framework/views',
    'storage/logs',
    'bootstrap/cache'
];

foreach ($dirs as $dir) {
    if (!file_exists($dir)) {
        @mkdir($dir, 0775, true);
    }
    @chmod($dir, 0775);
}
log_message("Permissões ajustadas nas pastas de storage.");

// 4. Migrations & Clear Cache
echo "<h3>⚙️ Migrations & Otimização</h3>";
try {
    if (file_exists("vendor/autoload.php")) {
        require_once "vendor/autoload.php";
        $app = require_once "bootstrap/app.php";
        $kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);

        // Run migrations properly catching output? No, just run them.
        $kernel->call('migrate', ['--force' => true]);
        log_message("Banco de dados atualizado (Migrate).");

        $kernel->call('cache:clear');
        $kernel->call('config:clear');
        $kernel->call('view:clear');
        $kernel->call('route:clear');
        log_message("Caches do sistema limpos.");

    } else {
        log_message("ERRO CRÍTICO: Pasta vendor não encontrada!", true);
    }
} catch (Exception $e) {
    log_message("Erro no Laravel: " . $e->getMessage(), true);
}

echo "<hr><h3>✅ Pronto! Acesse seu site.</h3>";
echo "</body></html>";
if (file_exists(__FILE__))
    unlink(__FILE__);
?>