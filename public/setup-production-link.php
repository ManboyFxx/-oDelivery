<?php

echo "<h1>Diagnóstico de Storage e Permissões</h1>";
echo "<a href='/'>Voltar para a Home</a><br><br>";

$publicStorage = __DIR__ . '/storage';
$targetStorage = realpath(__DIR__ . '/../storage/app/public');

echo "<h2>1. Verificando Caminhos</h2>";
echo "<strong>Public Storage Link:</strong> " . $publicStorage . "<br>";
echo "<strong>Target Storage Realpath:</strong> " . ($targetStorage ?: 'NÃO ENCONTRADO') . "<br>";

if (!$targetStorage) {
    echo "<h3 style='color:red'>Erro Crítico: Pasta de origem 'storage/app/public' não encontrada!</h3>";
    // Tenta criar se não existir
    if (!file_exists(__DIR__ . '/../storage/app/public')) {
        echo "Tentando criar storage/app/public... ";
        if (mkdir(__DIR__ . '/../storage/app/public', 0755, true)) {
            echo "Criada com sucesso!<br>";
            $targetStorage = realpath(__DIR__ . '/../storage/app/public');
        } else {
            echo "Falha ao criar.<br>";
        }
    }
}

echo "<h2>2. Estado Atual do Link</h2>";
if (file_exists($publicStorage)) {
    if (is_link($publicStorage)) {
        $linkTarget = readlink($publicStorage);
        echo "É um link simbólico? SIM<br>";
        echo "Aponta para: " . $linkTarget . "<br>";
        echo "O alvo existe? " . (file_exists($linkTarget) ? 'SIM' : '<span style="color:red">NÃO (Link Quebrado)</span>') . "<br>";
    } elseif (is_dir($publicStorage)) {
        echo "É um diretório normal? SIM (Isso pode ser o problema se não tiver os arquivos)<br>";
    }
} else {
    echo "O arquivo/link 'public/storage' NÃO existe.<br>";
}

echo "<h2>3. Tentando Corrigir (Recriar Link)</h2>";

try {
    // Remove existing
    if (file_exists($publicStorage)) {
        if (is_link($publicStorage)) {
            unlink($publicStorage);
            echo "Link antigo removido.<br>";
        } elseif (is_dir($publicStorage)) {
            // Recursive delete directory check
            $files = new RecursiveIteratorIterator(
                new RecursiveDirectoryIterator($publicStorage, RecursiveDirectoryIterator::SKIP_DOTS),
                RecursiveIteratorIterator::CHILD_FIRST
            );
            foreach ($files as $fileinfo) {
                $todo = ($fileinfo->isDir() ? 'rmdir' : 'unlink');
                $todo($fileinfo->getRealPath());
            }
            rmdir($publicStorage);
            echo "Diretório antigo removido.<br>";
        }
    }

    // Create new link
    if ($targetStorage) {
        if (symlink($targetStorage, $publicStorage)) {
            echo "<span style='color:green'>Novo link criado com sucesso!</span><br>";
        } else {
            echo "<span style='color:red'>Falha ao criar link com PHP symlink(). Tentando comando artisan...</span><br>";
            $output = shell_exec('cd .. && php artisan storage:link 2>&1');
            echo "<pre>$output</pre>";
        }
    }
} catch (Exception $e) {
    echo "Erro: " . $e->getMessage() . "<br>";
}

echo "<h2>4. Verificando Permissões e Conteúdo</h2>";

if ($targetStorage && file_exists($targetStorage)) {
    echo "Permissões da pasta alvo: " . substr(sprintf('%o', fileperms($targetStorage)), -4) . "<br>";

    // Attempt fix permissions
    echo "Tentando ajustar permissões (chmod 775)... ";
    @chmod($targetStorage, 0775);
    echo "Feito.<br>";

    // Check products folder
    $productsPath = $targetStorage . '/products';
    if (file_exists($productsPath)) {
        echo "Pasta 'products' encontrada.<br>";
        echo "Arquivos na pasta 'products':<ul>";
        $files = scandir($productsPath);
        $count = 0;
        foreach ($files as $file) {
            if ($file != '.' && $file != '..') {
                echo "<li>$file (" . substr(sprintf('%o', fileperms($productsPath . '/' . $file)), -4) . ")</li>";
                $count++;
                if ($count > 10) {
                    echo "<li>... e mais arquivos</li>";
                    break;
                }
            }
        }
        echo "</ul>";
        if ($count == 0)
            echo "Pasta vazia.<br>";
    } else {
        echo "<span style='color:orange'>Pasta 'products' não encontrada dentro de storage/app/public. (Normal se nenhum produto foi criado ainda)</span><br>";
    }

} else {
    echo "Não foi possível verificar conteúdo pois o alvo não existe.<br>";
}
