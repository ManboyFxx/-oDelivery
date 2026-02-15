<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;

class AdminImpersonateController extends Controller
{
    /**
     * Entrar no modo de impersonation para um Tenant específico.
     */
    public function impersonate(string $tenantId)
    {
        $admin = Auth::user();

        // 1. Verificar se quem está logado é Super Admin
        if ($admin->role !== 'super_admin') {
            return back()->with('error', 'Apenas Super Admins podem realizar esta ação.');
        }

        $tenant = Tenant::findOrFail($tenantId);

        // 2. Encontrar o administrador principal do Tenant
        $tenantAdmin = User::where('tenant_id', $tenant->id)
            ->where('role', 'admin')
            ->first();

        if (!$tenantAdmin) {
            return back()->with('error', 'Esta loja não possui um administrador configurado.');
        }

        // 3. Salvar o ID do Super Admin original na sessão
        Session::put('impersonated_by', $admin->id);

        // 4. Autenticar como o lojista
        Auth::login($tenantAdmin);

        return redirect()->route('dashboard')->with('success', "Você está agora acessando como {$tenant->name}.");
    }

    /**
     * Sair do modo de impersonation e voltar ao Super Admin.
     */
    public function leave()
    {
        $originalAdminId = Session::get('impersonated_by');

        if (!$originalAdminId) {
            return redirect()->route('dashboard');
        }

        $originalAdmin = User::findOrFail($originalAdminId);

        // 1. Limpar flag de impersonation
        Session::forget('impersonated_by');

        // 2. Voltar ao Super Admin
        Auth::login($originalAdmin);

        return redirect()->route('admin.dashboard')->with('success', 'Você voltou ao painel Super Admin.');
    }
}
