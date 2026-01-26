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
                        ->select('id', 'tenant_id', 'category_id', 'name', 'description', 'price', 'promotional_price', 'image_url', 'track_stock', 'stock_quantity', 'is_available', 'is_featured', 'is_promotional', 'is_new', 'is_exclusive', 'loyalty_earns_points', 'loyalty_redeemable', 'loyalty_points_cost')
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

        // Get loyalty rewards category if exists
        $loyaltyRewardsCategory = Category::where('tenant_id', $tenantId)
            ->where('category_type', 'loyalty_rewards')
            ->with([
                'products' => function ($query) {
                    $query->where('is_available', true)
                        ->where('loyalty_redeemable', true)
                        ->select('id', 'tenant_id', 'category_id', 'name', 'description', 'price', 'image_url', 'track_stock', 'stock_quantity', 'is_available', 'is_featured', 'is_promotional', 'is_new', 'is_exclusive', 'loyalty_earns_points', 'loyalty_redeemable', 'loyalty_points_cost');
                }
            ])
            ->where('is_active', true)
            ->first();

        // Add loyalty rewards category to the beginning if it exists and has products
        if ($loyaltyRewardsCategory && $loyaltyRewardsCategory->products->count() > 0) {
            $categories->prepend($loyaltyRewardsCategory);
        }

        // Get active loyalty promotion for banner (FASE 4)
        $activePromotion = \App\Models\LoyaltyPromotion::where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now())
            ->first();

        return Inertia::render('Tenant/Menu/Index', [
            'slug' => $slug,
            'categories' => $categories,
            'authCustomer' => $customer,
            'activePromotion' => $activePromotion,
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
    public function demo($slug)
    {
        $tenant = \App\Models\Tenant::where('slug', $slug)->firstOrFail();
        $settings = \App\Models\StoreSetting::where('tenant_id', $tenant->id)->firstOrCreate(
            ['tenant_id' => $tenant->id],
            ['store_name' => $tenant->name]
        );
        $customer = null;
        if (session('customer_id')) {
            $customer = \App\Models\Customer::find(session('customer_id'));
        }
        $tenantId = $tenant->id;
        $deliveryZones = \App\Models\DeliveryZone::where('tenant_id', $tenantId)->where('is_active', true)->get();
        $paymentMethods = \App\Models\PaymentMethod::where('tenant_id', $tenantId)->where('is_active', true)->get();
        $categories = Category::where('tenant_id', $tenantId)
            ->with([
                'products' => function ($query) {
                    $query->where('is_available', true)
                        ->select('id', 'tenant_id', 'category_id', 'name', 'description', 'price', 'promotional_price', 'image_url', 'is_available', 'is_featured', 'is_promotional', 'is_new', 'is_exclusive')
                        ->with([
                            'complementGroups.options' => function ($q) {
                                $q->where('is_available', true)->orderBy('sort_order');
                            }
                        ]);
                }
            ])
            ->where('is_active', true)->orderBy('sort_order')->get();

        return Inertia::render('Tenant/Menu/Demo', [
            'slug' => $slug,
            'categories' => $categories,
            'authCustomer' => $customer,
            'store' => [
                'name' => $settings->store_name,
                'logo_url' => $settings->logo_path ? "/storage/{$settings->logo_path}" : $settings->logo_url,
                'theme_color' => $settings->pwa_theme_color ?? '#ff3d03',
                'operating_hours_formatted' => $this->settingsService->formatOperatingHours($settings->business_hours),
                'is_open' => $settings->isOpenNow(),
            ]
        ]);
    }
}
