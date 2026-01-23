<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\Tenant; // Assuming we have a Tenant model or similar
use Illuminate\Http\Request;
use Inertia\Inertia;

class TenantMenuController extends Controller
{
    public function show($slug)
    {
        // For demo: get first settings available
        $settings = \App\Models\StoreSetting::first();

        // Check for logged in customer
        $customer = null;
        if (session('customer_id')) {
            $customer = \App\Models\Customer::find(session('customer_id'));
        }

        $categories = Category::with([
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
            ->get();

        return Inertia::render('Tenant/Menu/Index', [
            'slug' => $slug,
            'categories' => $categories,
            'authCustomer' => $customer, // Pass logged in customer
            'store' => [
                'name' => $settings->store_name ?? 'ÓoDelivery Demo',
                'logo_url' => $settings->logo_url,
                'banner_url' => $settings->banner_url,
                'phone' => $settings->phone,
                'whatsapp' => $settings->whatsapp,
                'address' => $settings->address,
                'theme_color' => $settings->pwa_theme_color ?? '#ff3d03',
                'theme_mode' => $settings->menu_theme ?? 'modern-clean',
                'loyalty_enabled' => $settings->loyalty_enabled ?? true,
            ]
        ]);
    }
}
