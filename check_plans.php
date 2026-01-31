<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== PLANOS ATUAIS ===\n\n";

$plans = ['free', 'basic', 'pro'];

foreach ($plans as $planName) {
    $plan = \App\Models\PlanLimit::where('plan', $planName)->first();
    if ($plan) {
        echo strtoupper($planName) . ":\n";
        echo "  Produtos: " . ($plan->max_products ?? 'ilimitado') . "\n";
        echo "  Usuários: " . ($plan->max_users ?? 'ilimitado') . "\n";
        echo "  Pedidos/mês: " . ($plan->max_orders_per_month ?? 'ilimitado') . "\n";
        echo "  Categorias: " . ($plan->max_categories ?? 'ilimitado') . "\n";
        echo "  Cupons: " . ($plan->max_coupons ?? 'ilimitado') . "\n";
        echo "  Motoboys: " . ($plan->max_motoboys ?? 'ilimitado') . "\n";
        echo "  Storage: " . ($plan->max_storage_mb ?? 'ilimitado') . " MB\n";
        echo "  Unidades: " . ($plan->max_units ?? 'ilimitado') . "\n";
        echo "  Estoque: " . ($plan->max_stock_items ?? 'ilimitado') . "\n";
        echo "  Watermark: " . ($plan->show_watermark ? 'SIM' : 'NÃO') . "\n";
        echo "  Features: " . implode(', ', $plan->features ?? []) . "\n";
        echo "\n";
    }
}
