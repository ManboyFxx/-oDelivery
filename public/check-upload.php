<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

echo "<h1>🔍 Diagnóstico de Upload de Imagem</h1>";
echo "<a href='/'>← Voltar</a><br><br>";

// === 1. PHP Upload Limits ===
echo "<h2>1. Limites PHP</h2><table border='1' cellpadding='6'>";
$checks = [
    'upload_max_filesize' => ini_get('upload_max_filesize'),
    'post_max_size' => ini_get('post_max_size'),
    'max_file_uploads' => ini_get('max_file_uploads'),
    'memory_limit' => ini_get('memory_limit'),
    'file_uploads' => ini_get('file_uploads'),
    'max_execution_time' => ini_get('max_execution_time') . 's',
];
foreach ($checks as $key => $value) {
    $ok = ($key === 'file_uploads') ? ($value == '1') : true;
    $color = $ok ? 'green' : 'red';
    echo "<tr><td><b>$key</b></td><td style='color:$color'>$value</td></tr>";
}
echo "</table>";

// === 2. Storage Directories ===
echo "<h2>2. Pastas de Storage</h2><table border='1' cellpadding='6'>";
$base = __DIR__ . '/../storage/app/public';
$dirs = [
    'storage/app/public' => $base,
    'storage/app/public/products' => $base . '/products',
    'storage/app/public/categories' => $base . '/categories',
];
foreach ($dirs as $label => $path) {
    $exists = file_exists($path) ? '✅ Existe' : '❌ Não existe';
    $writable = is_writable($path) ? '✅ Gravável' : '⚠️ Não gravável';
    $perms = file_exists($path) ? substr(sprintf('%o', fileperms($path)), -4) : 'N/A';
    echo "<tr><td><b>$label</b></td><td>$exists</td><td>$writable</td><td>$perms</td></tr>";
}
echo "</table>";

// === 3. Create Missing Directories ===
echo "<h2>3. Criação automática de pastas ausentes</h2>";
foreach ($dirs as $label => $path) {
    if (!file_exists($path)) {
        if (@mkdir($path, 0775, true)) {
            echo "✅ Criou: <code>$label</code><br>";
        } else {
            echo "❌ Falhou ao criar: <code>$label</code><br>";
        }
    } else {
        echo "ℹ️ Já existe: <code>$label</code><br>";
    }
}

// === 4. Symlink Check ===
echo "<h2>4. Symlink public/storage</h2>";
$link = __DIR__ . '/storage';
if (is_link($link)) {
    echo "✅ Symlink existe e aponta para: " . readlink($link);
} elseif (is_dir($link)) {
    echo "⚠️ É uma pasta real (não symlink). Imagens não serão acessíveis.";
} else {
    echo "❌ Symlink NÃO existe.";
}

// === 5. Test Write ===
echo "<h2>5. Teste de gravação</h2>";
$testFile = $base . '/products/.write_test_' . time();
if (@file_put_contents($testFile, 'test') !== false) {
    echo "✅ Gravação em <code>storage/app/public/products</code> funcionou!";
    @unlink($testFile);
} else {
    echo "❌ Não foi possível gravar em <code>storage/app/public/products</code>.";
    echo "<br>→ Isso impede o upload de imagens.";
}

echo "<br><br><hr><small>Remova este arquivo após o diagnóstico.</small>";
