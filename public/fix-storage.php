<?php
/**
 * fix-storage.php
 * Script para corrigir o link simbólico do storage na Hostinger usando caminhos ABSOLUTOS.
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>🛠️ OoDelivery - Fix Storage Link (Absolute Path)</h1>";

// Caminhos absolutos baseados no ambiente real
$publicStorage = __DIR__ . '/storage';
$targetStorage = __DIR__ . '/../storage/app/public';

// Normalizar caminhos para garantir que são absolutos e reais
$targetStorage = realpath($targetStorage);

echo "ℹ️ Verificando caminhos...<br>";
echo "Public Storage (Link): <code>$publicStorage</code><br>";
echo "Target Storage (Destino): <code>$targetStorage</code><br>";

if (!$targetStorage) {
    die("<p style='color:red'>❌ ERRO: O diretório de destino não foi encontrado! Verifique se 'storage/app/public' existe na raiz do projeto.</p>");
}

// 1. Remover o que houver no caminho do link
if (file_exists($publicStorage) || is_link($publicStorage)) {
    echo "ℹ️ Removendo link/diretório de storage existente...<br>";
    if (is_link($publicStorage)) {
        unlink($publicStorage);
    } else {
        // Se for uma pasta real (comum em erros de deploy), removemos o conteúdo e a pasta
        function deleteDir($dirPath)
        {
            if (!is_dir($dirPath))
                return;
            $files = array_diff(scandir($dirPath), array('.', '..'));
            foreach ($files as $file) {
                (is_dir("$dirPath/$file")) ? deleteDir("$dirPath/$file") : unlink("$dirPath/$file");
            }
            return rmdir($dirPath);
        }
        deleteDir($publicStorage);
    }
    echo "✅ Item antigo removido.<br>";
}

// 2. Criar o link simbólico usando caminho absoluto
echo "ℹ️ Tentando criar link simbólico...<br>";
if (symlink($targetStorage, $publicStorage)) {
    echo "<h2 style='color:green'>✅ SUCESSO! O link de storage foi criado corretamente.</h2>";
} else {
    echo "<h2 style='color:red'>❌ FALHA ao criar link simbólico.</h2>";
    echo "<p>Tentando comando de sistema como alternativa...</p>";
    @exec("ln -s $targetStorage $publicStorage");

    if (is_link($publicStorage)) {
        echo "<h2 style='color:green'>✅ SUCESSO (via comando de sistema)!</h2>";
    } else {
        echo "<p style='color:orange'>⚠️ O servidor não permitiu criar o link. O sistema tentará usar o StorageController automático.</p>";
    }
}

// 3. Verificação Final
echo "<h3>Verificação Final:</h3>";
if (is_link($publicStorage)) {
    echo "Status: <b style='color:green'>LINK ATIVO</b><br>";
    echo "Aponta para: <code>" . readlink($publicStorage) . "</code><br>";
} else {
    echo "Status: <b style='color:red'>LINK NÃO CRIADO</b><br>";
}

echo "<p><br><a href='/'>Voltar para o site</a></p>";
?>