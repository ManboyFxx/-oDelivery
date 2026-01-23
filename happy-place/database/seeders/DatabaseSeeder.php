<?php

namespace Database\Seeders;

use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create Super Admin
        $superAdmin = User::create([
            'name' => 'Super Admin',
            'email' => 'admin@happyplace.com',
            'password' => Hash::make('password'),
            'role' => 'super_admin',
            'tenant_id' => null,
        ]);

        // Create Demo Tenant
        $tenant = Tenant::create([
            'name' => 'Pizzaria do Zé',
            'slug' => 'pizzaria-do-ze',
            'email' => 'contato@pizzariadoze.com',
            'is_active' => true,
            'plan' => 'pro',
        ]);

        // Create Tenant Admin
        $tenantAdmin = User::create([
            'name' => 'Zé da Pizza',
            'email' => 'ze@pizzariadoze.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'tenant_id' => $tenant->id,
        ]);

        $this->command->info('Super Admin: admin@happyplace.com / password');
        $this->command->info('Tenant Admin: ze@pizzariadoze.com / password');
    }
}
