<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('order_item_complements', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('order_item_id');
            $table->uuid('complement_option_id');
            $table->string('name');
            $table->decimal('price', 10, 2);
            $table->integer('quantity')->default(1);
            $table->timestamps();

            $table->foreign('order_item_id')->references('id')->on('order_items')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_item_complements');
    }
};
