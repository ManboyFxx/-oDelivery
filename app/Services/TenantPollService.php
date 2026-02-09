<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;

class TenantPollService
{
    /**
     * Update the poll timestamp for a tenant.
     * This should be called whenever an order is created or updated.
     */
    public function touch(string $tenantId): void
    {
        try {
            // Use local disk or a shared disk if multiple servers
            // For single server, 'local' is fine.
            // We use a dedicated directory for these small files
            $path = "tenants/polls/{$tenantId}.timestamp";

            // Just write current timestamp
            Storage::disk('local')->put($path, (string) time());
        } catch (\Exception $e) {
            // Fail silently to not block the main transaction
            \Log::error("Failed to touch poll file for tenant {$tenantId}: " . $e->getMessage());
        }
    }

    /**
     * Get the last modified timestamp for a tenant.
     */
    public function getLastModified(string $tenantId): int
    {
        try {
            $path = "tenants/polls/{$tenantId}.timestamp";

            if (!Storage::disk('local')->exists($path)) {
                return 0; // Never modified
            }

            return (int) Storage::disk('local')->get($path);
        } catch (\Exception $e) {
            return 0;
        }
    }
}
