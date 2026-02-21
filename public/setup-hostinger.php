<?php

/**
 * setup-hostinger.php
 * Script para automatizar o setup inicial do Laravel na Hostinger via navegador.
 */

// Habilitar reporte de erros para debug
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

define('SECRET_TOKEN', 'oodelivery_setup_2026'); // Proteção simples

echo "<h1>🚀 OoDelivery - Setup Hostinger (Modo Interno)</h1>";

if (!isset($_GET['token']) || $_GET['token'] !== SECRET_TOKEN) {
    die("<p style='color:red'>ERRO: Token inválido.</p>");
}

// 1. Verificar .env
if (!file_exists(__DIR__ . '/../.env')) {
    die("<p style='color:orange'>AVISO: Arquivo .env não encontrado na raiz!</p>");
}

// 2. Bootstrapar Laravel
try {
    require __DIR__ . '/../vendor/autoload.php';
    $app = require_once __DIR__ . '/../bootstrap/app.php';
    $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
} catch (Exception $e) {
    die("<p style='color:red'>Erro ao carregar o Laravel: " . $e->getMessage() . "</p>");
}

function run_artisan($kernel, $command, $params = [])
{
    echo "<h2>> Rodando: php artisan $command</h2>";
    echo "<pre style='background:#000; color:#0f0; padding:10px; border-radius:5px;'>";

    try {
        $status = $kernel->call($command, $params);
        echo Illuminate\Support\Facades\Artisan::output();
        if ($status === 0) {
            echo "\n[SUCESSO]";
        } else {
            echo "\n[ERRO CODE: $status]";
        }
    } catch (Exception $e) {
        echo "Exceção: " . $e->getMessage();
    }

    echo "</pre>";
}

// 3. Executar Comandos
$step = isset($_GET['step']) ? $_GET['step'] : 'all';

if ($step === 'all' || $step === 'key')
    run_artisan($kernel, 'key:generate', ['--force' => true]);
if ($step === 'all' || $step === 'migrate')
    run_artisan($kernel, 'migrate', ['--force' => true]);
if ($step === 'all' || $step === 'link')
    run_artisan($kernel, 'storage:link');
if ($step === 'all' || $step === 'cache') {
    run_artisan($kernel, 'config:cache');
    run_artisan($kernel, 'view:cache');
}

echo "<h2 style='color:green'>✅ Setup concluído!</h2>";
echo "<p><a href='/'>Clique aqui para acessar o site</a></p>";
echo "<p style='color:red'><strong>IMPORTANTE: Delete este arquivo (setup-hostinger.php) após o uso por segurança!</strong></p>";
