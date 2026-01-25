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

            if (!isset($hours[$currentDay]) || !$hours[$currentDay]['isOpen']) {
                $i++;
                continue;
            }

            $startDay = $currentDay;
            $startTime = $hours[$currentDay]['open'];
            $endTime = $hours[$currentDay]['close'];
            $consecutiveCount = 1;

            // Look ahead for consecutive days with same hours
            $j = $i + 1;
            while ($j < count($dayOrder)) {
                $nextDay = $dayOrder[$j];
                if (
                    isset($hours[$nextDay]) &&
                    $hours[$nextDay]['isOpen'] &&
                    $hours[$nextDay]['open'] === $startTime &&
                    $hours[$nextDay]['close'] === $endTime
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

        if (!$settings->business_hours) {
            return false;
        }

        $now = $datetime ?? now('America/Sao_Paulo');
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
        if (!$day || !isset($hours[$day]) || !$hours[$day]['isOpen']) {
            return false;
        }

        $openTime = Carbon::createFromFormat('H:i', $hours[$day]['open'], 'America/Sao_Paulo');
        $closeTime = Carbon::createFromFormat('H:i', $hours[$day]['close'], 'America/Sao_Paulo');

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
     * Clear cache for a tenant
     */
    public function clearCache($tenantId)
    {
        Cache::forget("settings.{$tenantId}");
    }
}
