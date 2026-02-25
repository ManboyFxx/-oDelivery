<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration {
    public function up(): void
    {
        // Fix all template messages: replace {{order_id}} with {{order_number}}
        // and fix incorrect message texts
        $fixes = [
            'order_confirmed' => [
                'name' => 'Pedido Confirmado ✅',
                'message' => "Olá {{customer_name}}! 🎉\n\nSeu pedido *#{{order_number}}* foi confirmado e já está sendo preparado com carinho!\n\n💰 *Total:* {{order_total}}\n📦 *Itens:* {{order_items}}\n\n_{{store_name}}_ agradece a preferência! 🍕",
            ],
            'order_ready' => [
                'name' => 'Pedido Pronto 🔔',
                'message' => "Seu pedido *#{{order_number}}* está *PRONTO*! 🙌\n\nOlá {{customer_name}}, já separamos tudo direitinho.\n\n🏍️ Em breve nosso entregador sairá com seu pedido!\n\n_{{store_name}}_",
            ],
            'order_out_for_delivery' => [
                'name' => 'Saiu para Entrega 🛵',
                'message' => "Seu pedido *#{{order_number}}* saiu para entrega! 🛵\n\nOlá {{customer_name}}, fique de olho no interfone!\n\n📍 *Endereço de entrega:* {{delivery_address}}\n\nQualquer dúvida, estamos aqui. _{{store_name}}_",
            ],
            'order_delivered' => [
                'name' => 'Pedido Entregue 🎊',
                'message' => "Pedido *#{{order_number}}* entregue com sucesso! 🎊\n\nObrigado pela preferência, {{customer_name}}!\n\nSua opinião é muito importante. Como foi sua experiência?\n\n⭐ Avalie nosso atendimento respondendo esta mensagem.\n\n_{{store_name}}_",
            ],
            'order_cancelled' => [
                'name' => 'Pedido Cancelado ❌',
                'message' => "Olá {{customer_name}}, informamos que seu pedido *#{{order_number}}* foi *cancelado*.\n\nSentimos muito pelo inconveniente. Entre em contato para mais informações:\n📞 {{store_phone}}\n\n_{{store_name}}_",
            ],
            'welcome' => [
                'name' => 'Boas-vindas 👋',
                'message' => "Bem-vindo ao *{{store_name}}*! 👋🎉\n\nSeu cadastro foi realizado com sucesso. Agora você pode fazer pedidos com facilidade!\n\nQualquer dúvida, estamos à disposição. Até logo! 😊",
            ],
        ];

        foreach ($fixes as $key => $data) {
            $exists = DB::table('whatsapp_templates')
                ->whereNull('tenant_id')
                ->where('key', $key)
                ->exists();

            if ($exists) {
                DB::table('whatsapp_templates')
                    ->whereNull('tenant_id')
                    ->where('key', $key)
                    ->update([
                        'name' => $data['name'],
                        'message' => $data['message'],
                        'is_active' => true,
                        'updated_at' => now(),
                    ]);
            } else {
                DB::table('whatsapp_templates')->insert([
                    'id' => (string) Str::uuid(),
                    'key' => $key,
                    'name' => $data['name'],
                    'message' => $data['message'],
                    'is_active' => true,
                    'tenant_id' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    public function down(): void
    {
        // Leave templates as-is on rollback
    }
};
