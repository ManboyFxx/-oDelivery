<?php
/**
 * fix-storage.php
 * Script para corrigir o symlink do storage na Hostinger.
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>🛠️ OoDelivery - Fix Storage Link</h1>";

$storage_link = __DIR__ . '/storage';
$target = __DIR__ . '/../storage/app/public';

// 1. Verificar se o alvo existe
if (!file_exists($target)) {
    echo "<p style='color:red'>❌ ERRO: O diretório alvo ($target) não existe!</p>";
    // Tenta criar se não existir
    if (mkdir($target, 0755, true)) {
        echo "<p style='color:green'>✅ Diretório alvo criado com sucesso.</p>";
    } else {
        die("<p style='color:red'>Falha crítica: Não foi possível criar o diretório de destino.</p>");
    }
}

// 2. Resolver pasta física se existir
if (file_exists($storage_link) && !is_link($storage_link)) {
    echo "<p style='color:orange'>⚠️ AVISO: Existe uma pasta física em 'public/storage'. Vou tentar renomeá-la.</p>";
    $backup_name = $storage_link . '_backup_' . time();
    if (rename($storage_link, $backup_name)) {
        echo "<p style='color:green'>✅ Pasta física renomeada para: " . basename($backup_name) . "</p>";
    } else {
        die("<p style='color:red'>❌ ERRO: Não foi possível renomear a pasta física. Delete-a manualmente via FTP.</p>");
    }
}

// 3. Remover link quebrado se existir
if (is_link($storage_link)) {
    echo "<p style='color:blue'>ℹ️ Removendo link de storage existente...</p>";
    if (unlink($storage_link)) {
        echo "<p style='color:green'>✅ Link removido.</p>";
    }
}

// 4. Criar o link simbólico
try {
    if (symlink($target, $storage_link)) {
        echo "<h2 style='color:green'>✅ SUCESSO! O link de storage foi criado corretamente.</h2>";
    } else {
        echo "<h2 style='color:red'>❌ FALHA ao criar symlink via PHP.</h2>";
    }
} catch (Exception $e) {
    echo "<p style='color:red'>Erro exception: " . $e->getMessage() . "</p>";
}

echo "<h3>Verificação Final:</h3>";
if (is_link($storage_link)) {
    echo "<p>Status: <strong>LINK ATIVO</strong></p>";
    echo "<p>Aponta para: <strong>" . readlink($storage_link) . "</strong></p>";
} else {
    echo "<p style='color:red'>Status: <strong>FALHA</strong> (Não é um link)</p>";
}

echo "<p><br><a href='/'>Voltar para o site</a></p>";
echo "<p style='color:red'><strong>IMPORTANTE: Delete este arquivo (fix-storage.php) após o uso!</strong></p>";
?>