<?php

namespace App\Http\Controllers;

use App\Models\StoreSetting;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class SettingsController extends Controller
{
    public function index()
    {
        // For this demo, we assume a single tenant or get the first one
        // In a real app, logic would use auth()->user()->tenant_id
        $tenant = Tenant::first();

        if (!$tenant) {
            // Create a default tenant if none exists
            $tenant = Tenant::create([
                'name' => 'Demo Pizza',
                'slug' => 'demo-pizza',
                'email' => 'demo@example.com',
            ]);
        }

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

        return Inertia::render('Settings/Index', [
            'settings' => $settings,
            'paymentMethods' => $paymentMethods,
            'success' => session('success'),
        ]);
    }

    public function update(Request $request)
    {
        $tenant = Tenant::firstOrFail(); // Assuming single tenant for demo

        // Validate request... simplified for now
        $validated = $request->except(['id', 'tenant_id', 'created_at', 'updated_at', 'logo', 'banner']);

        DB::transaction(function () use ($tenant, $validated) {
            $settings = StoreSetting::where('tenant_id', $tenant->id)->firstOrFail();
            $settings->update($validated);
        });

        return back()->with('success', 'Configurações salvas com sucesso!');
    }

    public function uploadLogo(Request $request)
    {
        $request->validate([
            'logo' => 'required|image|max:2048' // 2MB max
        ]);

        $tenant = Tenant::first();
        $settings = StoreSetting::where('tenant_id', $tenant->id)->firstOrFail();

        // Delete old logo if exists
        if ($settings->logo_path && \Illuminate\Support\Facades\Storage::disk('public')->exists($settings->logo_path)) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($settings->logo_path);
        }

        // Store new logo
        $path = $request->file('logo')->store('logos', 'public');
        $settings->update(['logo_path' => $path]);

        return back()->with('success', 'Logo atualizado com sucesso!');
    }

    public function removeLogo()
    {
        $tenant = Tenant::first();
        $settings = StoreSetting::where('tenant_id', $tenant->id)->firstOrFail();

        if ($settings->logo_path && \Illuminate\Support\Facades\Storage::disk('public')->exists($settings->logo_path)) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($settings->logo_path);
        }

        $settings->update(['logo_path' => null]);
        return back()->with('success', 'Logo removido com sucesso!');
    }

    public function uploadBanner(Request $request)
    {
        $request->validate([
            'banner' => 'required|image|max:4096' // 4MB max
        ]);

        $tenant = Tenant::first();
        $settings = StoreSetting::where('tenant_id', $tenant->id)->firstOrFail();

        // Delete old banner if exists
        if ($settings->banner_path && \Illuminate\Support\Facades\Storage::disk('public')->exists($settings->banner_path)) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($settings->banner_path);
        }

        // Store new banner
        $path = $request->file('banner')->store('banners', 'public');
        $settings->update(['banner_path' => $path]);

        return back()->with('success', 'Banner atualizado com sucesso!');
    }

    public function removeBanner()
    {
        $tenant = Tenant::first();
        $settings = StoreSetting::where('tenant_id', $tenant->id)->firstOrFail();

        if ($settings->banner_path && \Illuminate\Support\Facades\Storage::disk('public')->exists($settings->banner_path)) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($settings->banner_path);
        }

        $settings->update(['banner_path' => null]);
        return back()->with('success', 'Banner removido com sucesso!');
    }
}
