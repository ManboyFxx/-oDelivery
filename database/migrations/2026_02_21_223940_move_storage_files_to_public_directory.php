<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\File;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $oldStoragePath = storage_path('app/public');
        $newStoragePath = public_path('storage');

        // Se public/storage for um symlink, removemos para dar lugar ao diretório real
        if (is_link($newStoragePath)) {
            unlink($newStoragePath);
        }

        // Garante que a nova pasta exista como um diretório real
        if (!File::exists($newStoragePath)) {
            File::makeDirectory($newStoragePath, 0755, true);
        }

        // Copia todos os arquivos da antiga (storage/app/public) para a nova (public/storage)
        if (File::exists($oldStoragePath) && is_dir($oldStoragePath)) {
            File::copyDirectory($oldStoragePath, $newStoragePath);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No down needed para essa migração de arquivos
    }
};
