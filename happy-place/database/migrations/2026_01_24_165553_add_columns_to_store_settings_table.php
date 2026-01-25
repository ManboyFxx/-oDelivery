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
            $table->json('business_hours')->nullable()->after('whatsapp');
            $table->string('theme_color')->default('#ff3d03')->after('business_hours');
            $table->text('description')->nullable()->after('store_name');
            $table->string('instagram')->nullable()->after('description');
            $table->string('facebook')->nullable()->after('instagram');
            $table->string('website')->nullable()->after('facebook');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('store_settings', function (Blueprint $table) {
            $table->dropColumn([
                'business_hours',
                'theme_color',
                'description',
                'instagram',
                'facebook',
                'website',
            ]);
        });
    }
};
