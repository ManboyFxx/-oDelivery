<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "Testing Evolution API Service...\n\n";

try {
    $service = app(App\Services\EvolutionApiService::class);

    echo "Attempting to send test message...\n";
    $result = $service->sendTextMessage('oodelivery', '5581962992240', '🔐 Teste de conexão Evolution API - OoDelivery');

    echo "\nResult:\n";
    print_r($result);

} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}
