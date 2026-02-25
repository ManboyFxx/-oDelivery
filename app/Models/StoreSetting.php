<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StoreSetting extends Model
{
    use HasFactory, HasUuid;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'tenant_id',
        'store_name',
        'logo_url',
        'banner_url',
        'logo_path',
        'banner_path',
        'address',
        'phone',
        'whatsapp',
        'email',
        'business_hours',
        'theme_color',
        'description',
        'instagram',
        'facebook',
        'website',
        'operating_hours',
        'special_hours',
        'delivery_radius_km',
        'min_order_delivery',
        'free_delivery_min',
        'delivery_fee_per_km',
        'delivery_fee_mode',
        'fixed_delivery_fee',
        'estimated_delivery_time',
        'service_fee_percentage',
        'suggested_tip_percentage',
        'points_per_currency',
        'currency_per_point',
        'loyalty_enabled',
        'printer_paper_width',
        'auto_print_on_confirm',
        'print_copies',
        'print_footer_message',
        'mapbox_token',
        'store_latitude',
        'store_longitude',
        'mercadopago_access_token',
        'mercadopago_public_key',
        'evolution_api_url',
        'evolution_api_key',
        'evolution_instance_name',
        'menu_theme',
        'pwa_name',
        'pwa_short_name',
        'pwa_theme_color',
        'pwa_background_color',
        'notification_settings',
        'status_override',
        'is_delivery_paused',
        'paused_until',
        'default_motoboy_id',
        'enable_otp_verification',
        'loyalty_tiers',
        'loyalty_expiry_days',
        'referral_bonus_points',
        'referral_reward_points',
        'min_order_for_referral',
        'referral_enabled',
        'referral_referrer_points',
        'referral_referred_points',
        'referral_max_per_customer',
        'referral_code_expiry_days',
        'referral_min_order_value',
        'enable_otp_verification',
        'enable_password_login',
        'enable_quick_login',
        'enable_checkout_security',
        'phone_digits_required',
        'whatsapp_auto_messages_enabled',
    ];

    protected $casts = [
        'business_hours' => 'array',
        'operating_hours' => 'array',
        'special_hours' => 'array',
        'menu_theme' => 'array',
        'notification_settings' => 'array',
        'loyalty_tiers' => 'array', // JSON column
        'loyalty_expiry_days' => 'integer',
        'referral_bonus_points' => 'integer',
        'referral_reward_points' => 'integer',
        'min_order_for_referral' => 'float',
        'referral_enabled' => 'boolean',
        'referral_referrer_points' => 'integer',
        'referral_referred_points' => 'integer',
        'referral_max_per_customer' => 'integer',
        'referral_code_expiry_days' => 'integer',
        'referral_min_order_value' => 'float',
        'delivery_radius_km' => 'float',
        'min_order_delivery' => 'float',
        'free_delivery_min' => 'float',
        'delivery_fee_per_km' => 'float',
        'fixed_delivery_fee' => 'float',
        'service_fee_percentage' => 'float',
        'suggested_tip_percentage' => 'float',
        'points_per_currency' => 'float',
        'currency_per_point' => 'float',
        'loyalty_enabled' => 'boolean',
        'enable_otp_verification' => 'boolean',
        'enable_password_login' => 'boolean',
        'enable_quick_login' => 'boolean',
        'enable_checkout_security' => 'boolean',
        'phone_digits_required' => 'integer',
        'printer_paper_width' => 'integer',
        'auto_print_on_confirm' => 'boolean',
        'print_copies' => 'integer',
        'estimated_delivery_time' => 'integer',
        'store_latitude' => 'float',
        'store_longitude' => 'float',
        'is_delivery_paused' => 'boolean',
        'paused_until' => 'datetime',
        'default_motoboy_id' => 'string',
        'whatsapp_auto_messages_enabled' => 'boolean',
    ];

    public function getLogoUrlAttribute($value): ?string
    {
        if (!$value)
            return null;
        if (str_starts_with($value, 'http')) {
            return $value;
        }

        // Clean any existing storage/ or uploads/ prefix to prevent duplication
        $cleanPath = ltrim($value, '/');
        if (str_starts_with($cleanPath, 'storage/')) {
            $cleanPath = substr($cleanPath, 8);
        } elseif (str_starts_with($cleanPath, 'uploads/')) {
            $cleanPath = substr($cleanPath, 8);
        }

        return '/uploads/' . ltrim($cleanPath, '/');
    }

    public function getBannerUrlAttribute($value): ?string
    {
        if (!$value)
            return null;
        if (str_starts_with($value, 'http')) {
            return $value;
        }

        // Clean any existing storage/ or uploads/ prefix to prevent duplication
        $cleanPath = ltrim($value, '/');
        if (str_starts_with($cleanPath, 'storage/')) {
            $cleanPath = substr($cleanPath, 8);
        } elseif (str_starts_with($cleanPath, 'uploads/')) {
            $cleanPath = substr($cleanPath, 8);
        }

        return '/uploads/' . ltrim($cleanPath, '/');
    }

    /**
     * Get loyalty tiers with defaults if not set
     */
    public function getLoyaltyTiersAttribute($value)
    {
        if ($value) {
            return json_decode($value, true);
        }

        // Default tiers if none configured
        return [
            ['name' => 'Bronze', 'min_points' => 0, 'multiplier' => 1.0],
            ['name' => 'Prata', 'min_points' => 100, 'multiplier' => 1.05],
            ['name' => 'Ouro', 'min_points' => 500, 'multiplier' => 1.10],
            ['name' => 'Diamante', 'min_points' => 1000, 'multiplier' => 1.15],
        ];
    }

    protected $hidden = [
        'mercadopago_access_token',
        'evolution_api_key',
    ];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Check if store is open now
     */
    public function isOpenNow(?string $timezone = null)
    {
        // 1. Check Manual Override (highest priority)
        if ($this->status_override === 'open') {
            return true;
        }
        if ($this->status_override === 'closed') {
            return false;
        }

        // 2. Check Pause Timer
        if ($this->is_delivery_paused && $this->paused_until && now()->lessThan($this->paused_until)) {
            return false;
        }

        // 3. Business Hours Logic
        if (!$this->business_hours || !is_array($this->business_hours) || empty($this->business_hours)) {
            \Illuminate\Support\Facades\Log::info('Store Open Check: defaulting to false (no config)');
            return false;
        }

        try {
            $timezone = $timezone ?? $this->tenant->timezone ?? 'America/Sao_Paulo';
            $now = now($timezone);
            $hours = $this->business_hours;

            // Get current day name in lowercase
            $dayOfWeek = strtolower($now->format('l'));

            \Illuminate\Support\Facades\Log::info('Store Open Check: ', [
                'now' => $now->toDateTimeString(),
                'day' => $dayOfWeek,
                'override' => $this->status_override,
                'hours_raw' => $hours[$dayOfWeek] ?? 'missing'
            ]);

            // Map English day names (redundant but safe)
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

            // If day not found in config, default to CLOSED
            if (!$day || !isset($hours[$day])) {
                \Illuminate\Support\Facades\Log::info('Store Open Check: Day not configured, CLOSED');
                return false;
            }

            $dayData = $hours[$day];
            $isOpen = $dayData['isOpen'] ?? $dayData['is_open'] ?? false;

            if (!$isOpen) {
                \Illuminate\Support\Facades\Log::info('Store Open Check: Day marked closed');
                return false;
            }

            // Get opening and closing times
            $openTimeStr = $dayData['open'] ?? $dayData['open_time'] ?? null;
            $closeTimeStr = $dayData['close'] ?? $dayData['close_time'] ?? null;

            // If times not specified, assume open all day
            if (!$openTimeStr || !$closeTimeStr) {
                return true;
            }

            // Parse times
            $openTime = \Carbon\Carbon::createFromFormat('H:i', $openTimeStr, $timezone);
            $closeTime = \Carbon\Carbon::createFromFormat('H:i', $closeTimeStr, $timezone);

            if (!$openTime || !$closeTime) {
                return true; // Default to open if time parsing fails
            }

            // Set dates to match current day
            $openTime->setDate($now->year, $now->month, $now->day);
            $closeTime->setDate($now->year, $now->month, $now->day);

            // Handle overnight hours (e.g., 22:00 to 02:00 next day)
            if ($closeTime->lessThanOrEqualTo($openTime)) {
                $closeTime->addDay();
            }

            // Check if current time is between opening and closing time
            return $now->betweenIncluded($openTime, $closeTime);

        } catch (\Exception $e) {
            // If any error occurs, default to OPEN
            \Illuminate\Support\Facades\Log::warning('Error checking store open status', [
                'tenant_id' => $this->tenant_id,
                'error' => $e->getMessage(),
            ]);
            return true;
        }
    }

    /**
     * Get formatted operating hours
     */
    public function getFormattedOperatingHours()
    {
        $service = new \App\Services\SettingsService();
        return $service->formatOperatingHours($this->business_hours);
    }

    /**
     * Set business hours with proper validation and formatting
     */
    public function setBusinessHours($hours)
    {
        if (!$hours) {
            $this->business_hours = null;
            return;
        }

        // If already an array, ensure proper format
        if (is_array($hours)) {
            $formatted = $this->formatBusinessHours($hours);
            $this->business_hours = $formatted;
            return;
        }

        // If JSON string, decode and format
        if (is_string($hours)) {
            try {
                $decoded = json_decode($hours, true);
                if (is_array($decoded)) {
                    $formatted = $this->formatBusinessHours($decoded);
                    $this->business_hours = $formatted;
                    return;
                }
            } catch (\Exception $e) {
                // Invalid JSON, set to null
                $this->business_hours = null;
                return;
            }
        }

        $this->business_hours = null;
    }

    /**
     * Format business hours to standard structure
     */
    private function formatBusinessHours($hours)
    {
        $days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        $formatted = [];

        foreach ($days as $day) {
            $dayData = $hours[$day] ?? null;

            if (!$dayData) {
                $formatted[$day] = [
                    'is_open' => false,
                    'open_time' => '09:00',
                    'close_time' => '23:00',
                ];
                continue;
            }

            // Normalize keys (support both is_open/isOpen, open/open_time, etc)
            $isOpen = false;
            if (isset($dayData['isOpen'])) {
                $isOpen = filter_var($dayData['isOpen'], FILTER_VALIDATE_BOOLEAN);
            } elseif (isset($dayData['is_open'])) {
                $isOpen = filter_var($dayData['is_open'], FILTER_VALIDATE_BOOLEAN);
            } elseif (isset($dayData['closed'])) {
                $isOpen = !filter_var($dayData['closed'], FILTER_VALIDATE_BOOLEAN);
            }

            $openTime = $dayData['open'] ?? $dayData['open_time'] ?? '09:00';
            $closeTime = $dayData['close'] ?? $dayData['close_time'] ?? '23:00';

            // Validate time format HH:MM
            if (!$this->isValidTimeFormat($openTime)) {
                $openTime = '09:00';
            }
            if (!$this->isValidTimeFormat($closeTime)) {
                $closeTime = '23:00';
            }

            $formatted[$day] = [
                'is_open' => (bool) $isOpen,
                'open_time' => $openTime,
                'close_time' => $closeTime,
            ];
        }

        return $formatted;
    }

    /**
     * Validate time format HH:MM
     */
    private function isValidTimeFormat($time)
    {
        return preg_match('/^([01]\d|2[0-3]):([0-5]\d)$/', $time) === 1;
    }
}
