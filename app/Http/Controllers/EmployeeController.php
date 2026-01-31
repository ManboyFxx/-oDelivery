<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class EmployeeController extends Controller implements HasMiddleware
{
    /**
     * Get the middleware that should be assigned to the controller.
     */
    public static function middleware(): array
    {
        return [
            new Middleware('plan.limit:users', only: ['store']),
        ];
    }

    /**
     * Display a listing of employees for the current tenant.
     */
    public function index(Request $request)
    {
        $tenant = $request->user()->tenant;

        // Prevent super_admin from accessing this
        if (!$tenant) {
            return abort(403, 'Acesso não permitido.');
        }

        $employees = User::where('tenant_id', $tenant->id)
            ->where('role', '!=', 'super_admin')
            ->orderBy('name')
            ->get()
            ->map(function ($user) use ($request) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'role' => $user->role,
                    'is_active' => $user->is_active,
                    'is_available' => $user->is_available,
                    'avatar_url' => $user->avatar_url,
                    'is_current_user' => $user->id === $request->user()->id,
                ];
            });

        return Inertia::render('Employees/Index', [
            'employees' => $employees,
            'current_user_id' => $request->user()->id,
        ]);
    }

    /**
     * Store a newly created employee.
     */
    public function store(Request $request)
    {
        $tenant = $request->user()->tenant;

        if (!$tenant) {
            return abort(403, 'Acesso não permitido.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'email',
                Rule::unique('users')->where('tenant_id', $tenant->id),
            ],
            'phone' => 'required|string|max:20',
            'role' => 'required|in:admin,employee,motoboy',
            'password' => 'required|string|min:8|confirmed',
        ]);

        User::create([
            'tenant_id' => $tenant->id,
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'role' => $validated['role'],
            'password' => bcrypt($validated['password']),
            'is_active' => true,
        ]);

        return back()->with('success', 'Funcionário cadastrado com sucesso!');
    }

    /**
     * Update the specified employee.
     */
    public function update(Request $request, User $employee)
    {
        $tenant = $request->user()->tenant;

        if (!$tenant) {
            return abort(403, 'Acesso não permitido.');
        }

        // Ensure employee belongs to current tenant
        if ($employee->tenant_id !== $tenant->id) {
            return back()->withErrors(['error' => 'Funcionário não encontrado.']);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'email',
                Rule::unique('users')->ignore($employee->id)->where('tenant_id', $tenant->id),
            ],
            'phone' => 'required|string|max:20',
            'role' => 'required|in:admin,employee,motoboy',
            'is_active' => 'boolean',
        ]);

        $employee->update($validated);

        return back()->with('success', 'Funcionário atualizado com sucesso!');
    }

    /**
     * Delete the specified employee.
     */
    public function destroy(Request $request, User $employee)
    {
        $tenant = $request->user()->tenant;
        $currentUser = $request->user();

        if (!$tenant) {
            return abort(403, 'Acesso não permitido.');
        }

        // Ensure employee belongs to current tenant
        if ($employee->tenant_id !== $tenant->id) {
            return back()->withErrors(['error' => 'Funcionário não encontrado.']);
        }

        // Prevent user from deleting their own account
        if ($employee->id === $currentUser->id) {
            return back()->withErrors(['error' => 'Você não pode deletar sua própria conta.']);
        }

        $employee->delete();

        return back()->with('success', 'Funcionário removido com sucesso!');
    }
}
