<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

echo "<h1>🔍 Debug 500 Error</h1>";
echo "<pre style='background:#f4f4f4; padding:15px;'>";

// 1. Check Permissions
echo "<h2>1. Permissions</h2>";
$paths = ['storage', 'storage/logs', 'bootstrap/cache'];
foreach ($paths as $path) {
    echo "Checking $path: ";
    if (is_writable(__DIR__ . '/' . $path)) {
        echo "<span style='color:green'>WRITABLE (" . substr(sprintf('%o', fileperms(__DIR__ . '/' . $path)), -4) . ")</span>\n";
    } else {
        echo "<span style='color:red'>NOT WRITABLE</span> (Try chmod 775)\n";
    }
}

// 2. Check .env
echo "\n<h2>2. Environment (.env)</h2>";
if (file_exists(__DIR__ . '/.env')) {
    echo "<span style='color:green'>Found .env</span>\n";
    $env = file_get_contents(__DIR__ . '/.env');
    if (strpos($env, 'APP_KEY=') === false || strpos($env, 'APP_KEY=base64:...') !== false) {
        echo "<span style='color:red'>WARNING: Check APP_KEY</span>\n";
    } else {
        echo "APP_KEY seems present.\n";
    }
} else {
    echo "<span style='color:red'>MISSING .env file!</span>\n";
}

// 3. Last Log Entry
echo "\n<h2>3. Laravel Log (Last 50 lines)</h2>";
$logFile = __DIR__ . '/storage/logs/laravel.log';
if (file_exists($logFile)) {
    $lines = file($logFile);
    $last = array_slice($lines, -50);
    foreach ($last as $line) {
        echo htmlspecialchars($line);
    }
} else {
    echo "No log file found at $logFile";
}

echo "</pre>";
