<?php
/**
 * Script para descompactar e fazer setup do deploy no servidor Hostinger
 * Etapas:
 * 1. Descompactar arquivos
 * 2. Copiar .env.production para .env
 * 3. Executar migrations do banco
 * 4. Restaurar dados (seed)
 * 5. Limpar caches
 */

set_time_limit(300); // 5 minutos para o script rodar
$output = [];
$errors = [];

function log_message($msg, $is_error = false) {
    global $output, $errors;
    if ($is_error) {
        $errors[] = $msg;
        echo "<span style='color: red;'>❌ " . htmlspecialchars($msg) . "</span><br>";
    } else {
        $output[] = $msg;
        echo "<span style='color: green;'>✅ " . htmlspecialchars($msg) . "</span><br>";
    }
    flush();
}

echo "<!DOCTYPE html>
<html>
<head><title>ÓoDelivery Deploy</title>
<style>body{font-family:monospace; padding:20px;} pre{background:#f0f0f0; padding:10px;}</style>
</head>
<body>";

echo "<h2>🚀 Iniciando Deploy - ÓoDelivery</h2>";
echo "<p>Processando arquivos...</p><br>";

$zipFile = 'deploy.zip';
$extractPath = __DIR__;

// 1. DESCOMPACTAR
if (!file_exists($zipFile)) {
    log_message("Arquivo deploy.zip não encontrado!", true);
    die("</body></html>");
}

$zip = new ZipArchive;
$res = $zip->open($zipFile);

if ($res !== TRUE) {
    log_message("Erro ao abrir o arquivo ZIP. Código: $res", true);
    die("</body></html>");
}

$zip->extractTo($extractPath);
$zip->close();
log_message("Arquivos descompactados com sucesso");

// 2. COPIAR .env.production para .env
if (file_exists($extractPath . '/.env.production')) {
    copy($extractPath . '/.env.production', $extractPath . '/.env');
    log_message(".env configurado de .env.production");
} else {
    log_message(".env.production não encontrado - configure .env manualmente no Hostinger", true);
}

// 3. EXECUTAR MIGRATIONS
try {
    require_once $extractPath . '/vendor/autoload.php';
    require_once $extractPath . '/bootstrap/app.php';

    $app = require_once $extractPath . '/bootstrap/app.php';
    $kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);

    // Executar migrations
    $kernel->call('migrate', ['--force' => true]);
    log_message("Migrations executadas com sucesso");

    // Restaurar dados do SQL se existir
    if (file_exists($extractPath . '/database/hostinger_data.sql')) {
        log_message("Arquivo hostinger_data.sql encontrado - execute manualmente via phpMyAdmin");
    }

    // Limpar caches
    $kernel->call('cache:clear');
    $kernel->call('route:clear');
    $kernel->call('config:clear');
    $kernel->call('view:clear');
    log_message("Caches limpos com sucesso");

} catch (\Exception $e) {
    log_message("Erro durante migrations: " . $e->getMessage(), true);
}

// 4. APAGAR ZIP
if (file_exists($zipFile)) {
    unlink($zipFile);
    log_message("Arquivo deploy.zip removido para economizar espaço");
}

echo "<hr>";
if (empty($errors)) {
    echo "<h3 style='color: green;'>✅ Deploy finalizado com sucesso!</h3>";
    echo "<p><strong>Próximas etapas:</strong></p>";
    echo "<ol>";
    echo "<li>Acesse seu phpMyAdmin do Hostinger</li>";
    echo "<li>Importe o arquivo <code>database/hostinger_data.sql</code> se desejar dados iniciais</li>";
    echo "<li>Configure a senha de email em <code>.env</code> (MAIL_PASSWORD)</li>";
    echo "<li>Acesse <code>https://seu-dominio.com/clear_cache.php</code> para limpar caches finais</li>";
    echo "<li>Acesse <code>https://seu-dominio.com</code> para verificar se está funcionando</li>";
    echo "</ol>";
} else {
    echo "<h3 style='color: red;'>⚠️ Deploy concluído com avisos!</h3>";
    echo "<p>Erros encontrados:</p>";
    echo "<ul>";
    foreach ($errors as $err) {
        echo "<li>$err</li>";
    }
    echo "</ul>";
}

echo "</body></html>";

// Auto-destruição deste script
if (file_exists(__FILE__)) {
    unlink(__FILE__);
}
