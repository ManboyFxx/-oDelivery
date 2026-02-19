<?php
// Enable error reporting to see the 500 cause
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

echo "<h1>Diagnóstico de Storage e Permissões (v2)</h1>";
echo "<a href='/'>Voltar para a Home</a><br><br>";

// Helper to safely get path
function safePath($path)
{
    return file_exists($path) ? realpath($path) : $path . " (Não existe)";
}

$publicLink = __DIR__ . '/storage';
$targetDirRelative = __DIR__ . '/../storage/app/public';
$targetDirReal = safePath($targetDirRelative);

echo "<h2>1. Verificação de Caminhos</h2>";
echo "<strong>Link Público (onde devia estar):</strong> " . $publicLink . "<br>";
echo "<strong>Alvo (onde os arquivos estão):</strong> " . $targetDirReal . "<br>";

echo "<h2>2. Análise do Alvo</h2>";
if (!file_exists(__DIR__ . '/../storage/app/public')) {
    echo "<span style='color:red'>ERRO: A pasta 'storage/app/public' não existe!</span><br>";
    echo "Tentando criar... ";
    try {
        if (!is_dir(__DIR__ . '/../storage/app')) {
            @mkdir(__DIR__ . '/../storage/app', 0755, true);
        }
        if (@mkdir(__DIR__ . '/../storage/app/public', 0755, true)) {
            echo "<span style='color:green'>Sucesso ao criar pasta!</span><br>";
        } else {
            echo "<span style='color:red'>Falha ao criar pasta. Verifique permissões da pasta 'storage'.</span><br>";
            $lastError = error_get_last();
            if ($lastError)
                echo "Erro PHP: " . $lastError['message'] . "<br>";
        }
    } catch (Exception $e) {
        echo "Exceção: " . $e->getMessage() . "<br>";
    }
} else {
    echo "<span style='color:green'>Pasta alvo existe.</span><br>";
}

echo "<h2>3. Análise do Link Atual</h2>";
if (file_exists($publicLink)) {
    if (is_link($publicLink)) {
        echo "Tipo: Link Simbólico<br>";
        echo "Aponta para: " . readlink($publicLink) . "<br>";
        echo "Status: " . (file_exists(readlink($publicLink)) ? "<span style='color:green'>Válido</span>" : "<span style='color:red'>Quebrado</span>") . "<br>";

        // Remove link if broken
        if (!file_exists(readlink($publicLink))) {
            echo "Removendo link quebrado... ";
            @unlink($publicLink);
            echo "Feito.<br>";
        }
    } elseif (is_dir($publicLink)) {
        echo "Tipo: <span style='color:orange'>Diretório Real (Incorreto)</span><br>";
        echo "Tentando remover diretório incorreto... ";
        // Safe remove
        try {
            $files = new RecursiveIteratorIterator(
                new RecursiveDirectoryIterator($publicLink, RecursiveDirectoryIterator::SKIP_DOTS),
                RecursiveIteratorIterator::CHILD_FIRST
            );
            foreach ($files as $fileinfo) {
                $todo = ($fileinfo->isDir() ? 'rmdir' : 'unlink');
                @$todo($fileinfo->getRealPath());
            }
            if (@rmdir($publicLink)) {
                echo "Removido com sucesso.<br>";
            } else {
                echo "<span style='color:red'>Falha ao remover.</span><br>";
            }
        } catch (Exception $e) {
            echo "Erro ao remover: " . $e->getMessage() . "<br>";
        }
    }
} else {
    echo "Nada existe em public/storage (Correto para criar novo).<br>";
}

echo "<h2>4. Tentativa de Linkar</h2>";
if (!file_exists($publicLink)) {
    // Try PHP check relative path vs absolute
    // Some shared hosts fail with absolute paths in symlink()

    // Attempt 1: Relative Path
    $relativeTarget = '../storage/app/public';
    echo "Tentativa 1 (Caminho Relativo: $relativeTarget)... ";
    if (@symlink($relativeTarget, $publicLink)) {
        echo "<span style='color:green'>Sucesso!</span><br>";
    } else {
        echo "Falha.<br>";

        // Attempt 2: Absolute Path
        $absoluteTarget = realpath(__DIR__ . '/../storage/app/public');
        if ($absoluteTarget) {
            echo "Tentativa 2 (Caminho Absoluto: $absoluteTarget)... ";
            if (@symlink($absoluteTarget, $publicLink)) {
                echo "<span style='color:green'>Sucesso!</span><br>";
            } else {
                echo "Falha.<br>";

                // Attempt 3: Artisan
                echo "Tentativa 3 (Artisan command)... ";
                try {
                    $output = shell_exec('cd .. && php artisan storage:link 2>&1');
                    echo "Output: <pre>$output</pre>";
                    if (file_exists($publicLink))
                        echo "<span style='color:green'>Sucesso via Artisan!</span>";
                } catch (Exception $e) {
                    echo "Erro ao executar artisan.<br>";
                }
            }
        }
    }
} else {
    echo "Link já existe (ou não foi possível remover o anterior).<br>";
}

echo "<h2>5. Listagem de Arquivos (Teste Final)</h2>";
if (file_exists($publicLink)) {
    $productsPath = $publicLink . "/products";
    if (file_exists($productsPath)) {
        echo "Pasta products encontrada via link publico!<br>";
        $files = scandir($productsPath);
        echo "Arquivos: " . count($files) . "<br>";
    } else {
        echo "<span style='color:orange'>Pasta products não visível via link. (Permissões?)</span><br>";
    }
} else {
    echo "<span style='color:red'>FALHA: Não foi possível recriar o link.</span><br>";
}

echo "<hr><br>Fim do diagnóstico.";
