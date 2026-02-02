<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $tenants = App\Models\Tenant::latest()->take(5)->get(['id', 'name', 'slug', 'created_at']);
    if ($tenants->isEmpty()) {
        echo "No tenants found.\n";
    } else {
        echo "Found " . $tenants->count() . " tenants:\n";
        foreach ($tenants as $tenant) {
            echo " - [{$tenant->id}] {$tenant->name} ({$tenant->slug}) created at {$tenant->created_at}\n";
        }
    }
} catch (\Exception $e) {
    echo "Error querying tenants: " . $e->getMessage() . "\n";
}
