<?php

// Test Phase 2 Protection Features

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== Testing Phase 2 Protection Features ===\n\n";

$tenant = \App\Models\Tenant::first();

if (!$tenant) {
    echo "❌ No tenant found in database\n";
    exit(1);
}

echo "Testing with Tenant: {$tenant->name} (Plan: {$tenant->plan})\n\n";

// Test 1: canDowngradeTo
echo "1. Testing canDowngradeTo('free'):\n";
$validation = $tenant->canDowngradeTo('free');
echo "   Can downgrade: " . ($validation['can_downgrade'] ? 'YES ✅' : 'NO ❌') . "\n";
if (!empty($validation['issues'])) {
    echo "   Issues:\n";
    foreach ($validation['issues'] as $issue) {
        echo "   - {$issue['resource']}: {$issue['action']}\n";
    }
}
echo "\n";

// Test 2: getUsagePercentage
echo "2. Testing getUsagePercentage:\n";
$resources = ['max_products', 'max_users', 'max_categories'];
foreach ($resources as $resource) {
    $usage = $tenant->getUsagePercentage($resource);
    echo "   {$resource}: " . round($usage, 1) . "%\n";
}
echo "\n";

// Test 3: getResourceWarnings
echo "3. Testing getResourceWarnings:\n";
$warnings = $tenant->getResourceWarnings();
if (empty($warnings)) {
    echo "   No warnings ✅ (all resources below 80%)\n";
} else {
    foreach ($warnings as $warning) {
        echo "   ⚠️  {$warning['resource']}: {$warning['usage_percent']}% ({$warning['current']}/{$warning['limit']})\n";
    }
}
echo "\n";

// Test 4: Middleware exists
echo "4. Testing ThrottleByPlan middleware:\n";
if (class_exists(\App\Http\Middleware\ThrottleByPlan::class)) {
    echo "   Middleware class exists ✅\n";
} else {
    echo "   Middleware class NOT found ❌\n";
}

echo "\n=== All Tests Complete ===\n";
