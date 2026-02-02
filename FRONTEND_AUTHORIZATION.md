# 🎨 Frontend Authorization - Estratégia de Visibilidade

Implementação de controle de acesso no frontend complementando a segurança de backend.

---

## 📋 Princípio Fundamental

> **O Frontend é Cosmético. A Segurança está no Backend.**

O controle de acesso no frontend serve **APENAS para UX** (ocultar menu items, desabilitar botões).
Qualquer validação crítica deve estar no **Backend** (rotas middleware).

### Exemplo:
```tsx
// ❌ INSEGURO: Apenas frontend bloqueia
if (user.role === 'admin') {
    // Mostrar delete button
}

// ✅ SEGURO: Frontend oculta + Backend valida
// Frontend: if (user.role === 'admin') { <button>Deletar</button> }
// Backend: Route::middleware('role:admin')->delete(...)
```

---

## 🔄 Padrão Implementado

### 1. **Sidebar.tsx** - Controle de Menu Items
**Arquivo:** `resources/js/Components/Sidebar.tsx`

```tsx
// Itens operacionais (admin + employee)
const operationalGroups: Group[] = [
    { title: 'Vendas', items: [...] },
    { title: 'Estoque', items: [...] }
];

// Itens admin only
const adminOnlyGroups: Group[] = [
    { title: 'Configurações', items: [...] },
    { title: 'Financeiro', items: [...] }
];

// Monta menu baseado em role
const tenantGroups = user.role === 'admin'
    ? [...operationalGroups, ...adminOnlyGroups]
    : operationalGroups;
```

**Resultado:**
- Employee logado vê apenas: Dashboard, PDV, Pedidos, Cozinha, Estoque, Cardápio (visualizar)
- Admin logado vê tudo

### 2. **Proteção de Ações Sensíveis**
**Exemplo: Botões no componente**

```tsx
// Botão de deletar - apenas admin vê
{user.role === 'admin' && (
    <button onClick={() => deleteEmployee(id)}>
        Remover
    </button>
)}

// Campo de preço - admin edita, employee visualiza
{user.role === 'admin' ? (
    <input value={price} onChange={setPrice} />
) : (
    <span>{price}</span>
)}
```

### 3. **Redirecionamento em Unauthorized**
**Em AuthenticatedLayout.tsx**

```tsx
// Se employee tenta acessar /financeiro e backend retorna 403
// Frontend redireciona para /dashboard
if (response.status === 403) {
    router.visit('/dashboard');
}
```

---

## 📱 Implementação Prática

### Checklist de Componentes

| Componente | Item | Ação |
|-----------|------|------|
| Sidebar | Financial link | Ocultar se role === 'employee' ✅ |
| Sidebar | Employees link | Ocultar se role !== 'admin' ✅ |
| Sidebar | Settings link | Ocultar se role === 'employee' ✅ |
| OrderIndex | Assign Motoboy button | Desabilitar se plan sem feature |
| SettingsPanel | Save button | Desabilitar se role === 'employee' |
| EmployeesPage | Delete button | Ocultar se role === 'employee' |
| ProductsPage | Edit button | Desabilitar se role === 'employee' |

---

## 🛡️ Validação Backend (Já Implementado)

Mesmo que employee "hackear" o frontend e tentar acessar `/financeiro`:

```
GET /financeiro
Header: Authorization: Bearer token_employee
↓
Route: middleware(['role:admin']) ← Bloqueia aqui
↓
403 Forbidden: "Acesso restrito. Você não tem permissão..."
```

---

## 🚀 Padrão de Componente Reutilizável

```tsx
// utils/auth.ts
export function canAccess(user: User, role: string | string[]): boolean {
    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(user.role);
}

export function canAccessFeature(tenant: Tenant, feature: string): boolean {
    return tenant?.features?.includes(feature) ?? false;
}
```

**Uso em componentes:**
```tsx
import { canAccess, canAccessFeature } from '@/utils/auth';

export default function ProductsPage() {
    const { auth, tenant } = usePage().props;
    const user = auth.user;

    if (!canAccess(user, 'admin')) {
        return <div>Acesso restrito</div>;
    }

    return (
        <div>
            {canAccessFeature(tenant, 'motoboy_management') && (
                <MotoboysSection />
            )}
        </div>
    );
}
```

---

## 📊 Matriz: O que Mostra/Oculta no Frontend

| Feature | Admin | Employee | Motoboy |
|---------|-------|----------|---------|
| Dashboard | ✅ | ✅ | ✅ (motoboy/) |
| Orders | ✅ | ✅ | ✅ (motoboy/pedidos) |
| Settings | ✅ | ❌ Oculto | ❌ |
| Financial | ✅ | ❌ Oculto | ❌ |
| Employees | ✅ | ❌ Oculto | ❌ |
| Products (edit) | ✅ | ❌ Disabled | ❌ |
| Motoboys | ✅* | ❌ Oculto | ❌ |
| WhatsApp | ✅* | ❌ Oculto | ❌ |

*Apenas se plano permitir

---

## ⚡ Próximas Implementações (Fase 4)

- [ ] Criar hook `useCanAccess(role)` reutilizável
- [ ] Atualizar ProductsPage para ocultar edit buttons de employees
- [ ] Atualizar SettingsPage para mostrar "read-only" mode para employees
- [ ] Adicionar validação de feature no componente Motoboys
- [ ] Toast error "Acesso restrito" quando user tenta ação não permitida

---

## 🔗 Referências

- **ROTAS_ACESSO.md** - Middleware de rotas e autorização backend
- **Sidebar.tsx** - Implementação de controle de menu
- **AuthenticatedLayout.tsx** - Redirecionamento após 403

