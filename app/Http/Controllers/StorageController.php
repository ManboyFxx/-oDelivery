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

            // Try different possible paths for common shared hosting layouts
            $pathsToTry = [
                public_path('uploads/' . $path),
                storage_path('app/public/' . $path),
                base_path('storage/app/public/' . $path),
                public_path($path), // In case the second 'uploads' or 'storage' is already in $path
                // Hostinger/Shared hosting specific candidates (traversing up)
                realpath(base_path('../public_html/uploads/' . $path)),
                realpath(base_path('../public_html/storage/app/public/' . $path)),
                realpath(base_path('../storage/app/public/' . $path)),
                realpath(dirname(public_path()) . '/uploads/' . $path),
            ];

            $fullPath = null;
            foreach ($pathsToTry as $candidate) {
                if ($candidate && file_exists($candidate) && !is_dir($candidate)) {
                    $fullPath = $candidate;
                    break;
                }
            }

            if (!$fullPath) {
                \Log::warning('File not found in any candidate path:', [
                    'requested_path' => $path,
                    'public_path' => public_path(),
                    'base_path' => base_path(),
                ]);
                abort(404, 'Arquivo não encontrado');
            }

            return response()->file($fullPath, [
                'Cache-Control' => 'public, max-age=31536000, immutable',
            ]);
        } catch (\Exception $e) {
            \Log::error('Storage serve error:', [
                'path' => $path,
                'error' => $e->getMessage()
            ]);
            // If it's already an 404 abort, let it pass
            if ($e instanceof \Symfony\Component\HttpKernel\Exception\HttpException) {
                throw $e;
            }
            abort(500, 'Erro ao carregar imagem');
        }
    }
}
