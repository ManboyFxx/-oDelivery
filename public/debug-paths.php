<?php
/**
 * debug-paths.php
 * Script para verificar a existência de arquivos e caminhos no servidor.
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>🔍 OoDelivery - Debug Paths</h1>";

$pathToCheck = 'media/d1e6743b-8106-4e3c-b7c4-9d6bb8bb771d/8e2cf7bd-b8ff-418b-8f0d-fac77c038910.png';

$paths = [
    'Storage Path' => storage_path('app/public/' . $pathToCheck),
    'Base Path Storage' => base_path('storage/app/public/' . $pathToCheck),
    'Public Path Storage' => public_path('storage/' . $pathToCheck),
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
            $files = scandir($parent);
            foreach ($files as $file) {
                if ($file != '.' && $file != '..') {
                    echo "<li>$file</li>";
                }
            }
            echo "</ul>";
        } else {
            echo "<p style='color:red'>❌ Pasta pai TAMBÉM não existe.</p>";
        }
    }
}

echo "<h3>Configurações de URL:</h3>";
echo "<p>APP_URL: " . env('APP_URL') . "</p>";
echo "<p>ASSET_URL: " . env('ASSET_URL') . "</p>";

echo "<p><br><a href='/'>Voltar</a></p>";
?>