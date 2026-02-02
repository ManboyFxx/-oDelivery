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
        Schema::table('store_settings', function (Blueprint $table) {
            if (!Schema::hasColumn('store_settings', 'theme_color')) {
                $table->string('theme_color')->default('#ff3d03')->after('store_name');
            }
            if (!Schema::hasColumn('store_settings', 'description')) {
                $table->text('description')->nullable()->after('address');
            }
            if (!Schema::hasColumn('store_settings', 'instagram')) {
                $table->string('instagram')->nullable()->after('whatsapp');
            }
            if (!Schema::hasColumn('store_settings', 'facebook')) {
                $table->string('facebook')->nullable()->after('instagram');
            }
            if (!Schema::hasColumn('store_settings', 'website')) {
                $table->string('website')->nullable()->after('facebook');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('store_settings', function (Blueprint $table) {
            $table->dropColumn(['theme_color', 'description', 'instagram', 'facebook', 'website']);
        });
    }
};
