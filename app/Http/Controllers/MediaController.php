<?php

namespace App\Http\Controllers;

use App\Models\MediaFile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class MediaController extends Controller
{
    /** List all media files for the current tenant. */
    public function index()
    {
        $media = MediaFile::where('tenant_id', auth()->user()->tenant_id)
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Media/Index', [
            'media' => $media,
        ]);
    }

    /** JSON list (for the picker modal). */
    public function list()
    {
        $media = MediaFile::where('tenant_id', auth()->user()->tenant_id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($media);
    }

    /** Upload a new image. */
    public function store(Request $request)
    {
        $request->validate([
            'file' => ['required', 'file', 'image', 'max:10240'], // 10MB
        ]);

        $tenantId = auth()->user()->tenant_id;
        $file = $request->file('file');
        $originalName = $file->getClientOriginalName();
        $extension = 'webp'; // Converte sempre para webp
        $filename = Str::uuid() . '.' . $extension;
        $path = "media/{$tenantId}/{$filename}";

        // Ensure directory exists with correct permissions for shared hosting
        $dirPath = storage_path("app/public/media/{$tenantId}");
        if (!file_exists($dirPath)) {
            mkdir($dirPath, 0755, true);
        }

        // Process and save image as WebP
        try {
            $image = \Intervention\Image\Laravel\Facades\Image::read($file);
            $encoded = $image->toWebp(80); // Encode as WebP with 80% quality

            Storage::disk('public')->put($path, (string) $encoded);
            $size = Storage::disk('public')->size($path);
        } catch (\Exception $e) {
            // Fallback if image processing fails (maybe incompatible image, though validated)
            \Log::error('WebP conversion failed, falling back to original upload: ' . $e->getMessage());
            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
            $path = "media/{$tenantId}/{$filename}";
            $file->storeAs("media/{$tenantId}", $filename, 'public');
            $size = $file->getSize();
        }

        $media = MediaFile::create([
            'tenant_id' => $tenantId,
            'original_name' => $originalName,
            'filename' => $filename,
            'path' => $path,
            'size' => $size,
            'mime_type' => 'image/webp',
        ]);

        return response()->json($media, 201);
    }

    /** Delete a media file. */
    public function destroy(string $id)
    {
        $media = MediaFile::where('tenant_id', auth()->user()->tenant_id)
            ->findOrFail($id);

        // Delete from disk
        Storage::disk('public')->delete($media->path);

        $media->delete();

        return response()->json(['message' => 'Deletado com sucesso.']);
    }
}
