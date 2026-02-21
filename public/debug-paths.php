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
        echo "<p style='color:green'>✅ EXISTE</p>";
        echo "<p>Tamanho: " . filesize($path) . " bytes</p>";
    } else {
        echo "<p style='color:red'>❌ NÃO EXISTE</p>";

        // Se não existe, vamos listar o conteúdo da pasta pai
        $parent = dirname($path);
        echo "<p>Verificando pasta pai: <code>$parent</code></p>";
        if (file_exists($parent)) {
            echo "<p style='color:green'>✅ Pasta pai existe. Conteúdo:</p><ul>";
            try {
                $files = scandir($parent);
                foreach ($files as $file) {
                    if ($file != '.' && $file != '..') {
                        echo "<li>$file</li>";
                    }
                }
            } catch (Exception $e) {
                echo "<li>Erro ao listar: " . $e->getMessage() . "</li>";
            }
            echo "</ul>";
        } else {
            echo "<p style='color:red'>❌ Pasta pai TAMBÉM não existe.</p>";
        }
    }
}

echo "<h3>Configurações Adicionais:</h3>";
echo "<p>APP_URL: " . config('app.url') . "</p>";
echo "<p>FILESYSTEM_DISK: " . config('filesystems.default') . "</p>";

echo "<p><br><a href='/'>Voltar</a></p>";
?>