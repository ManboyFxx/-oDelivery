<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\TenantPollService;
use Illuminate\Http\Request;

class PublicPollController extends Controller
{
    /**
     * Check the last modification timestamp for a tenant.
     * This endpoint is public and lightweight to avoid DB connections.
     */
    public function check(Request $request, $tenantId, TenantPollService $pollService)
    {
        // Simple validation of UUID format to avoid directory traversal or garbage
        if (!preg_match('/^[a-f0-9-]{36}$/', $tenantId)) {
            return response()->json(['timestamp' => 0], 400);
        }

        $timestamp = $pollService->getLastModified($tenantId);

        return response()->json([
            'timestamp' => $timestamp
        ]);
    }
}
