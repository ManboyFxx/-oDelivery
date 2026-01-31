<?php
/**
 * Hostinger Deploy Runner (No-SSH Version)
 * Access this file via browser to run commands.
 */

set_time_limit(600);
ini_set('display_errors', 1);

$key = $_GET['key'] ?? '';
// Simple security key to prevent random access
if ($key !== 'deploy123') {
    die("❌ Acesso negado. Use ?key=deploy123");
}

echo "<h1>🚀 Deploy Runner</h1>";
echo "<pre style='background:#222; color:#0f0; padding:15px; border-radius:5px;'>";

function run($cmd)
{
    echo "<b>> $cmd</b>\n";
    // Check if function exists
    if (!function_exists('shell_exec')) {
        echo "❌ shell_exec está desabilitado no PHP deste servidor.\n";
        return;
    }

    // Try to find composer
    if (strpos($cmd, 'composer') !== false) {
        $cmd = 'COMPOSER_HOME="/tmp" ' . $cmd; // Fix for writable home
    }

    $output = shell_exec($cmd . ' 2>&1');
    echo htmlspecialchars($output) . "\n\n";
    flush();
}

// 1. Check Directory
echo "DIR: " . __DIR__ . "\n\n";

// 2. Composer Install
// Try standard composer, or php composer.phar if uploaded
if (file_exists('composer.phar')) {
    run("php composer.phar install --optimize-autoloader --no-dev");
} else {
    run("composer install --optimize-autoloader --no-dev");
}

// 3. Migrations
run("php artisan migrate --force");

// 4. Cache
run("php artisan config:clear");
run("php artisan route:clear");
run("php artisan view:clear");
run("php artisan optimize:clear");

// 5. Link Storage (Symbolic link)
run("php artisan storage:link");

// 6. Permissions (Best effort)
run("chmod -R 775 storage bootstrap/cache");

echo "</pre>";
echo "<h2>✅ Fim da execução.</h2>";
?>