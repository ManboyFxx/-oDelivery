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
        // Check if RoleSeeder class exists before calling to avoid error if file creation failed slightly sync-wise (unlikely but safe)
        $this->call(RoleSeeder::class);

        // Get Roles
        $superAdminRole = \Illuminate\Support\Facades\DB::table('roles')->where('slug', 'super_admin')->first();
        $adminRole = \Illuminate\Support\Facades\DB::table('roles')->where('slug', 'admin')->first();

        // Create Super Admin
        $superAdmin = User::firstOrCreate(
            ['email' => 'contato@oodelivery.online'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('eljcqzderihuvnjsnple'),
                'role' => 'super_admin',
                'tenant_id' => null,
            ]
        );

        // Attach Role
        if ($superAdminRole) {
            \Illuminate\Support\Facades\DB::table('user_role')->insert([
                'user_id' => $superAdmin->id,
                'role_id' => $superAdminRole->id,
            ]);
        }

        // Create Demo Tenant
        $tenant = Tenant::create([
            'name' => 'Pizzaria do Zé',
            'slug' => 'pizzaria-do-ze',
            'email' => 'contato@pizzariadoze.com',
            'is_active' => true,
            'plan' => 'pro',
            'features' => ['orders', 'menu', 'reports'], // Default features
        ]);

        // Create Store Settings for Tenant
        \App\Models\StoreSetting::create([
            'tenant_id' => $tenant->id,
            'store_name' => 'Pizzaria do Zé',
            'description' => 'A melhor pizza da cidade!',
            'theme_color' => '#ff3d03',
            'phone' => '11999999999',
            'whatsapp' => '11999999999',
        ]);

        // Create Tenant Admin
        $tenantAdmin = User::create([
            'name' => 'Zé da Pizza',
            'email' => 'ze@pizzariadoze.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'tenant_id' => $tenant->id,
        ]);

        // Attach Role
        if ($adminRole) {
            \Illuminate\Support\Facades\DB::table('user_role')->insert([
                'user_id' => $tenantAdmin->id,
                'role_id' => $adminRole->id,
            ]);
        }

        $this->command->info('Super Admin: contato@oodelivery.online / eljcqzderihuvnjsnple');
        $this->command->info('Tenant Admin: ze@pizzariadoze.com / password');
    }
}
