<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle($request = Illuminate\Http\Request::capture());

echo "<h1>🔍 Debug WebP 404</h1>";

$file = 'media/d1e6743b-8106-4e3c-b7c4-9d6bb8bb771d/efc6cb88-b22b-4683-b7db-f297e70c9350.webp';

$paths = [
    'Storage path' => storage_path('app/public/' . $file),
    'Public symlink path' => public_path('storage/' . $file),
];

foreach ($paths as $name => $path) {
    echo "<h3>$name:</h3>";
    echo "<p>Path: <code>$path</code></p>";
    if (file_exists($path)) {
        $perms = substr(sprintf('%o', fileperms($path)), -4);
        echo "<p style='color:green'>✅ EXISTE (Perms: $perms)</p>";
        echo "<p>Size: " . filesize($path) . " bytes</p>";
    } else {
        echo "<p style='color:red'>❌ NÃO EXISTE</p>";
        $parent = dirname($path);
        if (file_exists($parent)) {
            echo "<p>Pasta pai existe. Conteúdo:</p><ul>";
            $files = scandir($parent);
            foreach ($files as $f)
                echo "<li>$f</li>";
            echo "</ul>";
        }
    }
}
