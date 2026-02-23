<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\Tenant;
use App\Models\User;
use App\Models\StoreSetting;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DemoSeeder extends Seeder
{
    public ?Tenant $targetTenant = null;

    public function run(): void
    {
        $this->command?->info('🚀 Iniciando seeding do ambiente de demonstração...');

        // 1. Criar ou Usar Tenant
        $tenant = $this->targetTenant ?? Tenant::updateOrCreate(
            ['slug' => 'demo-oo-delivery'],
            [
                'name' => 'Pizza & Burger Demo',
                'email' => 'demo@oodelivery.online',
                'is_active' => true,
                'plan' => 'unified',
                'subscription_status' => 'active',
                'subscription_ends_at' => now()->addYears(10),
                'features' => json_encode([
                    'motoboy_management' => true,
                    'whatsapp_integration' => true,
                    'auto_print' => true,
                    'loyalty_basic' => true,
                    'digital_menu' => true,
                ]),
            ]
        );

        // 2. Configurações da Loja
        StoreSetting::updateOrCreate(
            ['tenant_id' => $tenant->id],
            [
                'store_name' => $tenant->name,
                'description' => 'A melhor experiência em delivery digital. Explore nosso painel!',
                'theme_color' => '#FF3D03',
                'phone' => '11999999999',
                'whatsapp' => '11999999999',
                'status_override' => 'open',
            ]
        );

        // 3. Usuário Demo Admin
        $user = User::withoutEvents(function () use ($tenant) {
            return User::updateOrCreate(
                ['email' => $tenant->email],
                [
                    'name' => 'Carlos (Demo Admin)',
                    'password' => Hash::make('demo123456'),
                    'role' => 'admin',
                    'tenant_id' => $tenant->id,
                    'email_verified_at' => now(),
                ]
            );
        });

        // Atribuir Role (Admin) se necessário na tabela pivo
        $adminRole = DB::table('roles')->where('slug', 'admin')->first();
        if ($adminRole) {
            DB::table('user_role')->updateOrInsert(
                ['user_id' => $user->id, 'role_id' => $adminRole->id]
            );
        }

        // 4. Categorias
        $categories = [
            ['name' => '🍕 Pizzas Artesanais', 'sort_order' => 1],
            ['name' => '🍔 Smash Burgers', 'sort_order' => 2],
            ['name' => '🍟 Acompanhamentos', 'sort_order' => 3],
            ['name' => '🥤 Bebidas Geladas', 'sort_order' => 4],
        ];

        Product::withoutEvents(function () use ($tenant, $categories) {
            foreach ($categories as $catData) {
                $category = Category::updateOrCreate(
                    ['tenant_id' => $tenant->id, 'name' => $catData['name']],
                    ['sort_order' => $catData['sort_order'], 'is_active' => true]
                );

                // 5. Produtos para cada categoria
                if ($catData['name'] === '🍕 Pizzas Artesanais') {
                    $this->createProducts($tenant->id, $category->id, [
                        ['name' => 'Margherita Especial', 'price' => 45.90, 'desc' => 'Molho de tomate italiano, mozzarella de búfala e manjericão fresco.'],
                        ['name' => 'Calabresa Premium', 'price' => 42.00, 'desc' => 'Calabresa artesanal, cebola roxa e azeitonas pretas.'],
                    ]);
                } elseif ($catData['name'] === '🍔 Smash Burgers') {
                    $this->createProducts($tenant->id, $category->id, [
                        ['name' => 'OoClassic Burger', 'price' => 28.50, 'desc' => 'Dois smash burgers de 80g, cheddar, picles e molho especial.'],
                        ['name' => 'Bacon Blast', 'price' => 32.00, 'desc' => 'Pão brioche, burger 160g, muito bacon crocante e maionese verde.'],
                    ]);
                }
            }
        });

        // 6. Criar Pedidos Fictícios para o Dashboard
        Order::withoutEvents(function () use ($tenant, $user) {
            $this->createDemoOrders($tenant->id, $user->id);
        });

        $this->command?->info('✅ Ambiente de demonstração configurado com sucesso!');
        $this->command?->info('📧 Login: ' . $tenant->email);
        $this->command?->info('🔑 Senha: demo123456');
    }

    public function seedTenant(Tenant $tenant)
    {
        $this->targetTenant = $tenant;
        $this->run();
    }

    private function createProducts($tenantId, $categoryId, $products)
    {
        foreach ($products as $pData) {
            Product::updateOrCreate(
                ['tenant_id' => $tenantId, 'category_id' => $categoryId, 'name' => $pData['name']],
                [
                    'description' => $pData['desc'],
                    'price' => $pData['price'],
                    'is_available' => true,
                    'track_stock' => false,
                ]
            );
        }
    }

    private function createDemoOrders($tenantId, $userId)
    {
        // Limpar pedidos antigos do demo para não acumular
        Order::where('tenant_id', $tenantId)->delete();

        for ($i = 0; $i < 15; $i++) {
            $status = $i < 10 ? 'delivered' : ($i < 13 ? 'preparing' : 'new');
            $total = rand(45, 120);

            $order = Order::create([
                'id' => \Illuminate\Support\Str::uuid()->toString(),
                'tenant_id' => $tenantId,
                'order_number' => 8000 + $i,
                'status' => $status,
                'mode' => 'delivery',
                'subtotal' => $total,
                'total' => $total,
                'payment_status' => 'paid',
                'customer_name' => 'Cliente Demo ' . ($i + 1),
                'delivery_address' => 'Rua da Demonstração, ' . rand(1, 999),
                'created_at' => now()->subHours(rand(1, 72)),
            ]);

            // Criar Registro de Pagamento
            \App\Models\Payment::create([
                'id' => \Illuminate\Support\Str::uuid()->toString(),
                'order_id' => $order->id,
                'method' => 'credit_card',
                'amount' => $total,
                'paid_at' => now(),
            ]);
        }
    }
}
