<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('users')->insertOrIgnore([
            'id' => Str::uuid()->toString(),
            'tenant_id' => null, // Super admin has no tenant
            'name' => 'Super Admin',
            'email' => 'admin@oodelivery.online',
            'phone' => null,
            'password' => bcrypt('Big2020@'),
            'avatar_url' => null,
            'role' => 'super_admin',
            'is_available' => true,
            'is_active' => true,
            'email_verified_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('users')
            ->where('email', 'admin@oodelivery.online')
            ->delete();
    }
};
