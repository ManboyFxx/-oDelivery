<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Product;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;

try {
    // 1. Log in
    $user = User::whereNotNull('tenant_id')->with('tenant')->first();
    if (!$user)
        die("No user found.\n");
    Auth::login($user);
    echo "Logged in: {$user->name}\n";

    // 2. Find Product
    $product = Product::where('tenant_id', $user->tenant_id)->first();
    if (!$product) {
        $product = Product::create([
            'tenant_id' => $user->tenant_id,
            'name' => 'Image Test Product',
            'price' => 10.00,
            'is_available' => true
        ]);
        echo "Created temp product.\n";
    }
    echo "Target: {$product->id}\n";

    // 3. Create Dummy Image (GD should be enabled now)
    Storage::fake('public');
    $file = UploadedFile::fake()->image('test_product.jpg')->size(500); // 500KB

    // 4. Simulate Request
    $request = Request::create(
        route('products.update', $product->id),
        'POST', // Method
        [
            '_method' => 'PATCH', // Spoofing
            'name' => 'Updated with Image ' . time(),
            'price' => $product->price,
            'description' => 'Image upload test',
            'category_id' => $product->category_id,
            'is_available' => 1,
            'track_stock' => 0,
            'loyalty_redeemable' => 0,
        ],
        [], // cookies
        ['image' => $file], // files
        [] // server
    );

    // Bind request
    app()->instance('request', $request);

    echo "Attempting update with 500KB image...\n";

    // Resolve Controller and call update
    $controller = app()->make(\App\Http\Controllers\ProductController::class);
    $response = $controller->update($request, $product);

    echo "Response status: " . $response->getStatusCode() . "\n";
    if ($response->isRedirect()) {
        echo "Redirected to: " . $response->getTargetUrl() . "\n";
        echo "Success!\n";
    } else {
        echo "Content: " . $response->getContent() . "\n";
    }

} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    if (method_exists($e, 'errors')) {
        print_r($e->errors());
    }
    echo $e->getTraceAsString();
}
