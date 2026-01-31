<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('product_complement_groups', function (Blueprint $table) {
            $table->uuid('product_id');
            $table->uuid('group_id');
            $table->primary(['product_id', 'group_id']);

            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
            $table->foreign('group_id')->references('id')->on('complement_groups')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_complement_groups');
    }
};
