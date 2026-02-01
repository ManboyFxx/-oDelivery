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

    // 6. Verificar tabelas específicas (CRUD Check)
    echo "<h2>📊 Verificação de Tabelas (CRUD)</h2>";
    $tablesToCheck = [
        'users',
        'tenants',
        'whatsapp_instances',
        'whatsapp_templates',
        'whatsapp_message_logs',
        'migrations',
        'sessions',
        'cache'
    ];

    foreach ($tablesToCheck as $table) {
        $exists = $pdo->query("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '$dbDatabase' AND table_name = '$table'")->fetchColumn();
        if ($exists) {
            echo "<div class='ok'>✅ Tabela <b>$table</b> existe.</div>";

            // List columns found
            try {
                $columns = $pdo->query("DESCRIBE $table")->fetchAll(PDO::FETCH_COLUMN);
                $colsList = implode(', ', $columns);
                echo "<div style='margin-left:20px; font-size:12px; color:#555;'>Columns: $colsList</div>";
            } catch (Exception $e) {
                echo "<div class='error'>❌ Erro ao ler colunas: " . $e->getMessage() . "</div>";
            }

            // Check content count
            try {
                $count = $pdo->query("SELECT COUNT(*) FROM $table")->fetchColumn();
                echo "<div style='margin-left:20px; color:#666;'>Rows: $count</div>";
            } catch (Exception $e) {
                echo "<div class='error'>❌ Erro ao ler tabela $table: " . $e->getMessage() . "</div>";
            }

        } else {
            // Non-critical tables
            if ($table === 'sessions' || $table === 'cache') {
                echo "<div class='warning'>⚠️ Tabela <b>$table</b> não existe (Problema se SESSION_DRIVER/CACHE_STORE=database)</div>";
            } else {
                echo "<div class='error'>❌ Tabela <b>$table</b> NÃO EXISTE (Crítico!)</div>";
            }
        }
    }

    // 8. Session & Auth Debug
    echo "<h2>🍪 Session & Auth Debug</h2>";
    echo "<strong>Configuração .env:</strong><br>";
    echo "APP_URL: " . ($env['APP_URL'] ?? 'N/A') . "<br>";
    echo "SESSION_DRIVER: " . ($env['SESSION_DRIVER'] ?? 'N/A') . "<br>";
    echo "SESSION_DOMAIN: " . ($env['SESSION_DOMAIN'] ?? 'N/A') . "<br>";
    echo "SANCTUM_STATEFUL_DOMAINS: " . ($env['SANCTUM_STATEFUL_DOMAINS'] ?? 'N/A') . "<br>";

    // Check storage for sessions if file driver
    if (($env['SESSION_DRIVER'] ?? 'file') === 'file') {
        $sessionPath = '../storage/framework/sessions';
        if (is_writable($sessionPath)) {
            echo "<div class='ok'>✅ Folder storage/framework/sessions executável.</div>";
        } else {
            echo "<div class='error'>❌ Folder storage/framework/sessions NÃO é gravável!</div>";
        }
    }

    // 7. Últimas Migrations
    echo "<h2>📜 Últimas Migrações Rodadas</h2>";
    try {
        $stmt = $pdo->query("SELECT migration, batch FROM migrations ORDER BY id DESC LIMIT 10");
        $migrations = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo "<table border='1' cellpadding='5' style='border-collapse:collapse; width:100%;'>";
        echo "<tr style='background:#ddd;'><th>Migration</th><th>Batch</th></tr>";
        foreach ($migrations as $m) {
            echo "<tr><td>{$m['migration']}</td><td>{$m['batch']}</td></tr>";
        }
        echo "</table>";
    } catch (Exception $e) {
        echo "<div class='error'>❌ Erro ao ler migrations: " . $e->getMessage() . "</div>";
    }

} catch (Exception $e) {
    echo "<div class='error'>❌ Erro de conexão: " . htmlspecialchars($e->getMessage()) . "</div>";
    // ... (rest of error handling)
}

// ... (rest of file)
echo "</div></body></html>";
?>