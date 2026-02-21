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

        // ✅ Cache Menu Structure (60 minutes)
        // Invalidation: Product/Category observers should clear this cache
        $cacheKey = "tenant_menu_{$tenantId}";
        $sanitizedCategories = \Illuminate\Support\Facades\Cache::remember($cacheKey, 60 * 60, function () use ($tenantId) {
            $categories = Category::where('tenant_id', $tenantId)
                ->with([
                    'products' => function ($query) {
                        $query->where('is_available', true)
                            // Filter out products that are out of stock
                            ->where(function ($q) {
                                $q->where('track_stock', false)
                                    ->orWhereNull('track_stock')
                                    ->orWhere('stock_quantity', '>', 0);
                            })
                            ->select('id', 'tenant_id', 'category_id', 'name', 'description', 'price', 'promotional_price', 'image_url', 'track_stock', 'stock_quantity', 'is_available', 'is_featured', 'is_promotional', 'is_new', 'is_exclusive', 'loyalty_earns_points', 'loyalty_redeemable', 'loyalty_points_cost', 'sort_order')
                            ->orderBy('sort_order');
                    }
                ])
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->get();

            // Load complement groups for products separately to avoid query issues
            foreach ($categories as $category) {
                foreach ($category->products as $product) {
                    $product->load([
                        'complementGroups' => function ($query) {
                            $query->where('is_active', true)
                                ->orderBy('sort_order')
                                ->with([
                                    'options' => function ($q) {
                                        $q->where('is_available', true)
                                            ->with([
                                                'ingredient' => function ($qi) {
                                                    $qi->select('id', 'stock', 'is_available');
                                                }
                                            ])
                                            ->select('id', 'group_id', 'name', 'price', 'is_available', 'max_quantity', 'sort_order', 'ingredient_id');
                                    }
                                ]);
                        }
                    ]);
                }
            }

            // ✅ Sanitizar categorias e produtos
            return $categories->map(function ($category) {
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'sort_order' => $category->sort_order,
                    'products' => $category->products->map(function ($product) {
                        return [
                            'id' => $product->id,
                            'name' => $product->name,
                            'description' => $product->description,
                            'price' => $product->price,
                            'promotional_price' => $product->promotional_price,
                            'image_url' => $this->settingsService->resolveMediaUrl($product->image_url),
                            'is_available' => $product->is_available,
                            'is_featured' => $product->is_featured,
                            'is_promotional' => $product->is_promotional,
                            'is_new' => $product->is_new,
                            'is_exclusive' => $product->is_exclusive,
                            'loyalty_earns_points' => $product->loyalty_earns_points,
                            'loyalty_redeemable' => $product->loyalty_redeemable,
                            'loyalty_points_cost' => $product->loyalty_points_cost,
                            'track_stock' => $product->track_stock,
                            'stock_quantity' => $product->stock_quantity,
                            'complement_groups' => $product->complementGroups->map(function ($group) {
                                return [
                                    'id' => $group->id,
                                    'name' => $group->name,
                                    'min_selections' => $group->min_selections,
                                    'max_selections' => $group->max_selections,
                                    'is_required' => $group->is_required,
                                    'sort_order' => $group->sort_order,
                                    'options' => $group->options->map(function ($option) {
                                        return [
                                            'id' => $option->id,
                                            'name' => $option->name,
                                            'price' => $option->price,
                                            'max_quantity' => $option->max_quantity,
                                            'is_available' => $option->is_available && (!$option->ingredient || $option->ingredient->is_available),
                                            'sort_order' => $option->sort_order,
                                            'stock' => $option->ingredient ? $option->ingredient->stock : null,
                                        ];
                                    }),
                                ];
                            }),
                            // ❌ NÃO expor: tenant_id, category_id
                        ];
                    }),
                ];
            });
        });

        // ✅ Sanitizar customer
        $sanitizedCustomer = $customer ? [
            'id' => $customer->id,
            'name' => $customer->name,
            'loyalty_points' => $customer->loyalty_points,
            'loyalty_tier' => $customer->loyalty_tier,
            // ❌ NÃO expor: phone, email, tenant_id
        ] : null;

        // ✅ Sanitizar settings
        $sanitizedSettings = [
            'tenant_id' => $tenant->id, // Essential for API calls like delivery-zones
            'loyalty_enabled' => $settings->loyalty_enabled ?? true,
            'points_per_currency' => $settings->points_per_currency ?? 1,
            'currency_per_point' => $settings->currency_per_point ?? 0.10,
            // ❌ NÃO expor: printer_paper_width, auto_print_on_confirm, etc.
        ];

        // Get active loyalty promotion for banner (FASE 4)
        $activePromotion = \App\Models\LoyaltyPromotion::where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now())
            ->first();

        // Get available public coupons
        $availableCoupons = \App\Models\Coupon::where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->where(function ($query) {
                $query->whereNull('valid_until')
                    ->orWhere('valid_until', '>=', now());
            })
            ->where(function ($query) {
                $query->whereNull('max_uses')
                    ->orWhereColumn('current_uses', '<', 'max_uses');
            })
            ->get()
            ->map(function ($coupon) {
                return [
                    'id' => $coupon->id,
                    'code' => $coupon->code,
                    'discount_type' => $coupon->discount_type,
                    'discount_value' => $coupon->discount_value,
                    'min_order_value' => $coupon->min_order_value,
                ];
            });

        return Inertia::render('Tenant/Menu/Index', [
            'slug' => $slug,
            'categories' => $sanitizedCategories,
            'authCustomer' => $sanitizedCustomer,
            'activePromotion' => $activePromotion,
            'availableCoupons' => $availableCoupons,
            'store' => [
                'name' => $settings->store_name ?? 'ÓoDelivery Demo',
                'description' => $settings->description,
                'logo_url' => $this->settingsService->resolveMediaUrl($settings->logo_path, $settings->logo_url),
                'banner_url' => $this->settingsService->resolveMediaUrl($settings->banner_path, $settings->banner_url),
                'phone' => $settings->phone,
                'whatsapp' => $settings->whatsapp,
                'email' => $settings->email,
                'address' => $settings->address,
                'instagram' => $settings->instagram,
                'facebook' => $settings->facebook,
                'website' => $settings->website,
                'theme_color' => $settings->theme_color ?? '#ff3d03',
                'theme_mode' => $settings->menu_theme ?? 'modern-clean',
                'loyalty_enabled' => $settings->loyalty_enabled ?? true,
                'operating_hours_formatted' => $this->settingsService->formatOperatingHours($settings->business_hours),
                'is_open' => $settings->isOpenNow(),
                'is_delivery_paused' => $settings->is_delivery_paused ?? false,
                'paused_until' => $settings->paused_until,
                'estimated_delivery_time' => $settings->estimated_delivery_time ?? 30,
                'delivery_zones' => $deliveryZones,
                'payment_methods' => $paymentMethods,
                'menu_view_mode' => $tenant->menu_view_mode ?? 'grid',
                'settings' => $sanitizedSettings,
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
                'logo_url' => $settings->logo_path ? "/uploads/{$settings->logo_path}" : $settings->logo_url,
                'theme_color' => $settings->pwa_theme_color ?? '#ff3d03',
                'operating_hours_formatted' => $this->settingsService->formatOperatingHours($settings->business_hours),
                'is_open' => $settings->isOpenNow(),
            ]
        ]);
    }
}
