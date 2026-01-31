<?php

namespace App\Http\Controllers;

use App\Models\StoreSetting;
use App\Models\Tenant;
use App\Services\SettingsService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

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
        ]);
    }

    public function update(Request $request)
    {
        $tenant = auth()->user()->tenant;

        // Validate request... simplified for now
        $validated = $request->except(['id', 'tenant_id', 'created_at', 'updated_at', 'logo', 'banner']);

        DB::transaction(function () use ($tenant, $validated) {
            $settings = StoreSetting::where('tenant_id', $tenant->id)->firstOrFail();
            $settings->update($validated);

            // Clear cache after update
            $this->settingsService->clearCache($tenant->id);
        });

        return back()->with('success', 'Configurações salvas com sucesso!');
    }

    public function uploadLogo(Request $request)
    {
        $request->validate([
            'logo' => 'required|image|max:2048' // 2MB max
        ]);

        $tenant = auth()->user()->tenant;
        $settings = StoreSetting::where('tenant_id', $tenant->id)->firstOrFail();

        // Delete old logo if exists
        if ($settings->logo_path && \Illuminate\Support\Facades\Storage::disk('public')->exists($settings->logo_path)) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($settings->logo_path);
        }

        // Store new logo
        $path = $request->file('logo')->store('logos', 'public');
        $settings->update(['logo_path' => $path]);

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
            'banner' => 'required|image|max:4096' // 4MB max
        ]);

        $tenant = auth()->user()->tenant;
        $settings = StoreSetting::where('tenant_id', $tenant->id)->firstOrFail();

        // Delete old banner if exists
        if ($settings->banner_path && \Illuminate\Support\Facades\Storage::disk('public')->exists($settings->banner_path)) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($settings->banner_path);
        }

        // Store new banner
        $path = $request->file('banner')->store('banners', 'public');
        $settings->update(['banner_path' => $path]);

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
}
