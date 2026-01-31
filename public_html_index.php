<?php

use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Determine if the application is in maintenance mode...
// Path adjusted for Root deployment (no ../)
if (file_exists($maintenance = __DIR__ . '/storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
// Path adjusted for Root deployment (no ../)
require __DIR__ . '/vendor/autoload.php';

// Bootstrap Laravel and handle the request...
// Path adjusted for Root deployment (no ../)
$app = require_once __DIR__ . '/bootstrap/app.php';

// FORCE Laravel to recognize the root folder as the "public" folder
$app->usePublicPath(__DIR__);

$app->handleRequest(Request::capture());
