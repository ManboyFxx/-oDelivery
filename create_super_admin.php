<?php

/**
 * Create or Update Super Admin User
 * Run: php create_super_admin.php
 */

// Load Laravel bootstrap
require __DIR__ . '/bootstrap/app.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Http\Kernel::class);

// Get app instance
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\DB;

try {
    echo "\n🔐 Creating/Updating Super Admin User...\n\n";

    // Disable foreign keys temporarily
    DB::statement('SET FOREIGN_KEY_CHECKS=0');

    // Create or update user
    $userData = [
        'email' => 'contato@oodelivery.online',
        'name' => 'Super Admin',
        'password' => bcrypt('contato@oodelivery.online'),
        'email_verified_at' => now(),
        'is_admin' => 1,
        'is_super_admin' => 1,
    ];

    $user = User::updateOrCreate(
        ['email' => 'contato@oodelivery.online'],
        $userData
    );

    // Re-enable foreign keys
    DB::statement('SET FOREIGN_KEY_CHECKS=1');

    echo "✅ SUCCESS!\n\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    echo "📊 Super Admin Details:\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    echo "ID: {$user->id}\n";
    echo "Name: {$user->name}\n";
    echo "Email: {$user->email}\n";
    echo "Password: contato@oodelivery.online\n";
    echo "Is Admin: " . ($user->is_admin ? '✅ SIM' : '❌ NÃO') . "\n";
    echo "Is Super Admin: " . ($user->is_super_admin ? '✅ SIM' : '❌ NÃO') . "\n";
    echo "\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    echo "🌐 Login URL: http://localhost:8000/login\n";
    echo "🌐 Admin Panel: http://localhost:8000/admin/dashboard\n";
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

} catch (\Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    exit(1);
}
