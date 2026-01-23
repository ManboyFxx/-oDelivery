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

        return Inertia::render('Settings/Index', [
            'settings' => $settings,
            'success' => session('success'),
        ]);
    }

    public function update(Request $request)
    {
        $tenant = Tenant::firstOrFail(); // Assuming single tenant for demo

        // Validate request... simplified for now
        $validated = $request->except(['id', 'tenant_id', 'created_at', 'updated_at']);

        // Handle file uploads if any (logo, banner) in future

        DB::transaction(function () use ($tenant, $validated) {
            $settings = StoreSetting::where('tenant_id', $tenant->id)->firstOrFail();
            $settings->update($validated);
        });

        return back()->with('success', 'Configurações salvas com sucesso!');
    }
}
