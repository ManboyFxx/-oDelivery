<?php
// Script de Emergência para Instalar Dependências na Hostinger via Navegador
// Criado porque o acesso SSH não é viável para o usuário.

header('Content-Type: text/html; charset=utf-8');
set_time_limit(1200); // 20 minutos
ini_set('memory_limit', '1G'); // Memória generosa

echo "<!DOCTYPE html>
<html lang='pt-BR'>
<head>
    <meta charset='UTF-8'>
    <title>Instalador de Dependências - ÓoDelivery</title>
    <style>
        body { font-family: monospace; background: #1a1a1a; color: #0f0; padding: 20px; line-height: 1.4; }
        .error { color: #ff5555; }
        .success { color: #55ff55; font-weight: bold; }
        .info { color: #55ffff; }
        .container { max-width: 900px; margin: 0 auto; white-space: pre-wrap; word-wrap: break-word; }
        .loading { animation: blink 1s infinite; }
        @keyframes blink { 0% { opacity: 0.2; } 50% { opacity: 1; } 100% { opacity: 0.2; } }
    </style>
</head>
<body>
<div class='container'>
<h1>🛠️ Auto-Instalador de Dependências (Hostinger Fix)</h1>
";

// Função para exibir mensagem e forçar flush
function logLine($msg, $type = 'normal')
{
    $color = match ($type) {
        'error' => '#ff5555',
        'success' => '#55ff55',
        'info' => '#55ffff',
        default => '#cccccc'
    };
    echo "<div style='color: {$color}'>[" . date('H:i:s') . "] " . htmlspecialchars($msg) . "</div>";
    flush();
    @ob_flush();
}

// 1. Ir para a Raiz do Projeto (um nível acima de public)
$baseDir = dirname(__DIR__);
chdir($baseDir);

$outputDir = $baseDir . '/vendor';
$isInstalled = is_dir($outputDir) && file_exists($outputDir . '/autoload.php');

logLine("Diretório de Instalação: " . getcwd(), 'info');

// 2. Verificar Ambiente
logLine("Versão do PHP: " . phpversion(), 'normal');
if (!function_exists('exec')) {
    logLine("ERRO CRÍTICO: exec() está desabilitado na Hostinger. Ative no painel PHP Configuration.", 'error');
    die("</body></html>");
}

// 3. Baixar Composer.phar se não existir
if (!file_exists('composer.phar')) {
    logLine("Baixando composer.phar...", 'info');

    // Método 1: curl
    exec('curl -sS https://getcomposer.org/installer | php -- --install-dir=' . $baseDir . ' --filename=composer.phar', $out, $ret);

    if (!file_exists('composer.phar')) {
        // Método 2: copy
        if (@copy('https://getcomposer.org/installer', 'composer-setup.php')) {
            logLine("Instalador PHP executando...", 'normal');
            exec('php composer-setup.php', $out2, $ret2);
            @unlink('composer-setup.php');
        }
    }
}

if (!file_exists('composer.phar')) {
    logLine("FALHA: Não foi possível baixar composer.phar. Tente fazer upload manual dele para a raiz.", 'error');
    die("</body></html>");
} else {
    logLine("Composer encontrado na raiz.", 'success');
}


// 4. Executar Instalação
logLine("--- INICIANDO INSTALAÇÃO (Isso pode demorar...) ---", 'info');
$cmd = 'php composer.phar install --no-dev --optimize-autoloader --no-interaction 2>&1';

// Capturar saída em tempo real se possível, senão bufferizar
$descriptorspec = [
    0 => ["pipe", "r"],  // stdin
    1 => ["pipe", "w"],  // stdout
    2 => ["pipe", "w"]   // stderr
];

$process = proc_open($cmd, $descriptorspec, $pipes, $baseDir, ['COMPOSER_HOME' => $baseDir . '/.composer_temp']);

if (is_resource($process)) {
    fclose($pipes[0]);

    while (!feof($pipes[1])) {
        echo fgets($pipes[1]);
        flush();
        @ob_flush();
    }
    fclose($pipes[1]);

    // Ler erro
    $errOut = stream_get_contents($pipes[2]);
    fclose($pipes[2]);

    $return_value = proc_close($process);

    if ($return_value === 0) {
        logLine("\n\n✅ INSTALAÇÃO CONCLUÍDA COM SUCESSO!", 'success');

        // Otimizar Laravel
        logLine("Limpando caches do Laravel...", 'info');
        exec('php artisan config:clear');
        exec('php artisan cache:clear');
        exec('php artisan route:clear');

        // Tentar rodar Migrations (caso precise)
        logLine("Rodando Migrations...", 'info');
        echo "<pre>";
        passthru('php artisan migrate --force');
        echo "</pre>";

        echo "<h2 style='color: #fff; margin-top: 20px;'>👉 <a href='/' style='color:#55ff55; font-size: 24px;'>CLIQUE AQUI PARA ABRIR O SITE</a></h2>";

    } else {
        logLine("\n\n❌ ERRO NA INSTALAÇÃO (Código $return_value)", 'error');
        echo "<pre style='color:#faa'>$errOut</pre>";
        logLine("Tente recarregar a página.", 'info');
    }
} else {
    logLine("Não foi possível iniciar o processo do Composer.", 'error');
}

echo "</div></body></html>";
?>