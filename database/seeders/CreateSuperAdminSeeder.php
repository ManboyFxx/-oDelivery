<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CreateSuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::updateOrCreate(
            ['email' => 'contato@oodelivery.online'],
            [
                'name' => 'Super Admin',
                'password' => bcrypt('contato@oodelivery.online'),
                'email_verified_at' => now(),
                'role' => 'super_admin',
                'is_active' => true,
            ]
        );

        echo "\n✅ Super Admin Created/Updated!\n";
        echo "   ID: {$user->id}\n";
        echo "   Email: contato@oodelivery.online\n";
        echo "   Password: contato@oodelivery.online\n";
        echo "   Role: super_admin\n";
        echo "   Status: " . ($user->is_active ? 'Ativo' : 'Inativo') . "\n\n";
    }
}
