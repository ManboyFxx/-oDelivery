<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleBasedAccessMiddleware
{
    /**
     * Handle an incoming request.
     *
     * Usage in routes:
     * ->middleware('role:admin')
     * ->middleware('role:admin,employee')
     * ->middleware('role:motoboy')
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $allowedRoles): Response
    {
        // Verify user is authenticated
        if (!auth()->check()) {
            return redirect()->route('login');
        }

        $user = auth()->user();
        $roles = explode(',', $allowedRoles);

        // Check if user has one of the allowed roles
        $hasRole = false;
        foreach ($roles as $role) {
            $role = trim($role);

            // Check by role column (e.g., $user->role === 'admin')
            if ($user->role === $role) {
                $hasRole = true;
                break;
            }

            // Also check by hasRole() method for permission system
            if ($user->hasRole($role)) {
                $hasRole = true;
                break;
            }
        }

        if (!$hasRole) {
            abort(403, 'Acesso restrito. Você não tem permissão para acessar este recurso.');
        }

        return $next($request);
    }
}
