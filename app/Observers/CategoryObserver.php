<?php

namespace App\Observers;

use App\Models\Category;
use Illuminate\Support\Facades\Cache;

class CategoryObserver
{
    /**
     * Clear the tenant menu cache.
     */
    private function clearMenuCache(Category $category): void
    {
        Cache::forget("tenant_menu_{$category->tenant_id}");
    }

    public function saved(Category $category): void
    {
        $this->clearMenuCache($category);
    }

    public function deleted(Category $category): void
    {
        $this->clearMenuCache($category);
    }
}
