<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\File;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $oldStoragePath1 = storage_path('app/public');
        $oldStoragePath2 = public_path('storage');
        $newUploadsPath = public_path('uploads');

        // Garante que a pasta uploads exista
        if (!File::exists($newUploadsPath)) {
            File::makeDirectory($newUploadsPath, 0755, true);
        }

        // Copia os dados antigos da pasta privada (se existir)
        if (File::exists($oldStoragePath1) && is_dir($oldStoragePath1)) {
            File::copyDirectory($oldStoragePath1, $newUploadsPath);
        }

        // Copia os dados da pasta pública que recém tínhamos criado (se não for um symlink, para evitar loop)
        if (File::exists($oldStoragePath2) && is_dir($oldStoragePath2) && !is_link($oldStoragePath2)) {
            File::copyDirectory($oldStoragePath2, $newUploadsPath);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Sem rollback para não perder arquivos
    }
};
