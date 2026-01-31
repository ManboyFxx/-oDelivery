<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Models\Role; // Assuming Role model exists, if not we use DB

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            [
                'name' => 'Super Admin',
                'slug' => 'super_admin',
                'description' => 'Acesso total ao sistema global',
            ],
            [
                'name' => 'Administrador',
                'slug' => 'admin',
                'description' => 'Acesso total ao tenant',
            ],
            [
                'name' => 'Motoboy',
                'slug' => 'motoboy',
                'description' => 'Acesso ao painel de entregas',
            ],
            [
                'name' => 'Funcionário',
                'slug' => 'employee',
                'description' => 'Acesso limitado às operações do dia a dia',
            ],
        ];

        foreach ($roles as $role) {
            // Using DB directly to avoid Model issues if Model doesn't exist yet or is in flux
            // But prefer Model if possible for UUID generation trait if strictly needed.
            // Let's rely on DB with explicit UUID generation or Model.
            // Checking migrations: id is uuid.

            // Let's try inserting via Model first if it exists, otherwise DB.
            // Since I haven't checked if Role model exists, I'll assume it might not or be simple.
            // I'll use DB::table to be safe and agnostic, managing UUID myself.

            $existing = DB::table('roles')->where('slug', $role['slug'])->first();

            if (!$existing) {
                DB::table('roles')->insert([
                    'id' => (string) Str::uuid(),
                    'name' => $role['name'],
                    'slug' => $role['slug'],
                    'description' => $role['description'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}
