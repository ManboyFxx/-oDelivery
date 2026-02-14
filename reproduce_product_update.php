<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Product;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

try {
    // 1. Login as valid user
    $user = User::whereNotNull('tenant_id')->with('tenant')->first();
    if (!$user) {
        die("No user found with tenant.\n");
    }
    Auth::login($user);
    echo "Logged in as: " . $user->name . " (Tenant: " . $user->tenant->name . ")\n";

    // 2. Find a product to update
    $product = Product::where('tenant_id', $user->tenant_id)->first();
    if (!$product) {
        // Create one if needed
        echo "No product found. Creating one...\n";
        $product = Product::create([
            'tenant_id' => $user->tenant_id,
            'name' => 'Temp Product',
            'price' => 10.00,
            'is_available' => true
        ]);
    }
    echo "Target Product: {$product->id} - {$product->name}\n";

    // 3. Simulate Update Form Validation/Request
    // We can't easily simulate the full Controller flow without making a HTTP request, 
    // but we can call the update Logic manually to test the Model/Validation part if we want, 
    // or just use internal logic. 

    // Let's try to manually execute what the controller does.

    $data = [
        'name' => 'Updated Name ' . time(),
        'price' => 25.50,
        'description' => 'Updated Description',
        'is_available' => true,
        'track_stock' => false,
        'loyalty_redeemable' => false,
        // 'image' => ... (Cannot easily test file upload via CLI script without constructing UploadedFile)
    ];

    echo "Updating product...\n";
    $product->update($data);
    echo "SUCCESS: Product updated via CLI.\n";

} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString();
}
