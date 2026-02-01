<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Adicionar colunas se não existirem
            if (!Schema::hasColumn('orders', 'motoboy_accepted_at')) {
                $table->timestamp('motoboy_accepted_at')->nullable()->after('delivered_at');
            }

            if (!Schema::hasColumn('orders', 'motoboy_delivery_started_at')) {
                $table->timestamp('motoboy_delivery_started_at')->nullable()->after('motoboy_accepted_at');
            }

            if (!Schema::hasColumn('orders', 'motoboy_delivered_at')) {
                $table->timestamp('motoboy_delivered_at')->nullable()->after('motoboy_delivery_started_at');
            }

            if (!Schema::hasColumn('orders', 'delivery_proof_photo')) {
                $table->string('delivery_proof_photo')->nullable()->after('motoboy_delivered_at');
            }

            if (!Schema::hasColumn('orders', 'motoboy_rating_id')) {
                $table->uuid('motoboy_rating_id')->nullable()->after('delivery_proof_photo');
                $table->foreign('motoboy_rating_id')->references('id')->on('motoboy_ratings')->onDelete('set null');
            }
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            if (Schema::hasColumn('orders', 'motoboy_rating_id')) {
                $table->dropForeign(['motoboy_rating_id']);
                $table->dropColumn('motoboy_rating_id');
            }

            if (Schema::hasColumn('orders', 'delivery_proof_photo')) {
                $table->dropColumn('delivery_proof_photo');
            }

            if (Schema::hasColumn('orders', 'motoboy_delivered_at')) {
                $table->dropColumn('motoboy_delivered_at');
            }

            if (Schema::hasColumn('orders', 'motoboy_delivery_started_at')) {
                $table->dropColumn('motoboy_delivery_started_at');
            }

            if (Schema::hasColumn('orders', 'motoboy_accepted_at')) {
                $table->dropColumn('motoboy_accepted_at');
            }
        });
    }
};
