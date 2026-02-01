<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $user = $request->user();
        $isMotoboy = $request->boolean('is_motoboy', false);

        // Validar se o usuário marcou "sou entregador" mas não é motoboy
        if ($isMotoboy && !$user->isMotoboy()) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();

            return back()->withErrors([
                'email' => 'Acesso negado. Você não está registrado como entregador.',
            ]);
        }

        $request->session()->regenerate();

        // Se é motoboy e marcou o checkbox, redireciona para painel do motoboy
        if ($user->isMotoboy() && $isMotoboy) {
            return redirect()->route('motoboy.dashboard');
        }

        // If user is super_admin, redirect to admin panel
        if ($user->isSuperAdmin()) {
            return redirect()->route('admin.dashboard');
        }

        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
