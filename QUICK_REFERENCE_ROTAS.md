# ⚡ Quick Reference - Localização de Mudanças por Feature

Guia rápido para encontrar e modificar controle de acesso e rotas.

---

## 🔍 Encontrar Rotas por Tipo

### "Preciso adicionar nova rota OPERACIONAL (admin + employee)"

**Arquivo:** `routes/web.php` | **Linhas:** 155-200
```php
// ============================================================================
// ROTAS OPERACIONAIS - Admin + Employee (Dia a dia)
// ============================================================================
Route::middleware(['auth', 'subscription', 'role:admin,employee'])->group(function () {
    // Adicione aqui
    Route::get('/minha-nova-rota', [MeuController::class, 'index']);
});
```

---

### "Preciso adicionar nova rota ADMINISTRATIVA (admin only)"

**Arquivo:** `routes/web.php` | **Linhas:** 203-270
```php
// ============================================================================
// ROTAS ADMINISTRATIVAS - Apenas Admin
// ============================================================================
Route::middleware(['auth', 'subscription', 'role:admin'])->group(function () {
    // Adicione aqui
    Route::get('/minha-nova-rota', [MeuController::class, 'index']);
});
```

---

### "Preciso proteger rota MOTOBOY com feature check"

**Arquivo:** `routes/web.php` | **Linhas:** 275
```php
Route::middleware(['auth', 'is_motoboy', 'check_subscription', 'feature:motoboy_management'])->prefix('/motoboy')->name('motoboy.')->group(function () {
    // Já vem com feature check
    Route::get('/minha-nova-rota', [...]);
});
```

---

## 📋 Encontrar Menu Items por Tipo

### "Preciso OCULTAR menu item para employees"

**Arquivo:** `resources/js/Components/Sidebar.tsx` | **Linhas:** 76-128

**Estrutura:**
```tsx
// Adicione item em adminOnlyGroups, NÃO em operationalGroups
const adminOnlyGroups: Group[] = [
    {
        title: 'Categoria Existe',
        items: [
            {
                name: 'Novo Item',  // ← Seu novo item
                href: route('nova.rota'),
                route: 'nova.rota',
                icon: IconIcon,
                current: isCurrent('/nova')
            }
        ]
    }
];
```

**Verificação:**
- Se está em `adminOnlyGroups` → Employee não vê ❌
- Se está em `operationalGroups` → Employee vê ✅

---

### "Preciso MOSTRAR menu item para todos (admin + employee)"

**Arquivo:** `resources/js/Components/Sidebar.tsx` | **Linhas:** 77-90

**Estrutura:**
```tsx
const operationalGroups: Group[] = [
    {
        title: 'Vendas',
        items: [
            {
                name: 'Novo Item',  // ← Seu novo item
                href: route('nova.rota'),
                // ...
            }
        ]
    }
];
```

---

## 🛡️ Encontrar Validações de Tenant

### "Preciso adicionar validação de tenant em novo Controller"

**Arquivo:** `app/Http/Controllers/OrderController.php` | **Linhas:** 11-17

**Padrão:**
```php
// 1. Copiar método de validação
private function authorizeOrder(Order $order): void
{
    if ($order->tenant_id !== auth()->user()->tenant_id) {
        abort(403, 'Acesso negado. Recurso não pertence ao seu estabelecimento.');
    }
}

// 2. Chamar em cada método que recebe o modelo
public function updateStatus(Request $request, Order $order)
{
    $this->authorizeOrder($order);  // ← Adicione isto
    // ... resto do código
}
```

---

### "Preciso filtrar query by tenant_id"

**Padrão:**
```php
// ❌ ANTES
$orders = Order::where('user_id', $userId)->get();

// ✅ DEPOIS
$orders = Order::where('user_id', $userId)
    ->where('tenant_id', auth()->user()->tenant_id)  // ← Adicione
    ->get();
```

---

## 🔐 Encontrar Middleware de Role

### "Preciso verificar se middleware de role existe"

**Arquivo:** `app/Http/Middleware/RoleBasedAccessMiddleware.php`

**Verificação:**
```php
// Middleware existe? ✅
Route::middleware('role:admin')->get('/financeiro', [...]); // Funciona

// Está registrado? ✅
// bootstrap/app.php linha: 'role' => \App\Http\Middleware\RoleBasedAccessMiddleware::class,
```

---

### "Preciso criar novo middleware de autorização"

**Padrão:**
```php
// app/Http/Middleware/MeuMiddleware.php
public function handle(Request $request, Closure $next): Response
{
    if (!auth()->check()) {
        return redirect()->route('login');
    }

    // Sua validação aqui
    if (!minhaCondicao()) {
        abort(403, 'Mensagem de erro');
    }

    return $next($request);
}
```

**Registrar:**
```php
// bootstrap/app.php
$middleware->alias([
    'meu-middleware' => \App\Http\Middleware\MeuMiddleware::class,
]);
```

---

## 📊 Matriz: O que Muda Onde

| Necessidade | Arquivo | Linhas | Ação |
|-------------|---------|--------|------|
| Nova rota operacional | routes/web.php | 155-200 | Adicionar route |
| Nova rota admin | routes/web.php | 203-270 | Adicionar route |
| Ocultar menu employee | Sidebar.tsx | 110-128 | Adicionar em adminOnlyGroups |
| Mostrar menu todos | Sidebar.tsx | 77-90 | Adicionar em operationalGroups |
| Validar tenant | Seu Controller | - | Usar método `authorize*()` |
| Novo middleware | app/Http/Middleware/ | - | Criar arquivo + registrar |
| Feature gating | routes/web.php | 275+ | Adicionar `->middleware('feature:...')` |

---

## 🚀 Checklist: Adicionar Nova Feature

```
[ ] 1. Criar rota em routes/web.php
[ ] 2. Criar/atualizar Controller
[ ] 3. Se acesso restrito: adicionar authorize() ou middleware
[ ] 4. Se é operacional: adicionar ao operationalGroups no Sidebar
[ ] 5. Se é admin only: adicionar ao adminOnlyGroups no Sidebar
[ ] 6. Testar acesso de employee → deve retornar 403
[ ] 7. Testar acesso de admin → deve funcionar
[ ] 8. Atualizar documentação em ROTAS_ACESSO.md
```

---

## 🧪 Testes Rápidos (CLI)

### Testar Acesso de Role

```bash
# Como Admin
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
     http://localhost/settings \
     -w "\nStatus: %{http_code}\n"
# Esperado: 200

# Como Employee
curl -H "Authorization: Bearer $EMPLOYEE_TOKEN" \
     http://localhost/settings \
     -w "\nStatus: %{http_code}\n"
# Esperado: 403
```

### Testar Isolamento de Tenant

```bash
# Admin A pega ordem de B
ORDER_ID=$(curl -H "Authorization: Bearer $ADMIN_B_TOKEN" \
    http://localhost/api/orders | jq .data[0].id)

curl -H "Authorization: Bearer $ADMIN_A_TOKEN" \
     http://localhost/orders/$ORDER_ID/status \
     -d '{"status":"ready"}' \
     -w "\nStatus: %{http_code}\n"
# Esperado: 403
```

---

## 📞 Suporte Rápido

### "Frontend envia requisição, backend retorna 403"

**Possíveis causas:**
1. ❌ Role do usuário não permite (verificar `auth()->user()->role`)
2. ❌ Tenant_id não confere (verificar `where('tenant_id', ...)`)
3. ❌ Feature não ativada (verificar `middleware('feature:...')`)
4. ❌ Subscription expirada (verificar `middleware('subscription')`)

**Debugar:**
```php
// No seu Controller
dd([
    'user_role' => auth()->user()->role,
    'tenant_id' => auth()->user()->tenant_id,
    'resource_tenant' => $resource->tenant_id ?? 'N/A',
]);
```

### "Menu não atualiza quando role muda"

Provável causa: Page props não atualizou
```tsx
// Forçar refresh
location.reload();
// ou
router.visit(route('dashboard'));
```

### "Employee vê botão de delete mas retorna 403 ao clicar"

**Isso é bom!** ✅
- Frontend: cosmético (mostrar/ocultar)
- Backend: segurança (validar e bloquear)
- Se ambos estiverem corretos: employee não deveria ver o botão

Se vê o botão, atualizar Sidebar.tsx

---

## 🎯 Resumo em Uma Linha

> **Toda rota protegida** = Middleware de role + Validação de tenant_id + Menu dinâmico no frontend

