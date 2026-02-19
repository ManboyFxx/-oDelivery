<?php
// Enable error reporting
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

echo "<h1>Diagnóstico de Storage (v3 - Safe Mode)</h1>";
echo "<a href='/'>Voltar para a Home</a><br><br>";

// Helper for paths
function safePath($path)
{
    return file_exists($path) ? realpath($path) : $path . " (Não existe)";
}

$publicLink = __DIR__ . '/storage';
$targetDirRelative = __DIR__ . '/../storage/app/public';
$targetDirReal = safePath($targetDirRelative);

echo "<h2>1. Verificação de Caminhos</h2>";
echo "<strong>Link Público:</strong> " . $publicLink . "<br>";
echo "<strong>Alvo:</strong> " . $targetDirReal . "<br>";

// Check target existence
if (!file_exists(__DIR__ . '/../storage/app/public')) {
    echo "<span style='color:red'>ERRO: Pasta alvo não existe. Tentando criar...</span><br>";
    @mkdir(__DIR__ . '/../storage/app/public', 0755, true);
}

echo "<h2>2. Capacidades do Servidor</h2>";
$canSymlink = function_exists('symlink');
$canShell = function_exists('shell_exec');
$canExec = function_exists('exec');

echo "Função symlink(): " . ($canSymlink ? "<span style='color:green'>Habilitada</span>" : "<span style='color:red'>DESABILITADA pelo Host</span>") . "<br>";
echo "Função shell_exec(): " . ($canShell ? "<span style='color:green'>Habilitada</span>" : "<span style='color:red'>Desabilitada</span>") . "<br>";
echo "Função exec(): " . ($canExec ? "<span style='color:green'>Habilitada</span>" : "<span style='color:red'>Desabilitada</span>") . "<br>";

echo "<h2>3. Tentativa de Criar o Link</h2>";

// Remove old if exists
if (file_exists($publicLink)) {
    if (is_link($publicLink)) {
        @unlink($publicLink);
        echo "Link antigo/quebrado removido.<br>";
    } elseif (is_dir($publicLink)) {
        // Safe remove dir
        // ... (simplified for brevity, assuming standard hosting structure)
        echo "Aviso: Existe uma pasta real em public/storage. Tente renomeá-la via FTP se o script falhar.<br>";
    }
}

$success = false;

// METHOD 1: PHP symlink()
if ($canSymlink && !$success) {
    echo "Tentativa 1 (PHP symlink)... ";
    if (@symlink('../storage/app/public', $publicLink)) {
        echo "<span style='color:green'>Sucesso!</span><br>";
        $success = true;
    } else {
        echo "Falha.<br>";
    }
}

// METHOD 2: shell_exec (ln -s)
if ($canShell && !$success) {
    echo "Tentativa 2 (Comando Linux via shell_exec)... ";
    // Use full paths for shell command
    $cmd = "ln -s " . escapeshellarg($targetDirReal) . " " . escapeshellarg($publicLink) . " 2>&1";
    echo "Comando: <code>$cmd</code>... ";
    $output = shell_exec($cmd);

    if (file_exists($publicLink) && is_link($publicLink)) {
        echo "<span style='color:green'>Sucesso!</span><br>";
        $success = true;
    } else {
        echo "Falha. Output: <pre>$output</pre><br>";
    }
}

// METHOD 3: Artisan Storage Link
if ($canShell && !$success) {
    echo "Tentativa 3 (Artisan storage:link)... ";
    $output = shell_exec('cd .. && php artisan storage:link 2>&1');
    echo "<pre>$output</pre>";
    if (file_exists($publicLink)) {
        echo "<span style='color:green'>Sucesso via Artisan!</span><br>";
        $success = true;
    }
}

echo "<h2>4. Resultado Final</h2>";

if (file_exists($publicLink)) {
    echo "<h3>✅ Link Verificado!</h3>";
    $files = scandir($publicLink);
    echo "Arquivos na pasta pública: " . count($files) . "<br>";
    if (count($files) > 2) {
        echo "<span style='color:green'>Parece estar funcionando corretamente. Limpe o cache do navegador e teste as imagens.</span>";
    } else {
        echo "<span style='color:orange'>Pasta parece vazia (ou só tem . e ..). Verifique se há produtos cadastrados.</span>";
    }
} else {
    echo "<h3>❌ Falha Crítica</h3>";
    echo "Não foi possível criar o link simbólico.<br>";
    echo "<strong>Solução Alternativa (Cron Job):</strong><br>";
    echo "Acesse o painel da hospedagem (cPanel/Hostinger), vá em 'Cron Jobs' e adicione o seguinte comando para rodar uma vez:<br>";
    echo "<code style='background:#eee;padding:10px;display:block;margin:10px'>ln -s " . $targetDirReal . " " . $publicLink . "</code>";
}
