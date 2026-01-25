<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\Tenant;
use App\Services\SettingsService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TenantMenuController extends Controller
{
    protected $settingsService;

    public function __construct(SettingsService $settingsService)
    {
        $this->settingsService = $settingsService;
    }

    public function show($slug)
    {
        // Get tenant by slug
        $tenant = \App\Models\Tenant::where('slug', $slug)->firstOrFail();

        // Get settings for this tenant
        $settings = \App\Models\StoreSetting::where('tenant_id', $tenant->id)->firstOrCreate(
            ['tenant_id' => $tenant->id],
            ['store_name' => $tenant->name]
        );

        // Check for logged in customer
        $customer = null;
        if (session('customer_id')) {
            $customer = \App\Models\Customer::find(session('customer_id'));
        }

        $tenantId = $tenant->id;

        $deliveryZones = \App\Models\DeliveryZone::where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->orderBy('display_order')
            ->orderBy('neighborhood')
            ->get();

        $paymentMethods = \App\Models\PaymentMethod::where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->orderBy('display_order')
            ->get();

        $categories = Category::where('tenant_id', $tenantId)
            ->with([
                'products' => function ($query) {
                    $query->where('is_available', true)
                        ->with([
                            'complementGroups.options' => function ($q) {
                                $q->where('is_available', true)
                                    ->orderBy('sort_order')
                                    ->select('id', 'group_id', 'name', 'price', 'is_available', 'max_quantity', 'sort_order');
                            }
                        ]);
                }
            ])
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        return Inertia::render('Tenant/Menu/Index', [
            'slug' => $slug,
            'categories' => $categories,
            'authCustomer' => $customer,
            'store' => [
                'name' => $settings->store_name ?? 'ÓoDelivery Demo',
                'logo_url' => $settings->logo_path ? "/storage/{$settings->logo_path}" : $settings->logo_url,
                'banner_url' => $settings->banner_path ? "/storage/{$settings->banner_path}" : $settings->banner_url,
                'phone' => $settings->phone,
                'whatsapp' => $settings->whatsapp,
                'email' => $settings->email,
                'address' => $settings->address,
                'theme_color' => $settings->pwa_theme_color ?? '#ff3d03',
                'theme_mode' => $settings->menu_theme ?? 'modern-clean',
                'loyalty_enabled' => $settings->loyalty_enabled ?? true,
                'operating_hours_formatted' => $this->settingsService->formatOperatingHours($settings->business_hours),
                'is_open' => $settings->isOpenNow(),
                'is_delivery_paused' => $settings->is_delivery_paused ?? false,
                'paused_until' => $settings->paused_until,
                'estimated_delivery_time' => $settings->estimated_delivery_time ?? 30,
                'delivery_zones' => $deliveryZones,
                'payment_methods' => $paymentMethods,
                'settings' => $settings,
            ]
        ]);
    }
}
