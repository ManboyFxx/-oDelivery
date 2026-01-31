<?php
/**
 * Script para limpar cache do Laravel em hospedagem compartilhada (Hostinger)
 * Upload para: public_html/clear_cache.php
 * Acesso: https://seusite.com/clear_cache.php
 */

echo "<!DOCTYPE html>
<html>
<head><title>ÓoDelivery - Limpar Cache</title>
<style>
    body { font-family: Arial, sans-serif; padding: 30px; background: #f5f5f5; }
    .container { background: white; padding: 20px; border-radius: 8px; max-width: 600px; margin: 0 auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    h1 { color: #333; }
    .success { color: #22863a; margin: 10px 0; }
    .error { color: #cb2431; margin: 10px 0; }
    hr { border: none; border-top: 1px solid #eee; }
    a { color: #0366d6; text-decoration: none; }
    a:hover { text-decoration: underline; }
</style>
</head>
<body>
<div class='container'>";

try {
    // Bootstrap da aplicação
    require_once __DIR__ . '/vendor/autoload.php';
    $app = require_once __DIR__ . '/bootstrap/app.php';
    $kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);

    echo "<h1>🧹 Limpando Caches...</h1>";

    $commands = [
        'route:clear' => 'Rotas',
        'config:clear' => 'Configuração',
        'view:clear' => 'Views',
        'cache:clear' => 'Cache de Aplicação',
    ];

    foreach ($commands as $cmd => $label) {
        try {
            $kernel->call($cmd);
            echo "<div class='success'>✅ $label limpa</div>";
        } catch (\Exception $e) {
            echo "<div class='error'>⚠️ Erro ao limpar $label: " . $e->getMessage() . "</div>";
        }
    }

    echo "<hr>";
    echo "<h3 style='color: #28a745;'>✅ Processo concluído!</h3>";
    echo "<p>Os caches foram limpos com sucesso. Seu site deve estar funcionando normalmente.</p>";
    echo "<p><a href='/'>← Voltar para Home</a></p>";

} catch (\Exception $e) {
    echo "<h1>⚠️ Erro</h1>";
    echo "<div class='error'>";
    echo "<p><strong>Erro ao processar:</strong></p>";
    echo "<pre>" . htmlspecialchars($e->getMessage() . "\n\n" . $e->getTraceAsString()) . "</pre>";
    echo "</div>";
    echo "<p><a href='/'>← Voltar para Home</a></p>";
}

echo "</div>
</body>
</html>";
