<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        $templates = [
            'order_confirmed' => [
                'name' => 'Pedido Confirmado ✅',
                'message' => "Olá *{{customer_name}}*! 👋\n\nÓtimas notícias! Seu pedido *#{{order_number}}* foi confirmado e já está na fila de preparo. 🎉\n\nNossa equipe está cuidando de tudo para que seu pedido chegue fresquinho e delicioso! 🥯🔥\n\n📝 **Detalhes do Pedido:**\n{{order_items}}\n\n💰 **Total:** {{order_total}}\n⏱️ **Previsão:** {{estimated_time}}\n\n_{{store_name}}_ agradece a preferência! 🍕❤️",
            ],
            'order_ready' => [
                'name' => 'Pedido Pronto 🔔',
                'message' => "Seu pedido *#{{order_number}}* está *PRONTO*! 🙌\n\nOlá {{customer_name}}, já separamos tudo direitinho.\n\n🏍️ Em breve nosso entregador sairá com seu pedido!\n\n_{{store_name}}_",
            ],
            'order_out_for_delivery' => [
                'name' => 'Saiu para Entrega 🛵',
                'message' => "Prepare a mesa, *{{customer_name}}*! 🛵🥡\n\nSeu pedido *#{{order_number}}* acaba de sair para entrega!\n\n📍 **Endereço de entrega:**\n{{delivery_address}}\n\nFique de olho no interfone! Nosso entregador já está a caminho. 🚀\n\nQualquer dúvida, estamos aqui. _{{store_name}}_",
            ],
            'order_delivered' => [
                'name' => 'Pedido Entregue 🎊',
                'message' => "Pedido *#{{order_number}}* entregue com sucesso! 🎊\n\nObrigado pela preferência, {{customer_name}}!\n\nSua opinião é muito importante para nós. Como foi sua experiência?\n\n⭐ Avalie nosso atendimento respondendo esta mensagem.\n\n_{{store_name}}_ agradece! ❤️",
            ],
            'order_cancelled' => [
                'name' => 'Pedido Cancelado ❌',
                'message' => "Olá {{customer_name}}, informamos que seu pedido *#{{order_number}}* foi *cancelado*.\n\nSentimos muito pelo inconveniente. Para entender o motivo ou tirar dúvidas, entre em contato:\n📞 {{store_phone}}\n\n_{{store_name}}_",
            ],
            'welcome' => [
                'name' => 'Boas-vindas 👋',
                'message' => "Bem-vindo ao *{{store_name}}*! 👋🎉\n\nSeu cadastro foi realizado com sucesso. Agora você pode fazer pedidos com facilidade e rapidez!\n\nQualquer dúvida, estamos à disposição no site: {{store_url}}\n\nAté logo! 😊",
            ],
        ];

        foreach ($templates as $key => $data) {
            DB::table('whatsapp_templates')
                ->where('key', $key)
                ->whereNull('tenant_id') // Only update system-wide defaults
                ->update([
                    'name' => $data['name'],
                    'message' => $data['message'],
                    'updated_at' => now(),
                ]);
        }
    }

    public function down(): void
    {
        // No rollback needed for template text changes
    }
};
