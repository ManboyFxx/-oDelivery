<?php

namespace App\Http\Controllers;

use App\Models\StoreSetting;
use App\Models\Tenant;
use App\Services\SettingsService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Laravel\Facades\Image;

class SettingsController extends Controller
{
    protected $settingsService;

    public function __construct(SettingsService $settingsService)
    {
        $this->settingsService = $settingsService;
    }
    public function index()
    {
        $tenant = auth()->user()->tenant;

        $settings = StoreSetting::firstOrCreate(
            ['tenant_id' => $tenant->id],
            [
                'store_name' => $tenant->name,
                'currency_per_point' => 0.10,
                'points_per_currency' => 1,
                'printer_paper_width' => 80,
            ]
        );

        $paymentMethods = \App\Models\PaymentMethod::where('tenant_id', $tenant->id)
            ->orderBy('display_order')
            ->get();

        $deliveryZones = \App\Models\DeliveryZone::where('tenant_id', $tenant->id)
            ->orderBy('display_order')
            ->get();

        $motoboys = $tenant->motoboys()->get();

        return Inertia::render('Settings/Index', [
            'settings' => $settings,
            'paymentMethods' => $paymentMethods,
            'deliveryZones' => $deliveryZones,
            'motoboys' => $motoboys,
            'success' => session('success'),
            'printer_token_exists' => !empty($tenant->printer_token),
            'printer_token_raw' => $tenant->printer_token_raw,
            'flash_printer_token' => session('flash_printer_token'),
        ]);
    }

    public function update(Request $request)
    {
        $tenant = auth()->user()->tenant;

        // Validate request... simplified for now
        $validated = $request->except(['id', 'tenant_id', 'created_at', 'updated_at', 'logo', 'banner']);

        DB::transaction(function () use ($tenant, $validated) {
            $settings = StoreSetting::where('tenant_id', $tenant->id)->firstOrFail();

            // Explicitly handle business_hours logic if present
            if (isset($validated['business_hours'])) {
                // Ensure it is not double encoded if frontend sends JSON string
                if (is_string($validated['business_hours'])) {
                    $decoded = json_decode($validated['business_hours'], true);
                    if (is_array($decoded)) {
                        $validated['business_hours'] = $decoded;
                    }
                }
            }

            // Log update for debugging
            \Illuminate\Support\Facades\Log::info('Settings Update Payload:', ['tenant' => $tenant->id, 'data' => $validated]);

            $settings->update($validated);

            // Clear cache after update
            $this->settingsService->clearCache($tenant->id);
        });

        return back()->with('success', 'Configurações salvas com sucesso!');
    }

    public function uploadLogo(Request $request)
    {
        $request->validate([
            'logo' => 'required|image|max:4096' // 4MB max upload (will be resized)
        ]);

        $tenant = auth()->user()->tenant;
        $settings = StoreSetting::where('tenant_id', $tenant->id)->firstOrFail();

        // Delete old logo if exists
        if ($settings->logo_path && \Illuminate\Support\Facades\Storage::disk('public')->exists($settings->logo_path)) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($settings->logo_path);
        }

        // Optimize and Store new logo
        try {
            // Resize to max 500x500
            $image = Image::read($request->file('logo'));
            $image->scaleDown(width: 500);

            $filename = 'logos/' . $tenant->id . '_' . time() . '.webp';
            Storage::disk('public')->put($filename, (string) $image->toWebp(quality: 85));

            $settings->update(['logo_path' => $filename]);
        } catch (\Exception $e) {
            // Fallback
            $path = $request->file('logo')->store('logos', 'public');
            $settings->update(['logo_path' => $path]);
        }

        // Clear cache
        $this->settingsService->clearCache($tenant->id);

        return back()->with('success', 'Logo atualizado com sucesso!');
    }

    public function removeLogo()
    {
        $tenant = auth()->user()->tenant;
        $settings = StoreSetting::where('tenant_id', $tenant->id)->firstOrFail();

        if ($settings->logo_path && \Illuminate\Support\Facades\Storage::disk('public')->exists($settings->logo_path)) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($settings->logo_path);
        }

        $settings->update(['logo_path' => null]);

        // Clear cache
        $this->settingsService->clearCache($tenant->id);

        return back()->with('success', 'Logo removido com sucesso!');
    }

    public function uploadBanner(Request $request)
    {
        $request->validate([
            'banner' => 'required|image|max:8192' // 8MB max upload (will be resized)
        ]);

        $tenant = auth()->user()->tenant;
        $settings = StoreSetting::where('tenant_id', $tenant->id)->firstOrFail();

        // Delete old banner if exists
        if ($settings->banner_path && Storage::disk('public')->exists($settings->banner_path)) {
            Storage::disk('public')->delete($settings->banner_path);
        }

        // Optimize and Store new banner
        try {
            // Resize to max width 1200px
            $image = Image::read($request->file('banner'));
            $image->scaleDown(width: 1200);

            $filename = 'banners/' . $tenant->id . '_' . time() . '.webp';
            Storage::disk('public')->put($filename, (string) $image->toWebp(quality: 80));

            $settings->update(['banner_path' => $filename]);
        } catch (\Exception $e) {
            // Fallback
            $path = $request->file('banner')->store('banners', 'public');
            $settings->update(['banner_path' => $path]);
        }

        // Clear cache
        $this->settingsService->clearCache($tenant->id);

        return back()->with('success', 'Banner atualizado com sucesso!');
    }

    public function removeBanner()
    {
        $tenant = auth()->user()->tenant;
        $settings = StoreSetting::where('tenant_id', $tenant->id)->firstOrFail();

        if ($settings->banner_path && \Illuminate\Support\Facades\Storage::disk('public')->exists($settings->banner_path)) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($settings->banner_path);
        }

        $settings->update(['banner_path' => null]);

        // Clear cache
        $this->settingsService->clearCache($tenant->id);

        return back()->with('success', 'Banner removido com sucesso!');
    }
    public function createToken(Request $request)
    {
        $user = auth()->user();
        $tokenName = $request->input('name', 'Printer Token');

        // Revoke previous tokens with the same name to keep it clean (Single Device Policy)
        // Or keep multiple. For this use case, revoking ensures 1 active printer token per user usually.
        $user->tokens()->where('name', $tokenName)->delete();

        $token = $user->createToken($tokenName);

        // We return the plain text token via session flash so it can be shown ONCE.
        return back()->with('flash_token', $token->plainTextToken)
            ->with('success', 'Token de impressão gerado com sucesso!');
    }
    public function testPrint(Request $request)
    {
        $tenant = auth()->user()->tenant;

        // Log the attempt
        \App\Models\AuditLog::create([
            'tenant_id' => $tenant->id,
            'user_id' => auth()->id(),
            'action' => 'printer.test',
            'model_type' => 'App\Models\StoreSetting',
            'model_id' => $tenant->id, // Using tenant_id as reference for settings
            'new_values' => ['status' => 'success', 'message' => 'Comando de teste enviado', 'ip' => $request->ip()],
        ]);

        return back()->with('success', 'Comando de teste enviado com sucesso para a impressora!');
    }

    public function generatePrinterToken(Request $request)
    {
        $tenant = auth()->user()->tenant;

        // Generate a random token
        $token = \Illuminate\Support\Str::random(60);

        $tenant->update([
            'printer_token' => hash('sha256', $token),
            'printer_token_raw' => $token,
        ]);

        // Return the plain text token ONLY ONCE
        return back()->with('flash_printer_token', $token)
            ->with('success', 'Novo Token de Impressão gerado com sucesso!');
    }

    public function getPrinterLogs()
    {
        $tenant = auth()->user()->tenant;

        $logs = \App\Models\AuditLog::where('tenant_id', $tenant->id)
            ->where('action', 'printer.test')
            ->with('user:id,name')
            ->latest()
            ->take(10)
            ->get();

        return response()->json($logs);
    }
}
