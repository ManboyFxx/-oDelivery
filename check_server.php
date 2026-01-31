<?php
/**
 * Script de Diagnóstico para Hostinger
 * Upload para public_html/check_server.php
 * Acesse: https://seusite.com/check_server.php
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>🕵️ Diagnóstico do Servidor</h1>";

// 1. Check PHP Version
echo "<h2>1. Versão do PHP</h2>";
echo "Versão Atual: " . phpversion() . "<br>";
if (version_compare(phpversion(), '8.2', '<')) {
    echo "❌ <b>ERRO:</b> Versão inferior a 8.2. Atualize no painel da Hostinger.<br>";
} else {
    echo "✅ Versão OK.<br>";
}

// 2. Check Critical Files
echo "<h2>2. Arquivos Essenciais</h2>";
$files = [
    'vendor/autoload.php' => 'Pasta Vendor (Bibliotecas)',
    '.env' => 'Arquivo de Configuração (.env)',
    'bootstrap/app.php' => 'Bootstrap Laravel',
    // Check root index OR public index
    'index.php' => 'Entrypoint (index.php)'
];

foreach ($files as $path => $name) {
    if (file_exists(__DIR__ . '/' . $path)) {
        echo "✅ $name encontrado.<br>";
    } else {
        echo "❌ <b>ERRO:</b> $name NÃO encontrado em <code>" . __DIR__ . '/' . $path . "</code><br>";
    }
}

// 3. Check Permissions
echo "<h2>3. Permissões de Escrita</h2>";
$infos = [
    'storage' => 'Pasta Storage',
    'storage/logs' => 'Logs',
    'storage/framework/views' => 'Cache de Views',
    'bootstrap/cache' => 'Cache de Inicialização'
];

foreach ($infos as $path => $name) {
    $fullPath = __DIR__ . '/' . $path;

    // Create if not exists (try)
    if (!file_exists($fullPath)) {
        echo "⚠️ $name não existe. Tentando criar... ";
        @mkdir($fullPath, 0775, true);
    }

    if (is_writable($fullPath)) {
        echo "✅ $name é gravável.<br>";
    } else {
        echo "❌ <b>ERRO:</b> $name NÃO é gravável. Permissão atual: " . substr(sprintf('%o', fileperms($fullPath)), -4) . "<br>";
        echo "👉 Solução: Defina permissão <b>777</b> nesta pasta.<br>";
    }
}

echo "<h2>4. Teste de Autoload</h2>";
try {
    if (file_exists(__DIR__ . '/vendor/autoload.php')) {
        require __DIR__ . '/vendor/autoload.php';
        echo "✅ Autoload carregado com sucesso.<br>";
    } else {
        echo "❌ Pulei o teste de autoload (arquivo não existe).<br>";
    }
} catch (\Throwable $e) {
    echo "❌ Erro ao carregar autoload: " . $e->getMessage() . "<br>";
}

echo "<hr><br>Se todos os itens acima estiverem ✅, o problema pode estar no banco de dados ou no arquivo .env.";
