<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('store_settings', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id')->unique();

            // Informações básicas
            $table->string('store_name')->nullable();
            $table->string('logo_url')->nullable();
            $table->string('banner_url')->nullable();
            $table->text('address')->nullable();
            $table->string('phone')->nullable();
            $table->string('whatsapp')->nullable();

            // Horários
            $table->json('operating_hours')->nullable();
            $table->json('special_hours')->nullable();

            // Delivery
            $table->decimal('delivery_radius_km', 5, 2)->default(10);
            $table->decimal('min_order_delivery', 10, 2)->default(0);
            $table->decimal('free_delivery_min', 10, 2)->nullable();
            $table->decimal('delivery_fee_per_km', 10, 2)->default(2);
            $table->enum('delivery_fee_mode', ['fixed', 'per_km', 'by_zone', 'by_neighborhood'])->default('fixed');
            $table->decimal('fixed_delivery_fee', 10, 2)->default(5);

            // Mesa
            $table->decimal('service_fee_percentage', 5, 2)->default(10);
            $table->decimal('suggested_tip_percentage', 5, 2)->default(10);

            // Fidelidade
            $table->decimal('points_per_currency', 5, 2)->default(1);
            $table->decimal('currency_per_point', 5, 4)->default(0.01);
            $table->boolean('loyalty_enabled')->default(true);

            // Impressão
            $table->integer('printer_paper_width')->default(80);
            $table->boolean('auto_print_on_confirm')->default(true);
            $table->integer('print_copies')->default(1);
            $table->text('print_footer_message')->nullable();

            // Integrações
            $table->string('mapbox_token')->nullable();
            $table->decimal('store_latitude', 10, 8)->nullable();
            $table->decimal('store_longitude', 11, 8)->nullable();
            $table->string('mercadopago_access_token')->nullable();
            $table->string('mercadopago_public_key')->nullable();
            $table->string('evolution_api_url')->nullable();
            $table->string('evolution_api_key')->nullable();
            $table->string('evolution_instance_name')->nullable();

            // Tema do cardápio
            $table->json('menu_theme')->nullable();

            // PWA
            $table->string('pwa_name')->nullable();
            $table->string('pwa_short_name')->nullable();
            $table->string('pwa_theme_color')->default('#f97316');
            $table->string('pwa_background_color')->default('#ffffff');

            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('store_settings');
    }
};
