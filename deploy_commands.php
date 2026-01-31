<?php
/**
 * Hostinger Deploy Runner (Native PHP Version)
 * Access this file via browser run migrations/cache without SSH.
 */

set_time_limit(600);
ini_set('display_errors', 1);

$key = $_GET['key'] ?? '';
if ($key !== 'deploy123') {
    die("❌ Acesso negado.");
}

echo "<h1>🚀 Deploy Runner (Native)</h1>";
echo "<pre style='background:#222; color:#0f0; padding:15px; border-radius:5px;'>";

function log_msg($msg)
{
    echo "<b>> $msg</b><br>";
    flush();
}

// 1. BOOT LARAVEL
try {
    log_msg("Booting Laravel...");

    if (!file_exists(__DIR__ . '/vendor/autoload.php')) {
        throw new Exception("Vendor folder not found! Did you push it to Git?");
    }

    require __DIR__ . '/vendor/autoload.php';
    $app = require __DIR__ . '/bootstrap/app.php';

    // Boot Kernel
    $kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
    $kernel->bootstrap();

    log_msg("Laravel booted successfully.");

    // Helper to run command
    function run_artisan($kernel, $cmd, $params = [])
    {
        log_msg("Running: php artisan $cmd");
        try {
            // Force production handling ONLY for migrate
            if ($cmd === 'migrate') {
                $params['--force'] = true;
            }

            $status = $kernel->call($cmd, $params);
            $output = $kernel->output();

            echo "<div style='color:#ccc; margin-left:15px; border-left:2px solid #555; padding-left:10px;'>"
                . nl2br(htmlspecialchars($output))
                . "</div>";

        } catch (Exception $e) {
            echo "<div style='color:red;'>❌ Error: " . $e->getMessage() . "</div>";
        }
    }

    // 2. MIGRATE
    run_artisan($kernel, 'migrate');

    // 3. CACHE CLEARING
    run_artisan($kernel, 'config:clear');
    run_artisan($kernel, 'route:clear');
    run_artisan($kernel, 'view:clear');
    run_artisan($kernel, 'optimize:clear');

    // 4. STORAGE LINK
    run_artisan($kernel, 'storage:link');

    // 5. ATTEMPT PERMISSIONS (PHP Level)
    log_msg("Fixing Permissions (PHP chmod)...");
    $dirs = ['storage', 'bootstrap/cache'];
    foreach ($dirs as $dir) {
        if (is_dir($dir)) {
            $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dir));
            foreach ($iterator as $item) {
                @chmod($item, 0775);
            }
            log_msg("Fixed: $dir");
        }
    }

} catch (Throwable $e) {
    echo "<h2 style='color:red;'>FATAL ERROR</h2>";
    echo $e->getMessage() . "<br>";
    echo "<pre>" . $e->getTraceAsString() . "</pre>";
}

echo "</pre>";
echo "<h2>✅ Fim da execução.</h2>";
?>