<?php
/**
 * Script auxiliar para importar dados SQL manualmente
 * Use este script se o unzip_deploy.php tiver problemas ao importar dados
 *
 * URL: https://seu-dominio.com/setup_database.php
 */

set_time_limit(300);

echo "<!DOCTYPE html>
<html>
<head><title>Setup Database - ÓoDelivery</title>
<style>
body { font-family: Arial, sans-serif; padding: 30px; background: #f5f5f5; }
.container { background: white; padding: 20px; border-radius: 8px; max-width: 600px; margin: 0 auto; }
h1 { color: #333; }
.success { color: #22863a; padding: 10px; background: #f0f8f4; border-left: 4px solid #22863a; margin: 10px 0; }
.error { color: #cb2431; padding: 10px; background: #fef5f5; border-left: 4px solid #cb2431; margin: 10px 0; }
.info { color: #0366d6; padding: 10px; background: #f1f8ff; border-left: 4px solid #0366d6; margin: 10px 0; }
pre { background: #f5f5f5; padding: 10px; overflow: auto; }
</style>
</head>
<body>
<div class='container'>";

try {
    // 1. Verificar se arquivo SQL existe
    $sqlFile = file_exists(__DIR__ . '/database/hostinger_seed.sql')
        ? __DIR__ . '/database/hostinger_seed.sql'
        : __DIR__ . '/database/hostinger_data.sql';

    if (!file_exists($sqlFile)) {
        echo "<h1>⚠️ Arquivo não encontrado</h1>";
        echo "<div class='error'>";
        echo "<p>Nenhum arquivo de dados foi encontrado.</p>";
        echo "<p>Esperado: <code>database/hostinger_seed.sql</code> ou <code>database/hostinger_data.sql</code></p>";
        echo "<p>Certifique-se de que:</p>";
        echo "<ol>";
        echo "<li>O deploy foi feito corretamente</li>";
        echo "<li>Todos os arquivos foram descompactados</li>";
        echo "</ol>";
        echo "</div>";
        die("</div></body></html>");
    }

    // 2. Bootstrap do Laravel
    require_once __DIR__ . '/vendor/autoload.php';
    $app = require_once __DIR__ . '/bootstrap/app.php';

    echo "<h1>🗄️ Setup do Banco de Dados</h1>";
    echo "<p>Importando dados iniciais...</p>";

    // 3. Conectar ao banco
    try {
        $pdo = new PDO(
            'mysql:host=' . env('DB_HOST') . ';port=' . env('DB_PORT') . ';dbname=' . env('DB_DATABASE'),
            env('DB_USERNAME'),
            env('DB_PASSWORD'),
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
        );
        echo "<div class='success'>✅ Conectado ao banco de dados</div>";
    } catch (PDOException $e) {
        echo "<div class='error'>";
        echo "<strong>❌ Erro de conexão:</strong>";
        echo "<pre>" . htmlspecialchars($e->getMessage()) . "</pre>";
        echo "<p>Verifique as credenciais no arquivo <code>.env</code></p>";
        echo "</div>";
        die("</div></body></html>");
    }

    // 4. Ler e executar SQL
    $sqlContent = file_get_contents($sqlFile);

    // Remover comentários e espaços em branco extras
    $lines = explode("\n", $sqlContent);
    $sql = [];

    foreach ($lines as $line) {
        $line = trim($line);
        // Pular comentários e linhas vazias
        if (empty($line) || strpos($line, '--') === 0) {
            continue;
        }
        $sql[] = $line;
    }

    $cleanSql = implode("\n", $sql);
    $queries = array_filter(array_map('trim', explode(';', $cleanSql)));

    $successCount = 0;
    $errorCount = 0;
    $errors = [];

    echo "<p>Processando " . count($queries) . " queries...</p>";

    foreach ($queries as $index => $query) {
        if (empty($query)) continue;

        try {
            $pdo->exec($query);
            $successCount++;
        } catch (PDOException $e) {
            $errorCount++;
            $errorMsg = $e->getMessage();

            // Ignorar certos erros
            if (strpos($errorMsg, 'Duplicate') !== false) {
                $successCount++; // Contar como sucesso se for dado duplicado
            } else if (strpos($errorMsg, 'FOREIGN_KEY_CONSTRAINT_FAILS') === false) {
                $errors[] = [
                    'query' => substr($query, 0, 80) . '...',
                    'error' => $errorMsg
                ];
            }
        }
    }

    echo "<div class='success'>";
    echo "<strong>✅ Importação Concluída</strong><br>";
    echo "Queries executadas: <strong>$successCount</strong>";
    if ($errorCount > 0) {
        echo "<br>Erros: <strong>$errorCount</strong>";
    }
    echo "</div>";

    if (!empty($errors)) {
        echo "<div class='error'>";
        echo "<strong>⚠️ Alguns erros ocorreram:</strong>";
        echo "<ul>";
        foreach ($errors as $err) {
            echo "<li><code>" . htmlspecialchars($err['query']) . "</code>";
            echo "<br><small>" . htmlspecialchars($err['error']) . "</small></li>";
        }
        echo "</ul>";
        echo "</div>";
    }

    echo "<div class='info'>";
    echo "<strong>ℹ️ Próximos passos:</strong>";
    echo "<ol>";
    echo "<li>Verifique se os dados foram importados: <code>phpMyAdmin</code></li>";
    echo "<li>Acesse <code>/clear_cache.php</code> para limpar caches</li>";
    echo "<li>Visite seu site: <code>" . htmlspecialchars(env('APP_URL')) . "</code></li>";
    echo "</ol>";
    echo "</div>";

    // Auto-delete após 1 minuto (para segurança)
    echo "<hr>";
    echo "<p style='font-size: 12px; color: #666;'>";
    echo "Este script será removido automaticamente em alguns minutos por segurança.";
    echo "</p>";

} catch (Exception $e) {
    echo "<div class='error'>";
    echo "<strong>❌ Erro Geral:</strong>";
    echo "<pre>" . htmlspecialchars($e->getMessage() . "\n\n" . $e->getTraceAsString()) . "</pre>";
    echo "</div>";
}

echo "</div></body></html>";

// Auto-delete deste script
if (function_exists('unlink') && file_exists(__FILE__)) {
    register_shutdown_function(function() {
        if (file_exists(__FILE__)) {
            @unlink(__FILE__);
        }
    });
}
