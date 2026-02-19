<?php
// Enable error reporting
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

echo "<h1>Diagnóstico de Storage (v4 - Force Mode)</h1>";
echo "<a href='/'>Voltar para a Home</a><br><br>";

// Helper to safely get path
function safePath($path)
{
    return file_exists($path) ? realpath($path) : $path . " (Não existe)";
}

$publicLink = __DIR__ . '/storage';
$targetDirRelative = __DIR__ . '/../storage/app/public';
$targetDirReal = safePath($targetDirRelative);

echo "<h2>1. Verificação preliminar</h2>";
if (file_exists($publicLink)) {
    if (is_dir($publicLink) && !is_link($publicLink)) {
        echo "<h3 style='color:red'>⚠️ ALERTA: 'public/storage' é uma PASTA REAL, não um link!</h3>";
        echo "Isso impede que as imagens apareçam. O servidor está tentando ler dessa pasta vazia em vez da pasta correta.<br>";

        echo "<br><strong>Tentando remover a pasta 'impostora'...</strong><br>";

        // Force delete directory
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
                echo "<span style='color:green'>Sucesso! Pasta removida. Agora podemos tentar criar o link.</span><br>";
            } else {
                echo "<span style='color:red'>Falha ao remover a pasta. Verifique permissões FTP.</span><br>";
            }
        } catch (Exception $e) {
            echo "Erro ao tentar remover: " . $e->getMessage() . "<br>";
        }
    } else {
        echo "O arquivo 'public/storage' existe e parece ser um link ou arquivo (Correto).<br>";
    }
}

echo "<h2>2. Tentativa de Linkar (Novamente)</h2>";

if (!file_exists($publicLink)) {
    // METHOD 1: PHP symlink()
    echo "Tentativa 1 (PHP symlink)... ";
    if (function_exists('symlink')) {
        if (@symlink('../storage/app/public', $publicLink)) {
            echo "<span style='color:green'>Sucesso!</span><br>";
        } else {
            echo "Falha (Erro ao criar).<br>";
        }
    } else {
        echo "Pula (Função desabilitada).<br>";
    }

    // METHOD 2: shell_exec (ln -s)
    if (!file_exists($publicLink) && function_exists('shell_exec')) {
        echo "Tentativa 2 (Comando Linux)... ";
        $cmd = "ln -s " . escapeshellarg($targetDirReal) . " " . escapeshellarg($publicLink) . " 2>&1";
        $output = shell_exec($cmd);
        if (file_exists($publicLink)) {
            echo "<span style='color:green'>Sucesso!</span><br>";
        } else {
            echo "Falha. Output: <pre>$output</pre><br>";
        }
    }
} else {
    echo "O link/pasta já existe. (Se for um link, ótimo. Se for pasta vazia, recarregue a página para tentar apagar de novo).<br>";
}

echo "<h2>3. Verificação Final</h2>";

if (file_exists($publicLink)) {
    if (is_link($publicLink)) {
        echo "<h3>✅ EXCELENTE! É um link simbólico.</h3>";
        echo "Pode testar as imagens agora.";
    } elseif (is_dir($publicLink)) {
        echo "<h3>❌ AINDA É UMA PASTA REAL.</h3>";
        echo "O script não conseguiu apagar a pasta. Você precisará acessar o FTP/Gerenciador de Arquivos e apagar a pasta `public_html/public/storage` manualmente.";
    }
} else {
    echo "<h3>⚠️ Link não criado</h3>";
    echo "A pasta 'impostora' foi removida, mas o link não pôde ser criado automaticamente (funções bloqueadas).<br>";
    echo "<strong>SOLUÇÃO MANUAL (CRON JOB):</strong><br>";
    echo "Agora que a pasta 'public/storage' não existe mais, vá no painel da hospedagem > Cron Jobs e rode:<br>";
    echo "<code style='background:#eee;padding:10px;display:block;margin:10px'>ln -s " . $targetDirReal . " " . $publicLink . "</code>";
}
