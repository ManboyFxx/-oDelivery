<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$basePath = __DIR__ . '/..';
require $basePath . '/vendor/autoload.php';
$app = require_once $basePath . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

echo "<h1>🛠️ Corrigindo pasta Uploads</h1>";

$oldStorage1 = $basePath . '/storage/app/public';
$oldStorage2 = __DIR__ . '/storage';
$newUploads = __DIR__ . '/uploads';

// 1. Cria a nova pasta uploads
if (!file_exists($newUploads)) {
    echo "<p>Criando diretório $newUploads...</p>";
    if (mkdir($newUploads, 0755, true)) {
        echo "<p style='color:green;'>Diretório criado!</p>";
    } else {
        echo "<p style='color:red;'>Erro ao criar diretório.</p>";
    }
} else {
    echo "<p>Diretório $newUploads já existe.</p>";
}

// 2. Remove symlink antigo se existir
if (is_link($oldStorage2)) {
    echo "<p>Removendo symlink antigo...</p>";
    unlink($oldStorage2);
}

// 3. Função para copiar tudo
function recurse_copy($src, $dst)
{
    if (!file_exists($src) || !is_dir($src))
        return false;
    $dir = opendir($src);
    @mkdir($dst, 0755, true);
    while (false !== ($file = readdir($dir))) {
        if (($file != '.') && ($file != '..')) {
            if (is_dir($src . '/' . $file)) {
                recurse_copy($src . '/' . $file, $dst . '/' . $file);
            } else {
                copy($src . '/' . $file, $dst . '/' . $file);
            }
        }
    }
    closedir($dir);
    return true;
}

// 4. Copia os arquivos
echo "<h3>Copiando de $oldStorage1 para $newUploads...</h3>";
if (recurse_copy($oldStorage1, $newUploads)) {
    echo "<p style='color:green; font-weight:bold;'>✅ ARQUIVOS COPIADOS DO STORAGE/APP/PUBLIC COM SUCESSO!</p>";
} else {
    echo "<p style='color:orange;'>Nada copiado ou origem não encontrada.</p>";
}

echo "<h3>Copiando de $oldStorage2 (caso exista) para $newUploads...</h3>";
if (recurse_copy($oldStorage2, $newUploads)) {
    echo "<p style='color:green; font-weight:bold;'>✅ ARQUIVOS COPIADOS DO PUBLIC/STORAGE COM SUCESSO!</p>";
}

echo "<h3>Listando conteúdo de uploads/media:</h3>";
function listFolderFiles($dir)
{
    if (!file_exists($dir))
        return;
    $ffs = scandir($dir);
    unset($ffs[array_search('.', $ffs, true)]);
    unset($ffs[array_search('..', $ffs, true)]);
    if (count($ffs) < 1)
        return;
    foreach ($ffs as $ff) {
        echo '<li>' . $ff;
        if (is_dir($dir . '/' . $ff))
            listFolderFiles($dir . '/' . $ff);
        echo '</li>';
    }
}
echo '<ul>';
listFolderFiles($newUploads . '/media');
echo '</ul>';

echo "<p>Concluído! Pode fechar esta página.</p>";
