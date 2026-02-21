<?php

namespace App\Services;

use App\Models\StoreSetting;
use App\Models\DeliveryZone;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class SettingsService
{
    /**
     * Get settings for a tenant with caching
     */
    public function getForTenant($tenantId)
    {
        return Cache::remember("settings.{$tenantId}", 3600, function () use ($tenantId) {
            return StoreSetting::where('tenant_id', $tenantId)->firstOrCreate(
                ['tenant_id' => $tenantId],
                ['store_name' => 'Store']
            );
        });
    }

    /**
     * Format operating hours from JSON to readable string
     * Example: "Seg-Sex: 18:00 às 23:00, Sábado: 18:00 às 22:00"
     */
    public function formatOperatingHours($hoursJson)
    {
        if (!$hoursJson) {
            return 'Horário não configurado';
        }

        $hours = is_string($hoursJson) ? json_decode($hoursJson, true) : $hoursJson;

        if (!is_array($hours) || empty($hours)) {
            return 'Horário não configurado';
        }

        $dayNames = [
            'monday' => 'Segunda',
            'tuesday' => 'Terça',
            'wednesday' => 'Quarta',
            'thursday' => 'Quinta',
            'friday' => 'Sexta',
            'saturday' => 'Sábado',
            'sunday' => 'Domingo',
        ];

        $dayShorts = [
            'monday' => 'Seg',
            'tuesday' => 'Ter',
            'wednesday' => 'Qua',
            'thursday' => 'Qui',
            'friday' => 'Sex',
            'saturday' => 'Sab',
            'sunday' => 'Dom',
        ];

        $dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        $formatted = [];

        $i = 0;
        while ($i < count($dayOrder)) {
            $currentDay = $dayOrder[$i];

            if (!isset($hours[$currentDay])) {
                $i++;
                continue;
            }

            $dayData = $hours[$currentDay];
            $isOpen = $dayData['isOpen'] ?? $dayData['is_open'] ?? false;

            if (!$isOpen) {
                $i++;
                continue;
            }

            $startDay = $currentDay;
            $startTime = $dayData['open'] ?? null;
            $endTime = $dayData['close'] ?? null;

            if (!$startTime || !$endTime) {
                $i++;
                continue;
            }
            $consecutiveCount = 1;

            // Look ahead for consecutive days with same hours
            $j = $i + 1;
            while ($j < count($dayOrder)) {
                $nextDay = $dayOrder[$j];
                if (!isset($hours[$nextDay])) {
                    break;
                }

                $nextDayData = $hours[$nextDay];
                $nextIsOpen = $nextDayData['isOpen'] ?? $nextDayData['is_open'] ?? false;

                if (
                    $nextIsOpen &&
                    ($nextDayData['open'] ?? null) === $startTime &&
                    ($nextDayData['close'] ?? null) === $endTime
                ) {
                    $consecutiveCount++;
                    $j++;
                } else {
                    break;
                }
            }

            $endDay = $dayOrder[$i + $consecutiveCount - 1];

            if ($consecutiveCount === 1) {
                $formatted[] = "{$dayNames[$startDay]}: {$startTime} às {$endTime}";
            } else {
                $formatted[] = "{$dayShorts[$startDay]}-{$dayShorts[$endDay]}: {$startTime} às {$endTime}";
            }

            $i += $consecutiveCount;
        }

        return implode(', ', $formatted) ?: 'Fechado';
    }

    /**
     * Check if store is open now
     */
    public function isStoreOpen($tenantId, $datetime = null)
    {
        $settings = $this->getForTenant($tenantId);

        // 1. Check Manual Override
        if ($settings->status_override === 'open') {
            return true;
        }
        if ($settings->status_override === 'closed') {
            return false;
        }

        // 2. Check Pause Timer
        if ($settings->paused_until && now()->lessThan($settings->paused_until)) {
            return false;
        }

        // 3. Business Hours
        if (!$settings->business_hours) {
            return false;
        }

        $now = $datetime ?? now($settings->tenant->timezone ?? 'America/Sao_Paulo');
        if (!$now instanceof Carbon) {
            $now = Carbon::parse($now);
        }

        $hours = $settings->business_hours;

        $dayOfWeek = strtolower($now->format('l'));
        $dayMap = [
            'monday' => 'monday',
            'tuesday' => 'tuesday',
            'wednesday' => 'wednesday',
            'thursday' => 'thursday',
            'friday' => 'friday',
            'saturday' => 'saturday',
            'sunday' => 'sunday',
        ];

        $day = $dayMap[$dayOfWeek] ?? null;
        if (!$day || !isset($hours[$day])) {
            return false;
        }

        $dayData = $hours[$day];
        $isOpen = $dayData['isOpen'] ?? $dayData['is_open'] ?? false;

        if (!$isOpen) {
            return false;
        }

        $timezone = $settings->tenant->timezone ?? 'America/Sao_Paulo';
        $openTimeStr = $dayData['open'] ?? $dayData['open_time'] ?? null;
        $closeTimeStr = $dayData['close'] ?? $dayData['close_time'] ?? null;

        $openTime = @Carbon::createFromFormat('H:i', $openTimeStr ?? '', $timezone);
        $closeTime = @Carbon::createFromFormat('H:i', $closeTimeStr ?? '', $timezone);

        if (!$openTime || !$closeTime) {
            return false;
        }

        $openTime->setDate($now->year, $now->month, $now->day);
        $closeTime->setDate($now->year, $now->month, $now->day);

        if ($closeTime->lessThan($openTime)) {
            $closeTime->addDay();
        }

        return $now->between($openTime, $closeTime);
    }

    /**
     * Calculate delivery fee based on settings and zone
     */
    public function calculateDeliveryFee($zone, $distance, $settings)
    {
        if (!$settings) {
            return 0;
        }

        $mode = $settings->delivery_fee_mode ?? 'fixed';

        return match ($mode) {
            'fixed' => $settings->fixed_delivery_fee ?? 0,
            'per_km' => ($distance ?? 0) * ($settings->delivery_fee_per_km ?? 0),
            'by_zone' => $zone ? $zone->delivery_fee : ($settings->fixed_delivery_fee ?? 0),
            default => $settings->fixed_delivery_fee ?? 0,
        };
    }

    /**
     * Calculate delivery time
     */
    public function calculateDeliveryTime($distance, $settings)
    {
        if (!$settings) {
            return $settings->estimated_delivery_time ?? 30;
        }

        $baseTime = $settings->estimated_delivery_time ?? 30;

        return $baseTime;
    }

    /**
     * Validate minimum order amount
     */
    public function validateMinimumOrder($total, $mode, $settings)
    {
        if (!$settings) {
            return true;
        }

        $minimum = match ($mode) {
            'delivery' => $settings->min_order_delivery ?? 0,
            'pickup' => 0,
            'table' => 0,
            default => 0,
        };

        return $total >= $minimum;
    }

    /**
     * Format currency value
     */
    public function formatCurrency($value, $settings = null)
    {
        $symbol = $settings->currency_symbol ?? 'R$';
        return $symbol . ' ' . number_format($value, 2, ',', '.');
    }

    /**
     * Resolve media URL, falling back to production if local file missing
     */
    public function resolveMediaUrl($path, $fallbackUrl = null)
    {
        if (!$path) {
            return $fallbackUrl;
        }

        if (str_starts_with($path, 'http')) {
            return $path;
        }

        // 1. Sanitize the path: remove any combination of '/storage/' or 'storage/' from the beginning
        $cleanPath = preg_replace('/^(\/?storage\/)+/i', '', $path);
        $cleanPath = ltrim($cleanPath, '/');

        // 2. Check if file exists locally
        $localPath = public_path('storage/' . $cleanPath);

        if (file_exists($localPath) && !is_dir($localPath)) {
            return asset('storage/' . $cleanPath);
        }

        // 3. Fallback to production in local environment
        if (config('app.env') === 'local') {
            $baseUrl = config('app.asset_url') ?: 'https://oodelivery.online';
            return rtrim($baseUrl, '/') . '/storage/' . $cleanPath;
        }

        return asset('storage/' . $cleanPath);
    }

    /**
     * Clear cache for a tenant
     */
    public function clearCache($tenantId)
    {
        Cache::forget("settings.{$tenantId}");
    }
}
