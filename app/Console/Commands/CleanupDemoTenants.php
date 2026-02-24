<?php

namespace App\Console\Commands;

use App\Models\Tenant;
use App\Models\User;
use App\Models\Order;
use App\Models\Payment;
use App\Models\OrderItem;
use App\Models\Category;
use App\Models\Product;
use App\Models\StoreSetting;
use Illuminate\Console\Command;

class CleanupDemoTenants extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'demo:cleanup';
    protected $description = 'Remove temporary demo tenants and their data after 5 hours';

    public function handle()
    {
        $this->info('🚀 Iniciando limpeza de ambientes demo antigos...');

        // Query tenants with demo- prefix created more than 5h ago
        $tenants = Tenant::where('slug', 'like', 'demo-%')
            ->where('slug', '!=', 'demo-oo-delivery') // Keep the main demo if it exists
            ->where('created_at', '<', now()->subHours(5))
            ->withTrashed()
            ->get();

        if ($tenants->isEmpty()) {
            $this->info('✅ Nenhum ambiente antigo encontrado para limpeza.');
            return;
        }

        /** @var Tenant $tenant */
        foreach ($tenants as $tenant) {
            $this->warn("🗑️ Removendo ambiente: {$tenant->slug}...");

            // Associated data should be deleted via cascading or manual depending on DB structure
            // In OoDelivery, we'll force delete to clear DB

            // 1. Delete Users
            User::where('tenant_id', $tenant->id)->forceDelete();

            // 2. Delete Orders/Items/Payments
            $orders = Order::where('tenant_id', $tenant->id)->get();
            foreach ($orders as $order) {
                Payment::where('order_id', $order->id)->delete();
                OrderItem::where('order_id', $order->id)->delete();
                $order->delete();
            }

            // 3. Delete Products/Categories
            Product::where('tenant_id', $tenant->id)->delete();
            Category::where('tenant_id', $tenant->id)->delete();

            // 4. Delete Settings
            StoreSetting::where('tenant_id', $tenant->id)->delete();

            // 5. Force Delete Tenant
            $tenant->forceDelete();
        }

        $this->info('✨ Limpeza concluída!');
    }
}
