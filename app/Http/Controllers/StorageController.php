<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Response;
use Illuminate\Http\Request;

class StorageController extends Controller
{
    public function serve(string $path, Request $request)
    {
        // Log the request for debugging
        \Log::info('Storage request:', [
            'path' => $path,
            'full_url' => $request->fullUrl(),
            'ip' => $request->ip()
        ]);

        try {
            // Sanitize path
            $path = ltrim($path, '/');
            
            // Check if file exists in public disk
            $disk = Storage::disk('public');
            $fullPath = storage_path('app/public/' . $path);
            
            \Log::info('Checking file:', ['full_path' => $fullPath, 'exists' => file_exists($fullPath)]);

            if (!file_exists($fullPath)) {
                \Log::error('File not found:', ['path' => $fullPath]);
                abort(404, 'Arquivo não encontrado');
            }

            // Get file info
            $file = file_get_contents($fullPath);
            $mimeType = mime_content_type($fullPath);
            $size = filesize($fullPath);

            \Log::info('Serving file:', [
                'path' => $path,
                'mime' => $mimeType,
                'size' => $size
            ]);

            return Response::make($file, 200, [
                'Content-Type' => $mimeType,
                'Content-Length' => $size,
                'Cache-Control' => 'public, max-age=31536000, immutable',
                'Accept-Ranges' => 'bytes',
            ]);
        } catch (\Exception $e) {
            \Log::error('Storage serve error:', [
                'path' => $path,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            abort(500, 'Erro ao servir arquivo: ' . $e->getMessage());
        }
    }
}
