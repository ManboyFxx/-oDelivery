<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';

use App\Models\Order;
use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Support\Facades\DB;

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "--- Investigação de Fluxo de Estoque ---\n";

// 1. Check if any StockMovements exist
$movementCount = StockMovement::count();
echo "1. Total de registros em stock_movements: {$movementCount}\n";

// 2. Pick a product that tracks stock
$product = Product::where('track_stock', true)->first();

if (!$product) {
    echo "2. Nenhum produto com controle de estoque encontrado.\n";
    exit;
}

echo "   Produto alvo: '{$product->name}' (Estoque atual: {$product->stock_quantity})\n";

// 3. Simulate a PDV decrement
echo "3. Simulando venda PDV (usando decrementStock)...\n";
$initialStock = $product->stock_quantity;

// Mock user for StockMovement
$user = \App\Models\User::first();
if ($user) {
    auth()->login($user);
}

$product->decrementStock(2, 'Venda PDV Teste');
$product->refresh();
echo "   Estoque inicial: {$initialStock} -> Novo estoque: {$product->stock_quantity}\n";

// 4. Check if any movement was created
$newMovementCount = StockMovement::count();
if ($newMovementCount > $movementCount) {
    echo "4. ✅ Um movimento de estoque foi criado AUTOMATICAMENTE.\n";
    $movement = StockMovement::latest()->first();
    echo "   Tipo: {$movement->type}, Quantidade: {$movement->quantity}, Motivo: {$movement->reason}\n";
} else {
    echo "4. ⚠️ NENHUM movimento de estoque foi criado automaticamente.\n";
}

// 5. Verify manual adjustment via StockController logic
echo "5. Simulando ajuste manual via StockController (ajuste via Controller)...\n";
// This tests the logic I added to StockController indirectly by simulating the logic there
$oldQuantity = $product->stock_quantity;
$newQuantity = 200;
$product->update(['stock_quantity' => $newQuantity]);

if ($newQuantity != $oldQuantity) {
    $diff = $newQuantity - $oldQuantity;
    $type = $diff > 0 ? 'purchase' : 'adjustment';
    $product->recordStockMovement($diff, $type, 'Ajuste Manual Teste');
}
$product->refresh();
echo "   Novo estoque após ajuste manual: {$product->stock_quantity}\n";

$finalMovementCount = StockMovement::count();
echo "   Total final de movimentos: {$finalMovementCount}\n";

echo "--- Fim da Investigação ---\n";
