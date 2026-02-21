<?php
/**
 * debug-paths.php
 * Script para verificar a existência de arquivos e caminhos no servidor.
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

// Bootstrap Laravel
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

echo "<h1>🔍 OoDelivery - Debug Paths (Bootstrapped)</h1>";

$pathToCheck = 'media/d1e6743b-8106-4e3c-b7c4-9d6bb8bb771d/8e2cf7bd-b8ff-418b-8f0d-fac77c038910.png';

$paths = [
    'Storage Path (storage_path)' => storage_path('app/public/' . $pathToCheck),
    'Base Path Storage' => base_path('storage/app/public/' . $pathToCheck),
    'Public Path Storage' => public_path('storage/' . $pathToCheck),
    'Manual Relative Path' => __DIR__ . '/storage/' . $pathToCheck,
    'Manual Base Path Storage' => __DIR__ . '/../storage/app/public/' . $pathToCheck,
];

foreach ($paths as $name => $path) {
    echo "<h3>$name:</h3>";
    echo "<p>Caminho: <code>$path</code></p>";
    if (file_exists($path)) {
        $perms = fileperms($path);
        echo "<p style='color:green'>✅ EXISTE (Permissões: " . substr(sprintf('%o', $perms), -4) . ")</p>";
        echo "<p>Tamanho: " . filesize($path) . " bytes</p>";
    } else {
        echo "<p style='color:red'>❌ NÃO EXISTE</p>";

        // Verificar níveis acima para ver onde quebra
        $parts = explode('/', ltrim($path, '/'));
        $current = '/';
        echo "<p>Rastreando subpastas:</p><ul>";
        foreach ($parts as $part) {
            if (empty($part))
                continue;
            $next = $current . $part . '/';
            if (file_exists($next)) {
                $p = fileperms($next);
                echo "<li>✅ $next (Perms: " . substr(sprintf('%o', $p), -4) . ")</li>";
                $current = $next;
            } else {
                echo "<li style='color:red'>❌ " . $current . $part . " (NÃO ENCONTRADO)</li>";
                break;
            }
        }
        echo "</ul>";
    }
}

echo "<h3>Configurações Adicionais:</h3>";
echo "<p>APP_URL: " . config('app.url') . "</p>";
echo "<p>FILESYSTEM_DISK: " . config('filesystems.default') . "</p>";

echo "<p><br><a href='/'>Voltar</a></p>";
?>