<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle($request = Illuminate\Http\Request::capture());

echo "<h1>🔍 Debug WebP 404 - Deep Trace</h1>";

$file = 'media/d1e6743b-8106-4e3c-b7c4-9d6bb8bb771d/efc6cb88-b22b-4683-b7db-f297e70c9350.webp';

function tracePath($path)
{
    echo "<h3>Tracing: <code>$path</code></h3>";
    $parts = explode('/', ltrim($path, '/'));
    $current = '/';
    echo "<ul>";
    foreach ($parts as $part) {
        if (empty($part))
            continue;
        $current .= $part;
        if (file_exists($current)) {
            $perms = substr(sprintf('%o', fileperms($current)), -4);
            $owner = function_exists('posix_getpwuid') ? posix_getpwuid(fileowner($current))['name'] : fileowner($current);
            echo "<li>✅ <code>$current</code> (Perms: <b>$perms</b>, Owner: $owner)</li>";
            if (is_link($current)) {
                echo "<ul><li>🔗 Link para: <code>" . readlink($current) . "</code></li></ul>";
            }
        } else {
            echo "<li style='color:red'>❌ <code>$current</code> (NÃO ENCONTRADO)</li>";
            break;
        }
        $current .= '/';
    }
    echo "</ul>";
}

// Trace direct storage path
tracePath(storage_path('app/public/' . $file));

// Trace public symlink path
tracePath(public_path('storage/' . $file));

echo "<h3>Configurações Adicionais:</h3>";
echo "<p>PHP User: " . get_current_user() . "</p>";
echo "<p>Storage Link: " . (is_link(public_path('storage')) ? "SIM" : "NÃO") . "</p>";

echo "<h3>🛠️ Auto-Fixer de Permissões</h3>";
echo "<p>Se as pastas acima estiverem com 0700 ou 0711, o Apache não consegue ler. Clique abaixo para tentar corrigir:</p>";
echo "<form method='POST'><button name='fix_perms' value='1' style='padding:10px; cursor:pointer'>Corrigir Permissões (chmod 755)</button></form>";

if (isset($_POST['fix_perms'])) {
    echo "<h4>Resultado do Fixer:</h4><ul>";
    $dirToFix = storage_path('app/public/media');
    if (file_exists($dirToFix)) {
        $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dirToFix));
        chmod($dirToFix, 0755);
        echo "<li>Diretório RAIZ media: 0755</li>";
        foreach ($iterator as $item) {
            chmod($item, $item->isDir() ? 0755 : 0644);
        }
        echo "<li>✅ Permissões de 'media/' e subpastas corrigidas para 755/644.</li>";
    } else {
        echo "<li style='color:red'>❌ Pasta 'media/' não encontrada para correção.</li>";
    }
    echo "</ul>";
}

echo "<p><br><a href='/'>Voltar para o site</a></p>";
?>
