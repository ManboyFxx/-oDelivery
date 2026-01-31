<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('complement_options', function (Blueprint $table) {
            $table->integer('max_quantity')->default(1)->after('price');
        });
    }

    public function down(): void
    {
        Schema::table('complement_options', function (Blueprint $table) {
            $table->dropColumn('max_quantity');
        });
    }
};
