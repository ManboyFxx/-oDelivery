<?php
/**
 * convert-to-webp.php
 * Script para converter todas as imagens existentes no banco de mídia para WebP.
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);
set_time_limit(300); // 5 minutos

// Bootstrap Laravel
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

use App\Models\MediaFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Laravel\Facades\Image;

echo "<h1>🔄 OoDelivery - Conversor WebP em Massa</h1>";

$mediaFiles = MediaFile::all();
$total = count($mediaFiles);
$converted = 0;
$skipped = 0;
$errors = 0;

echo "<p>Encontrados <b>$total</b> arquivos no banco de mídia.</p><hr>";

foreach ($mediaFiles as $media) {
    echo "📄 Processando: <code>{$media->path}</code>... ";

    // Pula se já for webp
    if (pathinfo($media->path, PATHINFO_EXTENSION) === 'webp') {
        echo "<span style='color:blue'>PULADO (Já é WebP)</span><br>";
        $skipped++;
        continue;
    }

    if (!Storage::disk('public')->exists($media->path)) {
        echo "<span style='color:red'>ERRO (Arquivo não encontrado no disco)</span><br>";
        $errors++;
        continue;
    }

    try {
        $oldPath = $media->path;
        $newFilename = pathinfo($media->filename, PATHINFO_FILENAME) . '.webp';
        $newPath = dirname($media->path) . '/' . $newFilename;

        // 1. Ler e converter
        $imgData = Storage::disk('public')->get($oldPath);
        $image = Image::read($imgData);
        $encoded = $image->toWebp(85); // Qualidade um pouco maior para conversão em massa

        // 2. Salvar novo
        Storage::disk('public')->put($newPath, (string) $encoded);

        // 3. Atualizar Banco
        $media->update([
            'filename' => $newFilename,
            'path' => $newPath,
            'mime_type' => 'image/webp',
            'size' => Storage::disk('public')->size($newPath)
        ]);

        // 4. Deletar Antigo
        Storage::disk('public')->delete($oldPath);

        echo "<span style='color:green'>SUCESSO (Convertido)</span><br>";
        $converted++;
    } catch (\Exception $e) {
        echo "<span style='color:red'>FALHA: " . $e->getMessage() . "</span><br>";
        $errors++;
    }
}

echo "<hr><h3>Resumo Final:</h3>";
echo "✅ Convertidos: $converted<br>";
echo "🔵 Pulados: $skipped<br>";
echo "❌ Erros: $errors<br>";

echo "<p><br><a href='/'>Voltar para o site</a></p>";
?>