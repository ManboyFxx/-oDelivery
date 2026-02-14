<?php

namespace App\Observers;

use App\Models\Product;
use Illuminate\Support\Facades\Cache;

class ProductObserver
{
    /**
     * Clear the tenant menu cache.
     */
    private function clearMenuCache(Product $product): void
    {
        Cache::forget("tenant_menu_{$product->tenant_id}");
    }

    public function saved(Product $product): void
    {
        $this->clearMenuCache($product);
    }

    public function deleted(Product $product): void
    {
        $this->clearMenuCache($product);
    }
}
