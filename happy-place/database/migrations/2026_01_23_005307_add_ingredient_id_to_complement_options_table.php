<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('complement_options', function (Blueprint $table) {
            $table->foreignUuid('ingredient_id')->nullable()->after('complement_group_id')->constrained()->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('complement_options', function (Blueprint $table) {
            $table->dropForeign(['ingredient_id']);
            $table->dropColumn('ingredient_id');
        });
    }
};
