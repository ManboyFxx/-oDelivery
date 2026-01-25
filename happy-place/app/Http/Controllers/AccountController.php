<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class AccountController extends Controller
{
    /**
     * Show the suspended account page.
     */
    public function suspended(Request $request)
    {
        $tenant = $request->user()->tenant;

        // If not suspended, redirect to dashboard
        if ($tenant && !$tenant->is_suspended) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('Account/Suspended', [
            'tenant' => [
                'name' => $tenant->name,
                'suspension_reason' => $tenant->suspension_reason,
                'suspended_at' => $tenant->suspended_at?->toISOString(),
            ],
        ]);
    }
}
