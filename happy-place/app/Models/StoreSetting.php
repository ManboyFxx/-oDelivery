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
    ];

    protected $casts = [
        'business_hours' => 'array',
        'operating_hours' => 'array',
        'special_hours' => 'array',
        'menu_theme' => 'array',
        'notification_settings' => 'array',
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
        'printer_paper_width' => 'integer',
        'auto_print_on_confirm' => 'boolean',
        'print_copies' => 'integer',
        'estimated_delivery_time' => 'integer',
        'store_latitude' => 'float',
        'store_longitude' => 'float',
    ];

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
    public function isOpenNow()
    {
        if (!$this->business_hours) {
            return false;
        }

        $timezone = $this->tenant->timezone ?? 'America/Sao_Paulo';
        $now = now($timezone);
        $hours = $this->business_hours;

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

        $openTime = \Carbon\Carbon::createFromFormat('H:i', $hours[$day]['open'], $timezone);
        $closeTime = \Carbon\Carbon::createFromFormat('H:i', $hours[$day]['close'], $timezone);

        return $now->between($openTime, $closeTime);
    }

    /**
     * Get formatted operating hours
     */
    public function getFormattedOperatingHours()
    {
        $service = new \App\Services\SettingsService();
        return $service->formatOperatingHours($this->business_hours);
    }
}
