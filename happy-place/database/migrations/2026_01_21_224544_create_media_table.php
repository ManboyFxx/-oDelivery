<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('media', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            $table->string('name');
            $table->string('file_path');
            $table->string('file_url');
            $table->string('mime_type');
            $table->bigInteger('file_size');
            $table->integer('width')->nullable();
            $table->integer('height')->nullable();
            $table->string('folder')->nullable();
            $table->uuid('uploaded_by');
            $table->timestamps();

            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->foreign('uploaded_by')->references('id')->on('users');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('media');
    }
};
