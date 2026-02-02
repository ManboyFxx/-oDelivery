# ✅ Checklist de Testes - Autorização e Acesso

Guia completo para testar a implementação de separação de roles e permissões.

---

## 🧪 Testes Funcionais

### Cenário 1: Admin Logado
**Usuário:** role = `admin`

#### Visibilidade de Menu
- [ ] ✅ Vê "Dashboard"
- [ ] ✅ Vê "Pedidos"
- [ ] ✅ Vê "Cozinha"
- [ ] ✅ Vê "PDV"
- [ ] ✅ Vê "Produtos" (admin only)
- [ ] ✅ Vê "Financeiro" (admin only)
- [ ] ✅ Vê "Configurações" (admin only)
- [ ] ✅ Vê "Equipe" (admin only)
- [ ] ✅ Vê "WhatsApp" (admin only)
- [ ] ✅ Vê "Cupons" (admin only)
- [ ] ✅ Vê "Estoque"

#### Acesso a Rotas
```bash
# Deve funcionar (200)
GET /dashboard          → ✅ 200
GET /orders             → ✅ 200
GET /products           → ✅ 200
GET /financeiro         → ✅ 200
GET /settings           → ✅ 200
GET /employees          → ✅ 200

# Motoboy - depende de feature
GET /motoboys           → ✅ 200 (se feature enabled) ou 403
```

#### Operações de Escrita
- [ ] Criar pedido (POST /orders)          → ✅ 200
- [ ] Atualizar status (POST /orders/{id}/status) → ✅ 200
- [ ] Editar produto (PUT /products/{id})  → ✅ 200
- [ ] Alterar settings (POST /settings)    → ✅ 200
- [ ] Criar employee (POST /employees)     → ✅ 200

---

### Cenário 2: Employee (Funcionário) Logado
**Usuário:** role = `employee`

#### Visibilidade de Menu
- [ ] ✅ Vê "Dashboard"
- [ ] ✅ Vê "Pedidos"
- [ ] ✅ Vê "Cozinha"
- [ ] ✅ Vê "PDV"
- [ ] ✅ Vê "Estoque"
- [ ] ✅ Vê "Cardápio (visualizar)" (menu.index apenas)
- [ ] ❌ NÃO vê "Produtos" (não aparece no menu)
- [ ] ❌ NÃO vê "Financeiro"
- [ ] ❌ NÃO vê "Configurações"
- [ ] ❌ NÃO vê "Equipe"
- [ ] ❌ NÃO vê "WhatsApp"
- [ ] ❌ NÃO vê "Cupons"

#### Tentativa de Acesso Direto (URL)
```bash
# Deve bloquear com 403
GET /products           → 🚫 403 Forbidden
GET /financeiro         → 🚫 403 Forbidden
GET /settings           → 🚫 403 Forbidden
GET /employees          → 🚫 403 Forbidden
GET /motoboys           → 🚫 403 Forbidden
GET /whatsapp           → 🚫 403 Forbidden
```

#### Operações Bloqueadas
- [ ] Edit produto (PUT /products/{id})    → 🚫 403
- [ ] Delete employee (DELETE /employees/{id}) → 🚫 403
- [ ] Alterar settings (POST /settings)    → 🚫 403
- [ ] Criar cupom (POST /coupons)          → 🚫 403

#### Operações Permitidas
- [ ] Criar pedido (POST /orders)          → ✅ 200
- [ ] Atualizar status (POST /orders/{id}/status) → ✅ 200
- [ ] Ver cozinha (GET /kitchen)           → ✅ 200
- [ ] Dar entrada estoque (POST /stock)    → ✅ 200

---

### Cenário 3: Motoboy Logado
**Usuário:** role = `motoboy` + feature `motoboy_management` ativada

#### Rotas Acessíveis
```bash
GET /motoboy/dashboard          → ✅ 200
GET /motoboy/pedidos            → ✅ 200
GET /motoboy/perfil             → ✅ 200
GET /motoboy/metricas           → ✅ 200
POST /api/motoboy/location      → ✅ 200
GET /api/motoboy/notifications  → ✅ 200
```

#### Rotas Bloqueadas (403)
```bash
GET /dashboard          → 🚫 403 (não é admin)
GET /orders             → 🚫 403 (acesso admin/employee)
GET /settings           → 🚫 403 (acesso admin)
GET /motoboys           → 🚫 403 (acesso admin)
```

#### Feature Bloqueada (Plano Start)
Se tenant está no Plano Start (feature `motoboy_management` desativada):
```bash
GET /motoboy/dashboard  → 🚫 403 "Feature bloqueada para seu plano"
GET /motoboys           → 🚫 403 (não autorizado)
POST /orders/assign-motoboy → 🚫 403 (feature desativada)
```

---

## 🔒 Testes de Segurança - Multi-Tenant

### Cenário 4: Isolamento de Tenant
**Setup:** 2 tenants, 1 usuario em cada

#### Validação de Tenant_ID
```php
// Admin de Tenant A tenta acessar pedido de Tenant B
GET /orders/123  (onde order.tenant_id ≠ auth.user.tenant_id)
→ 🚫 403 "Acesso negado. Pedido não pertence ao seu estabelecimento."
```

#### Test Script (Bash)
```bash
# Login Tenant A
TOKEN_A=$(curl -X POST /login -d "email=admin@a.com" | jq .token)

# Login Tenant B
TOKEN_B=$(curl -X POST /login -d "email=admin@b.com" | jq .token)

# Admin A tenta acessar pedido de B
curl -H "Authorization: Bearer $TOKEN_B" /orders \
  | grep "tenant_id" | head -1 | awk '{print $NF}' > order_id_b

curl -H "Authorization: Bearer $TOKEN_A" /orders/$order_id_b
# Esperado: 403 Forbidden
```

---

## 🧬 Testes de Unidade (Code Review)

### Backend

- [ ] **OrderController::authorizeOrder()**
  - Verifica `$order->tenant_id === auth()->user()->tenant_id`
  - Chamado em todos os métodos que recebem Order

- [ ] **MotoboySummaryService**
  - Filtra por `tenant_id` em getSummary()
  - Filtra por `tenant_id` em getPeriodSummary()
  - Recebe `$tenantId` como parâmetro

- [ ] **RoleBasedAccessMiddleware**
  - Verifica `$user->role === $role` ou `$user->hasRole($role)`
  - Retorna 403 para roles não permitidos
  - Registrado em bootstrap/app.php como alias 'role'

### Frontend

- [ ] **Sidebar.tsx**
  - operationalGroups = itens para employee + admin
  - adminOnlyGroups = itens apenas para admin
  - Usa `user.role === 'admin'` para decidir

- [ ] **Componentes com Actions**
  - Delete buttons ocultos para employee
  - Edit buttons desabilitados para employee
  - Admin-only sections renderizadas condicionalmente

---

## 🧪 Testes de Integração

### API Orders Endpoint
```bash
# Request sem filtro tenant
POST /orders
Payload: { items: [...] }

# Backend adiciona automaticamente:
{
  items: [...],
  tenant_id: auth()->user()->tenant_id,  ← Adicionado automaticamente
  created_by: auth()->user()->id
}
```

### Checklist de Validação
- [ ] Pedido criado com tenant_id correto
- [ ] Pedido não aparece para outro admin
- [ ] Employee vê apenas pedidos do seu tenant

---

## 📱 Testes de UX/UI

### Menu Responsivo
- [ ] Employee vê menu reduzido (sem admin items)
- [ ] Admin vê menu completo
- [ ] Links desaparecem ao alterar role (se sistema permitir)

### Mensagens de Erro
- [ ] "Acesso restrito..." ao tentar GET /settings como employee
- [ ] "Feature bloqueada para seu plano" ao tentar /motoboy como Plano Start
- [ ] Redireciona para /dashboard em 403 automático

### Loading & Performance
- [ ] Sidebar carrega rápido (sem queries desnecessárias)
- [ ] Nenhuma chamada a /employees, /settings, /financeiro se employee
- [ ] Sem erros no console quando employee acessa

---

## 🚨 Testes de Attack/Exploit

### Tentativas de Bypass

#### 1. Modificar JWT/Session
```bash
# Hacker modifica token para role=admin
curl -H "Authorization: Bearer malformed_token" /settings
→ 🚫 401 Unauthorized (falha na validação)
```

#### 2. Direct URL Access
```bash
# Employee tenta acessar /settings diretamente
GET /settings (sem modificação de token)
→ 🚫 403 Forbidden (middleware bloqueia)
```

#### 3. Trusting Frontend Permission
```javascript
// ❌ NUNCA faça isso:
if (canDelete) {
    handleDelete();  // Sem validar backend
}

// ✅ SEMPRE faça:
const handleDelete = async () => {
    const response = await fetch('/api/delete', { method: 'DELETE' });
    if (response.status === 403) {
        toast.error('Sem permissão');
    }
}
```

---

## 📊 Matriz de Testes Executados

| Teste | Admin | Employee | Motoboy | Status |
|-------|-------|----------|---------|--------|
| Acesso /dashboard | ✅ | ✅ | ✅ | [ ] |
| Acesso /settings | ✅ | ❌ | ❌ | [ ] |
| Acesso /motoboy/dashboard | ❌ | ❌ | ✅* | [ ] |
| Edit produto | ✅ | ❌ | ❌ | [ ] |
| Atualizar pedido | ✅ | ✅ | ❌ | [ ] |
| Cross-tenant access | ❌ | ❌ | ❌ | [ ] |
| Feature bloqueada | ✅ | ✅ | ✅ | [ ] |

*Se feature motoboy_management ativada

---

## 📋 Assinatura de Validação

```
Data: __________
Testador: __________
Ambiente: [ ] Local [ ] Staging [ ] Production
Status Final: [ ] PASSOU [ ] FALHOU

Problemas Encontrados:
_____________________________________________
_____________________________________________
```

