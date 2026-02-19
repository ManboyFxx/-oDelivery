<?php

echo "<h1>Configurando Storage Link...</h1>";

try {
    // Remove existing link if it exists (to avoid errors)
    $target = __DIR__ . '/storage';
    if (file_exists($target)) {
        if (is_link($target)) {
            echo "Removendo link simbólico existente...<br>";
            unlink($target);
        } elseif (is_dir($target)) {
            echo "Aviso: 'public/storage' é um diretório real, não um link. Removendo...<br>";
            // Recursive delete for directory
            $files = new RecursiveIteratorIterator(
                new RecursiveDirectoryIterator($target, RecursiveDirectoryIterator::SKIP_DOTS),
                RecursiveIteratorIterator::CHILD_FIRST
            );
            foreach ($files as $fileinfo) {
                $todo = ($fileinfo->isDir() ? 'rmdir' : 'unlink');
                $todo($fileinfo->getRealPath());
            }
            rmdir($target);
        }
    }

    // Create new link
    echo "Criando novo link simbólico...<br>";
    $targetFolder = __DIR__ . '/../storage/app/public';
    $linkFolder = __DIR__ . '/storage';

    if (symlink($targetFolder, $linkFolder)) {
        echo "<h2 style='color:green'>Sucesso! Link criado.</h2>";
        echo "Link: $linkFolder -> $targetFolder<br>";
    } else {
        echo "<h2 style='color:red'>Falha ao criar link com symlink(). Tentando artisan...</h2>";

        // Fallback to artisan command
        $output = shell_exec('cd .. && php artisan storage:link 2>&1');
        echo "<pre>$output</pre>";
    }

} catch (Exception $e) {
    echo "<h2 style='color:red'>Erro: " . $e->getMessage() . "</h2>";
}

echo "<br><br><a href='/'>Voltar para a Home</a>";
