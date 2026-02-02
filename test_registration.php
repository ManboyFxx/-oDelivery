<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Tenant;
use App\Models\User;
use App\Models\StoreSetting;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

try {
    echo "Starting registration test...\n";

    DB::transaction(function () {
        $slug = 'teste-' . Str::random(6);
        $email = 'admin-' . $slug . '@teste.com';

        echo "Creating Tenant: $slug\n";

        // 1. Create Tenant
        $tenant = Tenant::create([
            'name' => 'Restaurante Teste',
            'slug' => $slug,
            'email' => $email,
            'phone' => '11999999999',
            'plan' => 'free',
            'is_active' => true,
        ]);

        echo "Tenant created with ID: {$tenant->id}\n";

        // 2. Create User
        $user = User::create([
            'name' => 'Admin Teste',
            'email' => $email,
            'password' => Hash::make('password'),
            'role' => 'admin',
            'tenant_id' => $tenant->id,
            'is_active' => true,
        ]);

        echo "User created with ID: {$user->id}\n";

        // 3. Create Settings
        StoreSetting::create([
            'tenant_id' => $tenant->id,
            'store_name' => 'Restaurante Teste',
            'store_slug' => $slug,
        ]);

        echo "Store Settings created.\n";
    });

    echo "SUCCESS: Registration logic executed successfully.\n";

} catch (\Exception $e) {
    echo "FAILED: Registration error: " . $e->getMessage() . "\n";
    // echo $e->getTraceAsString(); 
}
