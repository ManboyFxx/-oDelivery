<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== DEBUGGING STORE STATUS ===\n\n";

$tenant = \App\Models\Tenant::first();
$settings = \App\Models\StoreSetting::where('tenant_id', $tenant->id)->first();

echo "Current Time (UTC): " . now()->format('Y-m-d H:i:s') . "\n";
echo "Current Time (Brazil): " . now('America/Sao_Paulo')->format('Y-m-d H:i:s') . "\n";
echo "Day of Week: " . now('America/Sao_Paulo')->format('l') . "\n\n";

echo "Status Override: " . ($settings->status_override ?? 'null') . "\n";
echo "Paused Until: " . ($settings->paused_until ?? 'null') . "\n";
echo "Is Delivery Paused: " . ($settings->is_delivery_paused ? 'true' : 'false') . "\n\n";

$day = strtolower(now('America/Sao_Paulo')->format('l'));
echo "Today's Hours ($day): " . json_encode($settings->business_hours[$day] ?? 'NOT SET') . "\n\n";

$service = new \App\Services\SettingsService();
$isOpen = $service->isStoreOpen($tenant->id);

echo "isStoreOpen Result: " . ($isOpen ? '✅ OPEN' : '❌ CLOSED') . "\n\n";

// Test the model method too
$modelResult = $settings->isOpenNow();
echo "Model isOpenNow Result: " . ($modelResult ? '✅ OPEN' : '❌ CLOSED') . "\n";
