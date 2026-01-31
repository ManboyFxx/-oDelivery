<?php
/**
 * Script de Diagnóstico - ÓoDelivery
 * URL: https://seu-dominio.com/diagnose.php
 */

echo "<!DOCTYPE html>
<html>
<head><title>Diagnóstico - ÓoDelivery</title>
<style>
body { font-family: Arial; padding: 20px; background: #f5f5f5; }
.container { background: white; padding: 20px; border-radius: 8px; max-width: 800px; }
.ok { color: #22863a; padding: 10px; background: #f0f8f4; border-left: 4px solid #22863a; margin: 10px 0; }
.error { color: #cb2431; padding: 10px; background: #fef5f5; border-left: 4px solid #cb2431; margin: 10px 0; }
.warning { color: #bf8700; padding: 10px; background: #fff8c5; border-left: 4px solid #bf8700; margin: 10px 0; }
h2 { border-bottom: 2px solid #0366d6; padding-bottom: 10px; }
code { background: #f1f1f1; padding: 2px 5px; border-radius: 3px; }
</style>
</head>
<body>
<div class='container'>
<h1>🔍 Diagnóstico - ÓoDelivery</h1>";

// 1. Verificar arquivos essenciais
echo "<h2>📂 Arquivos Essenciais</h2>";

$files = [
    '../index.php' => 'index.php (Laravel Entry)',
    './.htaccess' => '.htaccess (Rewrite Rules)',
    '../.env' => '.env (Configuração)',
    '../storage' => 'storage/ (Pasta)',
    '../bootstrap/cache' => 'bootstrap/cache/ (Pasta)',
];

foreach ($files as $path => $label) {
    if (file_exists($path)) {
        echo "<div class='ok'>✅ $label - Encontrado</div>";
    } else {
        echo "<div class='error'>❌ $label - NÃO ENCONTRADO</div>";
    }
}

// 2. Verificar permissões
echo "<h2>🔐 Permissões de Pastas</h2>";

$dirs = [
    '../storage' => 'storage',
    '../bootstrap/cache' => 'bootstrap/cache',
];

foreach ($dirs as $path => $label) {
    if (is_dir($path)) {
        $perms = substr(sprintf('%o', fileperms($path)), -4);
        $writable = is_writable($path) ? '✅ Writable' : '❌ NOT WRITABLE';
        echo "<div class='warning'>📁 $label: Permissões $perms - $writable</div>";
    }
}

// 3. Verificar .env
echo "<h2>⚙️ Configuração .env</h2>";

if (file_exists('../.env')) {
    $env = file_get_contents('../.env');

    $checks = [
        'APP_KEY' => preg_match('/APP_KEY=/', $env),
        'DB_HOST' => preg_match('/DB_HOST=/', $env),
        'DB_DATABASE' => preg_match('/DB_DATABASE=/', $env),
        'DB_USERNAME' => preg_match('/DB_USERNAME=/', $env),
        'DB_PASSWORD' => preg_match('/DB_PASSWORD=/', $env),
    ];

    foreach ($checks as $key => $exists) {
        echo $exists
            ? "<div class='ok'>✅ $key configurado</div>"
            : "<div class='error'>❌ $key faltando</div>";
    }
} else {
    echo "<div class='error'>❌ Arquivo .env não encontrado</div>";
}

// 4. Carregar .env
echo "<h2>🗄️ Banco de Dados</h2>";

$envFile = '../.env';
$env = [];

if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos($line, '=') !== false && $line[0] !== '#') {
            [$key, $value] = explode('=', $line, 2);
            $env[trim($key)] = trim($value, '"\'');
        }
    }
}

$dbHost = $env['DB_HOST'] ?? 'localhost';
$dbDatabase = $env['DB_DATABASE'] ?? '';
$dbUsername = $env['DB_USERNAME'] ?? '';
$dbPassword = $env['DB_PASSWORD'] ?? '';

echo "<div class='warning'>📋 Credenciais encontradas:</div>";
echo "<code>Host: $dbHost | DB: $dbDatabase | User: $dbUsername</code><br><br>";

try {
    $pdo = new PDO(
        "mysql:host=$dbHost;dbname=$dbDatabase",
        $dbUsername,
        $dbPassword,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    echo "<div class='ok'>✅ Conexão com banco bem-sucedida</div>";

    // Verificar tabelas
    $result = $pdo->query("SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = '$dbDatabase'");
    $tables = $result->fetch(PDO::FETCH_ASSOC)['count'];
    echo "<div class='ok'>✅ $tables tabelas encontradas</div>";

} catch (Exception $e) {
    echo "<div class='error'>❌ Erro de conexão: " . htmlspecialchars($e->getMessage()) . "</div>";
    echo "<div class='warning'>";
    echo "<strong>Solução:</strong><br>";
    echo "1. Verifique as credenciais no cPanel MySQL<br>";
    echo "2. Edite o arquivo .env com as credenciais corretas<br>";
    echo "3. Acesse novamente esta página<br>";
    echo "</div>";
}

// 5. Solução
echo "<h2>🔧 Se tiver erro 403, faça:</h2>";
echo "<div class='warning'>";
echo "1. Via cPanel Terminal/SSH:<br>";
echo "<code>chmod -R 755 storage bootstrap/cache</code><br><br>";
echo "2. Ou via cPanel File Manager:<br>";
echo "- Clique com botão direito em <code>storage/</code><br>";
echo "- Clique em <code>Change Permissions</code><br>";
echo "- Defina para <code>755</code><br>";
echo "- Repita para <code>bootstrap/cache/</code><br>";
echo "</div>";

echo "<hr>";
echo "<p><strong>Se ainda tiver problemas, acesse:</strong><br>";
echo "<code>https://seu-dominio.com/clear_cache.php</code></p>";

echo "</div></body></html>";
?>
