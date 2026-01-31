<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\LoyaltyPointsHistory;
use App\Models\StoreSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class LoyaltyController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        // Se for admin/loja, mostra o painel completo
        if ($user->isAdmin() || $user->isSuperAdmin()) {
            $settings = StoreSetting::where('tenant_id', $user->tenant_id)->first();

            $history = LoyaltyPointsHistory::with('customer')
                ->latest()
                ->take(50)
                ->get();

            $customers = Customer::select('id', 'name', 'phone', 'loyalty_points')
                ->orderBy('name')
                ->get();

            return Inertia::render('Loyalty/Index', [
                'settings' => $settings,
                'history' => $history,
                'customers' => $customers,
                'userRole' => $user->role, // Passando role para o front saber se mostra abas extras
            ]);
        }

        // Se for cliente (ou outro papel), mostra a visão de Meus Pontos
        // TODO: Ajustar se um Admin quiser ver os PRÓPRIOS pontos? Geralmente admin não tem pontos em si mesmo no tenant.
        // Vamos assumir que se não é admin, cai na visualização de cliente.

        $customer = Customer::where('user_id', $user->id)->first();

        // Se não tiver customer profile, cria ou redireciona?
        // Assumindo que pode ser nulo se for um funcionário sem cadastro de cliente
        if (!$customer) {
            // Retornar uma view vazia ou redirecionar
            return Inertia::render('Loyalty/CustomerIndex', [
                'settings' => StoreSetting::where('tenant_id', $user->tenant_id)->first(),
                'customer' => ['loyalty_points' => 0],
                'history' => ['data' => []],
                'isEmployee' => true // Flag para explicar pq ta vazio
            ]);
        }

        // Reusing the myPoints logic but inside index
        $settings = StoreSetting::where('tenant_id', $user->tenant_id)->first();

        $history = $customer->loyaltyHistory()
            ->latest()
            ->paginate(15);

        return Inertia::render('Loyalty/CustomerIndex', [
            'settings' => $settings,
            'customer' => $customer,
            'history' => $history,
        ]);
    }

    public function updateSettings(Request $request)
    {
        $request->validate([
            'loyalty_enabled' => 'required|boolean',
            'points_per_currency' => 'required|numeric|min:0',
            'currency_per_point' => 'required|numeric|min:0', // Value of each point in currency for redemption
        ]);

        $settings = StoreSetting::where('tenant_id', auth()->user()->tenant_id)->first();

        if ($settings) {
            $settings->update($request->only([
                'loyalty_enabled',
                'points_per_currency',
                'currency_per_point'
            ]));
        }

        return back()->with('success', 'Configurações de fidelidade atualizadas.');
    }

    public function adjustPoints(Request $request)
    {
        $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'points' => 'required|integer|min:1',
            'type' => 'required|in:add,remove',
            'description' => 'required|string|max:255',
        ]);

        $customer = Customer::findOrFail($request->customer_id);

        try {
            DB::transaction(function () use ($customer, $request) {
                if ($request->type === 'add') {
                    $customer->addPoints($request->points, null, $request->description);
                } else {
                    $success = $customer->redeemPoints($request->points, null, $request->description);
                    if (!$success) {
                        throw new \Exception('Saldo de pontos insuficiente para esta operação.');
                    }
                }
            });

            return back()->with('success', 'Saldo de pontos atualizado com sucesso.');
        } catch (\Exception $e) {
            return back()->withErrors(['points' => $e->getMessage()]);
        }
    }

}
