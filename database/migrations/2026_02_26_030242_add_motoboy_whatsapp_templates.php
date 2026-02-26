<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        $templates = [
            'motoboy_assigned' => [
                'name' => 'Entregador Atribuído 📦',
                'message' => "📦 Olá *{{motoboy_name}}*, um novo pedido (*#{{order_number}}*) foi atribuído a você na loja _{{store_name}}_!\n\n📍 **Endereço:**\n{{delivery_address}}\n\nPor favor, dirija-se ao local para coleta.",
            ],
            'order_approaching' => [
                'name' => 'Entregador Chegando 🛵',
                'message' => "🛵 Olá *{{customer_name}}*, o entregador está chegando com seu pedido (*#{{order_number}}*)!\n\nFique atento e prepare-se para receber seu pedido.\n\n_{{store_name}}_",
            ],
        ];

        foreach ($templates as $key => $data) {
            $exists = DB::table('whatsapp_templates')
                ->where('key', $key)
                ->whereNull('tenant_id')
                ->exists();

            if (!$exists) {
                DB::table('whatsapp_templates')->insert([
                    'id' => (string) \Illuminate\Support\Str::uuid(),
                    'key' => $key,
                    'name' => $data['name'],
                    'message' => $data['message'],
                    'tenant_id' => null,
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    public function down(): void
    {
        DB::table('whatsapp_templates')
            ->whereIn('key', ['motoboy_assigned', 'order_approaching'])
            ->whereNull('tenant_id')
            ->delete();
    }
};
