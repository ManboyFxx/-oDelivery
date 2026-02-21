<?php

/**
 * setup-hostinger.php
 * Script para automatizar o setup inicial do Laravel na Hostinger via navegador.
 */

define('SECRET_TOKEN', 'oodelivery_setup_2026'); // Proteção simples

echo "<h1>🚀 OoDelivery - Setup Hostinger</h1>";

if (!isset($_GET['token']) || $_GET['token'] !== SECRET_TOKEN) {
    die("<p style='color:red'>ERRO: Token inválido. Use ?token=" . SECRET_TOKEN . " na URL.</p>");
}

function run_command($command)
{
    echo "<h2>> Rodando: php artisan $command</h2>";
    echo "<pre style='background:#000; color:#0f0; padding:10px; border-radius:5px;'>";

    // Tenta rodar via shell_exec ou via Artisan::call se disponível
    try {
        $output = shell_exec("php artisan $command 2>&1");
        if ($output) {
            echo $output;
        } else {
            echo "Comando executado (sem saída direta). Verifique o banco.";
        }
    } catch (Exception $e) {
        echo "Erro ao executar: " . $e->getMessage();
    }

    echo "</pre>";
}

// 1. Verificar .env
if (!file_exists('.env')) {
    die("<p style='color:orange'>AVISO: Arquivo .env não encontrado. Crie o arquivo primeiro!</p>");
}

// 2. Executar Comandos
run_command('key:generate --force');
run_command('migrate --force');
run_command('storage:link');
run_command('config:cache');
run_command('view:cache');

echo "<h2 style='color:green'>✅ Setup concluído!</h2>";
echo "<p><a href='/'>Clique aqui para acessar o site</a></p>";
echo "<p style='color:red'><strong>IMPORTANTE: Delete este arquivo (setup-hostinger.php) após o uso por segurança!</strong></p>";
