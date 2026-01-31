<?php
/**
 * Script para restaurar index.php se estiver faltando
 * URL: https://seu-dominio.com/restore_index.php
 */

$indexPath = __DIR__ . '/index.php';

// Conteúdo correto do index.php do Laravel
$correctIndex = <<<'PHP'
<?php
use Illuminate\Contracts\Http\Kernel;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.json')) {
    $maintenance = json_decode(file_get_contents($maintenance), true);

    if ($maintenance['time'] <= time()) {
        unlink($maintenance);
    } else {
        header('Retry-After: '.ceil(($maintenance['time'] - time()) / 60));
        header('Content-Type: text/plain; charset=UTF-8', true, 503);

        exit($maintenance['message'] ?? 'Application is in maintenance mode.');
    }
}

// Register the Composer autoloader...
require __DIR__.'/../vendor/autoload.php';

// Bootstrap Laravel and handle the request...
$app = require_once __DIR__.'/../bootstrap/app.php';

$kernel = $app->make(Kernel::class);

$response = $kernel->handle(
    $request = Request::capture()
)->send();

$kernel->terminate($request, $response);
PHP;

echo "<!DOCTYPE html>
<html>
<head><title>Restaurar index.php</title>
<style>body { font-family: Arial; padding: 20px; }</style>
</head>
<body>";

if (file_exists($indexPath)) {
    echo "<h1>✅ index.php já existe</h1>";
    echo "<p>Arquivo encontrado em: <code>$indexPath</code></p>";
} else {
    echo "<h1>⚠️ index.php faltando - Restaurando...</h1>";

    if (file_put_contents($indexPath, $correctIndex)) {
        echo "<h2 style='color: green;'>✅ Sucesso!</h2>";
        echo "<p>index.php foi restaurado com sucesso.</p>";
        echo "<p><a href='/'>Clique aqui para acessar o site</a></p>";
    } else {
        echo "<h2 style='color: red;'>❌ Erro ao restaurar</h2>";
        echo "<p>Não foi possível criar o arquivo. Verifique permissões de escrita.</p>";
    }
}

echo "<hr>";
echo "<p><strong>Próximas ações:</strong></p>";
echo "<ul>";
echo "<li>Acesse <a href='/clear_cache.php'>/clear_cache.php</a> para limpar caches</li>";
echo "<li>Visite <a href='/'>seu domínio</a> para verificar se está funcionando</li>";
echo "</ul>";

echo "</body></html>";

// Auto-delete after some time
register_shutdown_function(function() {
    if (file_exists(__FILE__)) {
        sleep(2); // Wait 2 seconds before deleting
        @unlink(__FILE__);
    }
});
?>
