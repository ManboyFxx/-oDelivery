<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('customer_addresses', function (Blueprint $table) {
            $table->text('street')->change();
            $table->text('number')->nullable()->change();
            $table->text('complement')->nullable()->change();
            $table->text('neighborhood')->nullable()->change();
            $table->text('city')->nullable()->change();
            $table->text('state')->nullable()->change();
            $table->text('zip_code')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('customer_addresses', function (Blueprint $table) {
            $table->string('street', 255)->change();
            $table->string('number', 255)->nullable()->change();
            $table->string('complement', 255)->nullable()->change();
            $table->string('neighborhood', 255)->nullable()->change();
            $table->string('city', 255)->nullable()->change();
            $table->string('state', 2)->nullable()->change();
            $table->string('zip_code', 10)->nullable()->change();
        });
    }
};
