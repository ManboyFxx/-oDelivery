<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== TESTING BUSINESS HOURS SAVE ===\n\n";

$settings = \App\Models\StoreSetting::first();

echo "Current business_hours: " . json_encode($settings->business_hours) . "\n\n";

// Test saving with the format the frontend uses
$testHours = [
    'monday' => ['is_open' => true, 'open_time' => '09:00', 'close_time' => '23:00'],
    'tuesday' => ['is_open' => true, 'open_time' => '09:00', 'close_time' => '23:00'],
    'wednesday' => ['is_open' => true, 'open_time' => '09:00', 'close_time' => '23:00'],
    'thursday' => ['is_open' => true, 'open_time' => '09:00', 'close_time' => '23:00'],
    'friday' => ['is_open' => true, 'open_time' => '09:00', 'close_time' => '23:00'],
    'saturday' => ['is_open' => true, 'open_time' => '09:00', 'close_time' => '23:00'],
    'sunday' => ['is_open' => true, 'open_time' => '09:00', 'close_time' => '23:00'],
];

echo "Attempting to save test hours...\n";

$settings->business_hours = $testHours;
$settings->save();

echo "Saved! Reloading from database...\n\n";

$settings->refresh();

echo "New business_hours: " . json_encode($settings->business_hours, JSON_PRETTY_PRINT) . "\n\n";

echo "Saturday hours: " . json_encode($settings->business_hours['saturday'] ?? 'NOT SET') . "\n";
