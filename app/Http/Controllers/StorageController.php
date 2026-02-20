<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Response;

class StorageController extends Controller
{
    public function serve(string $path)
    {
        $disk = Storage::disk('public');

        if (!$disk->exists($path)) {
            abort(404);
        }

        $file = $disk->get($path);
        $mimeType = $disk->mimeType($path);
        $size = $disk->size($path);

        return Response::make($file, 200, [
            'Content-Type' => $mimeType,
            'Content-Length' => $size,
            'Cache-Control' => 'public, max-age=31536000, immutable',
        ]);
    }
}
