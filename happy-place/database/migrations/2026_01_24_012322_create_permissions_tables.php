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
        // Roles table
        Schema::create('roles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // Permissions table
        Schema::create('permissions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('category'); // 'orders', 'products', 'settings', etc.
            $table->text('description')->nullable();
            $table->timestamps();

            $table->index('category');
        });

        // Role-Permission pivot
        Schema::create('role_permission', function (Blueprint $table) {
            $table->foreignUuid('role_id')->constrained()->onDelete('cascade');
            $table->foreignUuid('permission_id')->constrained()->onDelete('cascade');
            $table->primary(['role_id', 'permission_id']);
        });

        // User-Role pivot
        Schema::create('user_role', function (Blueprint $table) {
            $table->foreignUuid('user_id')->constrained()->onDelete('cascade');
            $table->foreignUuid('role_id')->constrained()->onDelete('cascade');
            $table->primary(['user_id', 'role_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_role');
        Schema::dropIfExists('role_permission');
        Schema::dropIfExists('permissions');
        Schema::dropIfExists('roles');
    }
};
