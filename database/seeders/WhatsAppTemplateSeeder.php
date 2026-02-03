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
                'message' => "🎉 *Pedido Confirmado!*\n\nOlá {customer_name}!\n\nSeu pedido #{order_number} foi confirmado.\n\n📝 *Resumo:*\n{order_items}\n\n💲 Taxa de Entrega: {delivery_fee}\n💰 *Total: {order_total}*\n💳 Pagamento: {payment_method}\n\n🏪 {store_name}\n\nObrigado pela preferência!",
                'is_active' => true,
            ],
            [
                'key' => 'order_ready',
                'name' => 'Pedido Pronto',
                'message' => "✅ *Pedido Pronto!*\n\n{customer_name}, seu pedido #{order_number} está pronto para retirada/entrega!\n\n🏪 {store_name}",
                'is_active' => true,
            ],
            [
                'key' => 'order_out_for_delivery',
                'name' => 'Saiu para Entrega',
                'message' => "🛵 *Saiu para Entrega!*\n\n{customer_name}, seu pedido #{order_number} já está a caminho.\n\n📍 *Endereço:* {delivery_address}\n\nFique atento ao entregador!\n\n{store_name}",
                'is_active' => true,
            ],
            [
                'key' => 'order_delivered',
                'name' => 'Pedido Entregue',
                'message' => "🎉 *Pedido Entregue!*\n\n{customer_name}, seu pedido #{order_number} foi entregue com sucesso.\n\nEspero que goste! 🍕\n\nQue tal nos avaliar?\n\n{store_name}",
                'is_active' => true,
            ],
        ];

        foreach ($templates as $template) {
            WhatsAppTemplate::updateOrCreate(
                ['key' => $template['key']],
                $template
            );
        }
    }
}
