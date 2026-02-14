<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Product;
use Illuminate\Support\Facades\Auth;

try {
    $user = User::whereNotNull('tenant_id')->with('tenant')->first();
    if (!$user) {
        // Fallback: Create a tenant and assign to first user if none found
        $user = User::first();
        if (!$user) {
            die("No user found at all.\n");
        }
        $tenant = \App\Models\Tenant::first();
        if ($tenant) {
            $user->tenant_id = $tenant->id;
            $user->save();
            echo "Assigned tenant {$tenant->id} to user {$user->id}\n";
        } else {
            die("No tenant found to assign.\n");
        }
    }

    Auth::login($user);
    if ($user->tenant) {
        echo "Logged in as: " . $user->name . " (Tenant ID: " . $user->tenant_id . ", Name: " . $user->tenant->name . ")\n";
    } else {
        // Reload user to get relationship
        $user->load('tenant');
        echo "Logged in as: " . $user->name . " (Tenant ID: " . $user->tenant_id . ", Name: " . ($user->tenant ? $user->tenant->name : 'NULL') . ")\n";
    }


    $tenant = $user->tenant;

    // Check plan limits
    echo "Checking plan limits...\n";
    if (!$tenant->canAdd('products')) {
        echo "PLAN LIMIT REACHED for products.\n";
        echo "Limit: " . $tenant->getLimit('max_products') . "\n";
        echo "Current count: " . $tenant->products()->count() . "\n";
    } else {
        echo "Plan limit passed. Can add products.\n";
    }

    // Try to create product
    $data = [
        'tenant_id' => $tenant->id,
        'name' => 'Test Product ' . time(),
        'price' => 10.00,
        'description' => 'Test Description',
        'is_available' => true,
        // Mimicking missing fields from frontend (null/false defaults)
        'track_stock' => false,
        'loyalty_redeemable' => false,
    ];

    echo "Attempting to create product via Model...\n";
    $product = Product::create($data);
    echo "SUCCESS: Product created with ID: " . $product->id . "\n";

} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString();
}
