<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('media_files', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('tenant_id')->constrained()->cascadeOnDelete();
            $table->string('original_name');
            $table->string('filename');
            $table->string('path'); // storage key: media/{tenant_id}/filename.jpg
            $table->unsignedBigInteger('size')->default(0); // bytes
            $table->string('mime_type', 100);
            $table->timestamps();

            $table->index('tenant_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('media_files');
    }
};
