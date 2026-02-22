<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Tenant;
use App\Models\StoreSetting;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Slugs reservados que não podem ser usados
     */
    private const RESERVED_SLUGS = [
        'admin',
        'api',
        'app',
        'www',
        'blog',
        'help',
        'support',
        'pricing',
        'terms',
        'privacy',
        'login',
        'register',
        'dashboard',
        'settings',
        'menu',
        'pedidos',
        'orders',
        'checkout',
        'cart',
        'null',
        'undefined',
        'planos',
        'plans',
        'customer',
        'customers',
        'profile',
        'account',
        'kitchen',
        'pdv',
        'products',
        'categories',
        'coupons',
        'tables',
        'motoboys',
        'financial',
        'financeiro',
        'fidelidade',
        'loyalty',
        'cardapio',
        'estoque',
        'stock',
        'ingredients',
        'complements',
    ];

    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Check if a slug is available.
     */
    public function checkSlug(Request $request)
    {
        $slug = Str::slug($request->input('slug', ''));

        if (strlen($slug) < 3) {
            return response()->json([
                'available' => false,
                'message' => 'O link deve ter no mínimo 3 caracteres.',
                'suggested' => null,
            ]);
        }

        if (in_array($slug, self::RESERVED_SLUGS)) {
            return response()->json([
                'available' => false,
                'message' => 'Este link é reservado do sistema.',
                'suggested' => $this->suggestSlug($slug),
            ]);
        }

        $exists = Tenant::where('slug', $slug)->exists();

        if ($exists) {
            return response()->json([
                'available' => false,
                'message' => 'Este link já está em uso.',
                'suggested' => $this->suggestSlug($slug),
            ]);
        }

        return response()->json([
            'available' => true,
            'message' => 'Link disponível!',
            'suggested' => null,
        ]);
    }

    /**
     * Suggest an available slug based on the original.
     */
    private function suggestSlug(string $baseSlug): string
    {
        $counter = 1;
        $suggested = $baseSlug . '-' . $counter;

        while (Tenant::where('slug', $suggested)->exists() || in_array($suggested, self::RESERVED_SLUGS)) {
            $counter++;
            $suggested = $baseSlug . '-' . $counter;

            if ($counter > 100) {
                $suggested = $baseSlug . '-' . Str::random(4);
                break;
            }
        }

        return $suggested;
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'store_name' => 'required|string|max:255',
            'slug' => [
                'required',
                'string',
                'min:3',
                'max:50',
                'regex:/^[a-z0-9]+(-[a-z0-9]+)*$/',
                'unique:tenants,slug',
                function ($attribute, $value, $fail) {
                    if (in_array($value, self::RESERVED_SLUGS)) {
                        $fail('Este link é reservado do sistema.');
                    }
                },
            ],
            'name' => 'required|string|max:255',
            'whatsapp' => 'required|string|max:20',
            'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'plan' => 'nullable|string', // Aceitar qualquer string ou validar apenas unified se necessário
        ], [
            'slug.regex' => 'O link deve conter apenas letras minúsculas, números e hífens.',
            'slug.unique' => 'Este link já está em uso.',
            'store_name.required' => 'O nome do estabelecimento é obrigatório.',
            'whatsapp.required' => 'O WhatsApp é obrigatório.',
        ]);

        // Forçar plano unificado
        $selectedPlan = 'unified';

        $planConfig = [
            'plan' => 'unified',
            'subscription_status' => 'pending', // Aguardando pagamento
            'trial_ends_at' => null,
        ];

        try {
            // Usar transação para garantir consistência
            $user = DB::transaction(function () use ($request, $planConfig) {
                // 1. Criar o Tenant com configuração baseada no plano selecionado
                $tenant = Tenant::create(array_merge([
                    'name' => $request->store_name,
                    'slug' => $request->slug,
                    'email' => $request->email,
                    'phone' => $request->whatsapp,
                    'whatsapp' => $request->whatsapp,
                    'is_active' => true,
                    'is_open' => false,
                    'printer_token' => hash('sha256', Str::random(60)),
                ], $planConfig));
                // 2. Criar o User associado ao Tenant
                $user = User::create([
                    'tenant_id' => $tenant->id,
                    'name' => $request->name,
                    'email' => $request->email,
                    'phone' => $request->whatsapp,
                    'password' => Hash::make($request->password),
                    'role' => 'admin',
                    'is_active' => true,
                ]);

                // 3. Criar as configurações iniciais da loja
                StoreSetting::create([
                    'tenant_id' => $tenant->id,
                    'store_name' => $request->store_name,
                    'phone' => $request->whatsapp,
                    'whatsapp' => $request->whatsapp,
                    'theme_color' => '#ff3d03',
                    'loyalty_enabled' => false,
                    'auto_print_on_confirm' => false,
                    'print_copies' => 1,
                    'printer_paper_width' => 80,
                ]);

                return $user;
            });

            event(new Registered($user));

            Auth::login($user);

            // Redirecionar para o dashboard (onde verá o modal de pagamento)
            return redirect()->route('dashboard');

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Registration Error: ' . $e->getMessage(), [
                'request' => $request->except(['password', 'password_confirmation']),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->withInput()->withErrors([
                'error' => 'Ocorreu um erro ao processar seu cadastro. Por favor, tente novamente em instantes.'
            ]);
        }
    }
}
