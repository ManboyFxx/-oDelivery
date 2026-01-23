<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use App\Models\Tenant;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class OrderSeeder extends Seeder
{
    public function run(): void
    {
        $tenant = Tenant::first();
        if (!$tenant)
            return;

        $statuses = ['new', 'preparing', 'ready', 'waiting_motoboy', 'motoboy_accepted', 'out_for_delivery'];
        $modes = ['delivery', 'pickup', 'table'];

        // Ensure products exist
        if (Product::count() === 0) {
            Product::create([
                'tenant_id' => $tenant->id,
                'name' => 'Pizza Calabresa',
                'price' => 45.00,
                'category_id' => null, // Simplified for seed
            ]);
            Product::create([
                'tenant_id' => $tenant->id,
                'name' => 'Coca-Cola 2L',
                'price' => 12.00,
                'category_id' => null,
            ]);
        }

        $products = Product::all();

        for ($i = 0; $i < 10; $i++) {
            $order = Order::create([
                'tenant_id' => $tenant->id,
                'order_number' => '#' . str_pad($i + 1, 4, '0', STR_PAD_LEFT),
                'mode' => $modes[array_rand($modes)],
                'status' => $statuses[array_rand($statuses)],
                'customer_name' => 'Cliente Teste ' . $i,
                'customer_phone' => '11999999999',
                'delivery_address' => 'Rua Exemplo, 123 - Centro',
                'total' => 0,
                'subtotal' => 0,
            ]);

            $total = 0;
            // Add items
            for ($j = 0; $j < rand(1, 3); $j++) {
                $product = $products->random();
                $qty = rand(1, 2);
                $price = $product->price * $qty;

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'quantity' => $qty,
                    'unit_price' => $product->price,
                    'subtotal' => $price,
                ]);
                $total += $price;
            }

            $order->update(['total' => $total, 'subtotal' => $total]);
        }
    }
}
