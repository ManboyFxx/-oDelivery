<?php

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PlanLimit extends Model
{
    use HasFactory, HasUuid;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'plan',
        'display_name',
        'price_monthly',
        'price_yearly',
        'max_products',
        'max_users',
        'max_orders_per_month',
        'max_categories',
        'max_coupons',
        'max_motoboys',
        'max_stock_items',
        'max_storage_mb',
        'max_units',
        'features',
        'show_watermark',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'price_monthly' => 'float',
        'price_yearly' => 'float',
        'max_products' => 'integer',
        'max_users' => 'integer',
        'max_orders_per_month' => 'integer',
        'max_categories' => 'integer',
        'max_coupons' => 'integer',
        'max_motoboys' => 'integer',
        'max_stock_items' => 'integer',
        'max_storage_mb' => 'integer',
        'max_units' => 'integer',
        'features' => 'array',
        'show_watermark' => 'boolean',
        'is_active' => 'boolean',
    ];

    /**
     * Get active plans ordered by sort_order.
     */
    public static function getActivePlans()
    {
        return static::where('is_active', true)
            ->orderBy('sort_order')
            ->get();
    }

    /**
     * Get a plan by its slug.
     */
    public static function findByPlan(string $plan): ?self
    {
        return \Illuminate\Support\Facades\Cache::remember("plan_limit_{$plan}", 3600, function () use ($plan) {
            return static::where('plan', $plan)->first();
        });
    }

    /**
     * Check if this plan has a specific feature.
     */
    public function hasFeature(string $feature): bool
    {
        $features = $this->features ?? [];
        return isset($features[$feature]) && $features[$feature];
    }

    /**
     * Get the yearly discount percentage.
     */
    public function getYearlyDiscountAttribute(): float
    {
        if ($this->price_monthly <= 0) {
            return 0;
        }

        $monthlyTotal = $this->price_monthly * 12;
        $discount = (($monthlyTotal - $this->price_yearly) / $monthlyTotal) * 100;

        return round($discount, 0);
    }

    /**
     * Get the monthly price when billed yearly.
     */
    public function getYearlyMonthlyPriceAttribute(): float
    {
        return round($this->price_yearly / 12, 2);
    }

    /**
     * Check if a limit is unlimited (null).
     */
    public function isUnlimited(string $limit): bool
    {
        return is_null($this->{$limit});
    }

    /**
     * Format limit for display.
     */
    public function formatLimit(string $limit): string
    {
        $value = $this->{$limit};

        if (is_null($value)) {
            return 'Ilimitado';
        }

        return number_format($value, 0, ',', '.');
    }

    /**
     * Get the formatted list of features for display.
     */
    public function getFormattedFeaturesAttribute(): array
    {
        $featureNames = [
            'motoboy_management' => 'Gestão de motoboys',
            'whatsapp_integration' => 'Automação WhatsApp (ÓoBot)',
            'auto_print' => 'Impressão automática',
            'loyalty_basic' => 'Programa de fidelidade',
            'digital_menu' => 'Cardápio digital (PDV)',
            'api_access' => 'Integrações (API)',
            'custom_domain' => 'Domínio personalizado',
            'kanban_view' => 'Gestão de pedidos (Kanban)',
            'custom_integration' => 'Configuração de cardápio',
            'support_level' => 'Suporte',
        ];

        $list = [];

        // 1. LIMITS first
        // Products
        if ($this->max_products) {
            $list[] = ['text' => $this->max_products . ' produtos', 'included' => true];
        } elseif (is_null($this->max_products)) {
            $list[] = ['text' => 'Produtos ilimitados', 'included' => true];
        }

        // Orders
        if ($this->max_orders_per_month) {
            $list[] = ['text' => 'Até ' . $this->max_orders_per_month . ' pedidos/mês', 'included' => true];
        } else {
            $list[] = ['text' => 'Pedidos ilimitados', 'included' => true];
        }

        // Stock Items
        if ($this->max_stock_items) {
            $list[] = ['text' => 'Controle de estoque ' . $this->max_stock_items . ' itens', 'included' => true];
        } elseif (is_null($this->max_stock_items)) {
            $list[] = ['text' => 'Controle de estoque ilimitado', 'included' => true];
        }

        // Users
        if ($this->max_users) {
            $text = $this->max_users . ' Usuários';
            if ($this->plan === 'free')
                $text = "Gestão de Equipe\n(1 Admin + 2 Func)";
            if ($this->plan === 'pro')
                $text = "Gestão de Equipe\n(3 Admin + 5 Func)";

            $list[] = ['text' => $text, 'included' => true];
        } elseif (is_null($this->max_users)) {
            $list[] = ['text' => 'Gestão de equipe ilimitada', 'included' => true];
        }

        // Motoboys
        if ($this->max_motoboys > 0) {
            $list[] = ['text' => 'Gestão de motoboys (' . $this->max_motoboys . ')', 'included' => true];
        } elseif (is_null($this->max_motoboys)) {
            $list[] = ['text' => 'Motoboys ilimitados', 'included' => true];
        } else {
            $list[] = ['text' => 'Gestão de motoboys (X)', 'included' => false];
        }

        // Coupons
        if ($this->max_coupons) {
            $list[] = ['text' => $this->max_coupons . ' cupons ativos', 'included' => true];
        } elseif (is_null($this->max_coupons)) {
            $list[] = ['text' => 'Cupons ilimitados', 'included' => true];
        }

        // 2. BOOLEAN FEATURES
        foreach ($featureNames as $key => $label) {
            // Support level handling
            if ($key === 'support_level') {
                $level = $this->features['support_level'] ?? 'community';
                $text = match ($level) {
                    'community' => 'Suporte + Documentação + FAQ',
                    'priority' => 'Suporte prioritário + Comunidade',
                    'business_hours' => 'Suporte horário comercial',
                    'vip' => 'Suporte prioritário + Grupo Privado',
                    default => 'Suporte básico'
                };
                $list[] = ['text' => $text, 'included' => true];
                continue;
            }

            $included = isset($this->features[$key]) && $this->features[$key] === true;

            if ($key === 'motoboy_management')
                continue;

            if ($included) {
                $list[] = ['text' => $label, 'included' => true];
            } elseif ($key === 'whatsapp_integration') {
                // Explicitly show X for whatsapp if not included
                $list[] = ['text' => $label, 'included' => false];
            }
        }

        return $list;
    }
}
