<?php
// Mostrar todos os erros
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

echo "<h2>🔍 Debug de Erros</h2>";

// 1. Verificar .env
$envFile = __DIR__ . '/.env';
echo "<h3>1. Arquivo .env:</h3>";
if(file_exists($envFile)) {
    echo "✅ Arquivo existe<br>";
    echo "Tamanho: " . filesize($envFile) . " bytes<br>";
} else {
    echo "❌ Arquivo NÃO existe!<br>";
}

// 2. Verificar .htaccess
echo "<h3>2. Arquivo .htaccess:</h3>";
$htaccess = __DIR__ . '/.htaccess';
if(file_exists($htaccess)) {
    echo "✅ Arquivo existe<br>";
} else {
    echo "❌ Arquivo NÃO existe!<br>";
}

// 3. Verificar pasta public
echo "<h3>3. Pasta public:</h3>";
$publicDir = __DIR__ . '/public';
if(is_dir($publicDir)) {
    echo "✅ Pasta existe<br>";
    $indexFile = $publicDir . '/index.php';
    if(file_exists($indexFile)) {
        echo "✅ index.php existe em public/<br>";
    } else {
        echo "❌ index.php NÃO existe em public/<br>";
    }
} else {
    echo "❌ Pasta public NÃO existe!<br>";
}

// 4. Tentar ler logs SEM shell_exec
echo "<h3>4. Logs do Laravel:</h3>";
$logFile = __DIR__ . '/storage/logs/laravel.log';
if(file_exists($logFile)) {
    echo "✅ Log existe<br>";
    $content = file_get_contents($logFile);
    $lines = array_reverse(explode("\n", $content));
    $lastLines = implode("\n", array_slice($lines, 0, 30));
    echo "<pre style='background: #f0f0f0; padding: 10px; overflow: auto; max-height: 400px; color: #d32f2f;'>";
    echo htmlspecialchars($lastLines);
    echo "</pre>";
} else {
    echo "❌ Log NÃO encontrado<br>";
}

// 5. Carregar o Laravel e capturar erro
echo "<h3>5. Tentando carregar Laravel:</h3>";
try {
    require __DIR__ . '/vendor/autoload.php';
    echo "✅ Autoload carregado<br>";

    $app = require __DIR__ . '/bootstrap/app.php';
    echo "✅ App bootstrap carregado<br>";
} catch(Throwable $e) {
    echo "❌ Erro ao carregar: " . $e->getMessage() . "<br>";
    echo "<pre style='background: #f0f0f0; padding: 10px; color: #d32f2f;'>";
    echo htmlspecialchars($e->getTraceAsString());
    echo "</pre>";
}
?>
