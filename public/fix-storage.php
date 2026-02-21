<?php
/**
 * fix-storage.php - V3 (AGGRESSIVE)
 * Script para garantir o symlink absoluto na Hostinger.
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>🛠️ OoDelivery - Persistent Storage Fixer</h1>";

$publicStorage = __DIR__ . '/storage';
$targetStorage = realpath(__DIR__ . '/../storage/app/public');

echo "ℹ️ Analisando caminhos...<br>";
echo "Public Folder: <code>$publicStorage</code><br>";
echo "Target Folder: <code>$targetStorage</code><br>";

if (!$targetStorage) {
    die("<p style='color:red'>❌ ERRO CRÍTICO: Pasta 'storage/app/public' não encontrada. Verifique os arquivos via FTP.</p>");
}

// 1. LIMPEZA AGRESSIVA
if (file_exists($publicStorage) || is_link($publicStorage)) {
    echo "⚠️ Encontrando item existente em 'public/storage'... ";
    if (is_link($publicStorage)) {
        echo "É um link. Removendo... ";
        unlink($publicStorage);
    } else {
        echo "É uma PASTA FÍSICA. Deletando conteúdo... ";
        function rrmdir($dir)
        {
            if (is_dir($dir)) {
                $objects = scandir($dir);
                foreach ($objects as $object) {
                    if ($object != "." && $object != "..") {
                        if (is_dir($dir . DIRECTORY_SEPARATOR . $object) && !is_link($dir . "/" . $object))
                            rrmdir($dir . DIRECTORY_SEPARATOR . $object);
                        else
                            unlink($dir . DIRECTORY_SEPARATOR . $object);
                    }
                }
                rmdir($dir);
            }
        }
        rrmdir($publicStorage);
    }
    echo "✅ Limpo.<br>";
}

// 2. CRIAÇÃO DO LINK ABSOLUTO
echo "ℹ️ Criando link simbólico absoluto... ";
if (symlink($targetStorage, $publicStorage)) {
    echo "<b style='color:green'>SUCESSO!</b><br>";
} else {
    echo "<b style='color:red'>FALHA via symlink().</b> Tentando comando de sistema... ";
    @exec("ln -s $targetStorage $publicStorage");
    if (is_link($publicStorage)) {
        echo "<b style='color:green'>SUCESSO (via exec)!</b><br>";
    } else {
        echo "<b style='color:red'>FALHA TOTAL.</b> O servidor não permite links.<br>";
    }
}

// 3. TESTE DE ACESSO
echo "<h3>🧪 Teste de Acesso:</h3>";
if (is_link($publicStorage)) {
    $testFile = 'media/d1e6743b-8106-4e3c-b7c4-9d6bb8bb771d/efc6cb88-b22b-4683-b7db-f297e70c9350.webp';
    $fullTestPath = $publicStorage . '/' . $testFile;

    echo "Verificando arquivo específico: <code>$testFile</code><br>";
    if (file_exists($fullTestPath)) {
        echo "<h2 style='color:green'>✅ TUDO OK! O arquivo é visível através do link.</h2>";
        echo "<p>Por favor, limpe o cache do seu navegador (Ctrl+F5) e verifique o site.</p>";
    } else {
        echo "<h2 style='color:orange'>⚠️ O link existe, mas o arquivo NÃO foi encontrado dentro dele.</h2>";
        echo "Caminho tentado: <code>$fullTestPath</code>";
    }
}

echo "<p><br><a href='/'>Voltar para o site</a></p>";
?>