<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== DETAILED DEBUG OF isStoreOpen ===\n\n";

$tenant = \App\Models\Tenant::first();
$settings = \App\Models\StoreSetting::where('tenant_id', $tenant->id)->first();

$now = now($settings->tenant->timezone ?? 'America/Sao_Paulo');
$hours = $settings->business_hours;

echo "Current time (Brazil): " . $now->format('Y-m-d H:i:s') . "\n";
echo "Day of week: " . strtolower($now->format('l')) . "\n\n";

$dayOfWeek = strtolower($now->format('l'));
$dayData = $hours[$dayOfWeek];

echo "Day data: " . json_encode($dayData) . "\n\n";

$openTimeStr = $dayData['open'] ?? $dayData['open_time'] ?? null;
$closeTimeStr = $dayData['close'] ?? $dayData['close_time'] ?? null;

echo "Open time string: " . ($openTimeStr ?? 'NULL') . "\n";
echo "Close time string: " . ($closeTimeStr ?? 'NULL') . "\n\n";

$timezone = $settings->tenant->timezone ?? 'America/Sao_Paulo';
$openTime = @\Carbon\Carbon::createFromFormat('H:i', $openTimeStr ?? '', $timezone);
$closeTime = @\Carbon\Carbon::createFromFormat('H:i', $closeTimeStr ?? '', $timezone);

echo "Open time object: " . ($openTime ? $openTime->format('Y-m-d H:i:s') : 'NULL') . "\n";
echo "Close time object: " . ($closeTime ? $closeTime->format('Y-m-d H:i:s') : 'NULL') . "\n\n";

if ($openTime && $closeTime) {
    $openTime->setDate($now->year, $now->month, $now->day);
    $closeTime->setDate($now->year, $now->month, $now->day);

    echo "After setDate:\n";
    echo "Open time: " . $openTime->format('Y-m-d H:i:s') . "\n";
    echo "Close time: " . $closeTime->format('Y-m-d H:i:s') . "\n\n";

    if ($closeTime->lessThan($openTime)) {
        $closeTime->addDay();
        echo "Close time is before open time, adding 1 day\n";
        echo "New close time: " . $closeTime->format('Y-m-d H:i:s') . "\n\n";
    }

    echo "Checking if $now is between $openTime and $closeTime\n";
    $result = $now->between($openTime, $closeTime);
    echo "Result: " . ($result ? 'TRUE (OPEN)' : 'FALSE (CLOSED)') . "\n";
}
