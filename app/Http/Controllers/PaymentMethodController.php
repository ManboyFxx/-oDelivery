<?php

namespace App\Http\Controllers;

use App\Models\PaymentMethod;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentMethodController extends Controller
{
    public function index()
    {
        $tenant = auth()->user()->tenant;
        $methods = PaymentMethod::where('tenant_id', $tenant->id)
            ->orderBy('display_order')
            ->get();

        return Inertia::render('Settings/PaymentMethods', [
            'methods' => $methods
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:cash,credit_card,debit_card,pix',
            'fee_percentage' => 'nullable|numeric|min:0|max:100',
            'fee_fixed' => 'nullable|numeric|min:0',
            'is_active' => 'boolean',
        ]);

        $tenant = auth()->user()->tenant;

        PaymentMethod::create([
            ...$validated,
            'tenant_id' => $tenant->id,
            'is_active' => $request->input('is_active', true),
            'fee_percentage' => $request->input('fee_percentage', 0),
            'fee_fixed' => $request->input('fee_fixed', 0),
        ]);

        return back()->with('success', 'Forma de pagamento adicionada com sucesso!');
    }

    public function update(Request $request, $id)
    {
        $method = PaymentMethod::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:cash,credit_card,debit_card,pix',
            'fee_percentage' => 'nullable|numeric|min:0|max:100',
            'fee_fixed' => 'nullable|numeric|min:0',
            'is_active' => 'boolean',
        ]);

        $method->update([
            ...$validated,
            'fee_percentage' => $request->input('fee_percentage', 0),
            'fee_fixed' => $request->input('fee_fixed', 0),
        ]);

        return back()->with('success', 'Forma de pagamento atualizada com sucesso!');
    }

    public function destroy($id)
    {
        $method = PaymentMethod::findOrFail($id);
        $method->delete();

        return back()->with('success', 'Forma de pagamento removida com sucesso!');
    }
}
