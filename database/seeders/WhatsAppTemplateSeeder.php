<?php

namespace Database\Seeders;

use App\Models\WhatsAppTemplate;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class WhatsAppTemplateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $templates = [
            [
                'key' => 'order_confirmed',
                'name' => 'Pedido Confirmado',
                'message' => "🎉 *Pedido Confirmado!*\n\nOlá {customer_name}!\n\nSeu pedido #{order_number} foi confirmado.\n\n💰 Total: {order_total}\n🏪 {store_name}\n\nObrigado pela preferência!",
                'is_active' => true,
            ],
            [
                'key' => 'order_ready',
                'name' => 'Pedido Pronto',
                'message' => "✅ *Pedido Pronto!*\n\n{customer_name}, seu pedido #{order_number} está pronto!\n\n🛵 Saindo para entrega em breve.\n\n{store_name}",
                'is_active' => true,
            ],
            [
                'key' => 'order_out_for_delivery',
                'name' => 'Saiu para Entrega',
                'message' => "🛵 *A caminho!*\n\n{customer_name}, seu pedido #{order_number} saiu para entrega!\n\n📍 Endereço: {delivery_address}\n\n{store_name}",
                'is_active' => true,
            ],
            [
                'key' => 'order_delivered',
                'name' => 'Pedido Entregue',
                'message' => "🎉 *Entregue!*\n\n{customer_name}, seu pedido #{order_number} foi entregue!\n\nBom apetite! 🍕\n\n{store_name}",
                'is_active' => true,
            ],
        ];

        foreach ($templates as $template) {
            WhatsAppTemplate::firstOrCreate(
                ['key' => $template['key']],
                $template
            );
        }
    }
}
