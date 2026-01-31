<?php
/**
 * Hostinger Debugger Tool
 * Upload this file to public_html/debug_hostinger.php
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);

echo "<h1>🛠️ Hostinger Debugger</h1>";

// 1. Check Permissions
echo "<h2>1. Permissions Check</h2>";
$paths = [
    'storage' => '0775',
    'storage/logs' => '0775',
    'storage/framework' => '0775',
    'storage/framework/views' => '0775',
    'storage/framework/sessions' => '0775',
    'storage/framework/cache' => '0775',
    'bootstrap/cache' => '0775',
];

foreach ($paths as $path => $perm) {
    if (!file_exists($path)) {
        if (@mkdir($path, 0775, true)) {
            echo "✅ Created directory: $path<br>";
        } else {
            echo "❌ Missing directory: $path (Could not create auto)<br>";
        }
    }

    if (is_writable($path)) {
        echo "✅ Writable: $path<br>";
    } else {
        echo "❌ <b>NOT WRITABLE:</b> $path (Fix permissions via File Manager)<br>";
    }
}

// 2. Load .env manually to check params
echo "<h2>2. Environment Check</h2>";
if (!file_exists('.env')) {
    die("❌ .env file NOT found in " . __DIR__);
} else {
    echo "✅ .env file found.<br>";
    $lines = file('.env');
    $env = [];
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line && strpos($line, '#') !== 0 && strpos($line, '=') !== false) {
            list($key, $value) = explode('=', $line, 2);
            $env[trim($key)] = trim($value);
        }
    }

    // Check specific keys
    echo "APP_ENV: " . ($env['APP_ENV'] ?? 'N/A') . "<br>";
    echo "APP_DEBUG: " . ($env['APP_DEBUG'] ?? 'N/A') . "<br>";
    echo "DB_CONNECTION: " . ($env['DB_CONNECTION'] ?? 'N/A') . "<br>";
    echo "DB_HOST: " . ($env['DB_HOST'] ?? 'N/A') . "<br>";
    echo "DB_DATABASE: " . ($env['DB_DATABASE'] ?? 'N/A') . "<br>";
}

// 3. Test Database Connection
echo "<h2>3. Database Connection Check</h2>";
try {
    $dsn = "mysql:host=" . ($env['DB_HOST'] ?? '127.0.0.1') . ";dbname=" . ($env['DB_DATABASE'] ?? 'forge');
    $pdo = new PDO($dsn, $env['DB_USERNAME'] ?? 'forge', $env['DB_PASSWORD'] ?? '');
    echo "✅ Database connection successful!<br>";
} catch (PDOException $e) {
    echo "❌ <b>Database Error:</b> " . $e->getMessage() . "<br>";
}

// 4. Test Laravel Boot
echo "<h2>4. Laravel Boot Check</h2>";
try {
    require __DIR__ . '/vendor/autoload.php';
    $app = require __DIR__ . '/bootstrap/app.php';

    // Attempt to make a kernel to see if container explodes
    $kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

    echo "✅ Laravel booted successfully.<br>";
} catch (Throwable $e) {
    echo "❌ <b>Laravel Boot Error:</b> " . $e->getMessage() . "<br>";
    echo "<pre>" . $e->getTraceAsString() . "</pre>";
}

echo "<h2>5. Log Viewer</h2>";
$logFile = 'storage/logs/laravel.log';
if (file_exists($logFile)) {
    $content = file_get_contents($logFile);
    $lines = explode("\n", $content);
    $last20 = implode("\n", array_slice($lines, -20));
    echo "<h3>Last 20 Log Lines:</h3>";
    echo "<pre style='background:#eee;padding:10px;'>" . htmlspecialchars($last20) . "</pre>";
} else {
    echo "❌ No log file found at $logFile<br>";
}
