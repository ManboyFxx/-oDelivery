<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Ensure table exists (sanity check, though dependency order handles it)
        if (Schema::hasTable('whatsapp_templates')) {

            $defaults = [
                [
                    'key' => 'order_confirmed',
                    'name' => 'Pedido Confirmado',
                    'message' => 'Olá {{customer_name}}! Seu pedido #{{order_id}} foi confirmado e já está sendo preparado. O valor total é R$ {{order_total}}.',
                ],
                [
                    'key' => 'order_ready',
                    'name' => 'Pedido Pronto',
                    'message' => 'Tudo pronto, {{customer_name}}! Seu pedido #{{order_id}} saiu para entrega. Fique atento ao interfone ou campainha!',
                ],
                [
                    'key' => 'order_canceled',
                    'name' => 'Pedido Cancelado',
                    'message' => 'Olá {{customer_name}}. Infelizmente seu pedido #{{order_id}} precisou ser cancelado. Entre em contato para mais detalhes.',
                ],
                [
                    'key' => 'welcome',
                    'name' => 'Boas Vindas',
                    'message' => 'Bem-vindo ao *{{store_name}}*! 🍕\nSeu cadastro foi realizado com sucesso.\n\nFaça seu pedido agora pelo nosso cardápio: {{menu_url}}',
                ]
            ];

            foreach ($defaults as $template) {
                // Insert if key doesn't exist
                if (!DB::table('whatsapp_templates')->where('key', $template['key'])->exists()) {
                    DB::table('whatsapp_templates')->insert([
                        'id' => (string) Str::uuid(),
                        'key' => $template['key'],
                        'name' => $template['name'],
                        'message' => $template['message'],
                        'is_active' => true,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Optional: delete the templates? Better to leave them.
    }
};
