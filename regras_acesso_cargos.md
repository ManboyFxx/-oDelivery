# 🔐 Matriz de Controle de Acesso e Permissões (ACL)

Este documento define as regras estritas de acesso para cada perfil de usuário no sistema oDelivery.

---

## 🏛️ Perfis de Acesso (Roles)

1.  **Admin (Dono):** Acesso total irrestrito ao tenant.
2.  **Funcionário (Operador):** Acesso focado no dia a dia da operação (Cozinha, Balcão, Estoque).
3.  **Motoboy:** Acesso restrito apenas ao seu painel de entregas.

---

## 🚦 Regras de Visibilidade e Bloqueio

### 1. Admin 👑
*   **Permissão:** `*` (Tudo).
*   **Pode:** Configurar loja, ver relatórios financeiros, gerenciar pagamentos, criar usuários, editar cardápio completo, ver métricas sensíveis.

### 2. Funcionário 👷
Focado na operação. Não pode ver quanto a loja fatura no total nem alterar configurações críticas da empresa.

| Módulo / Área | Acesso | Interação Permitida |
| :--- | :---: | :--- |
| **PDV (Ponto de Venda)** | ✅ **Total** | Lançar pedidos, fechar venda de balcão. |
| **Pedidos (Gestão)** | ✅ **Total** | Ver, Aceitar, Despachar, Cancelar pedidos. |
| **Cozinha (KDS)** | ✅ **Total** | Ver fila de produção, alterar status para "Pronto". |
| **Produtos/Cardápio** | ✅ **Total*** | Cadastrar produtos, editar preços, pausar itens (estoque). |
| **Estoque** | ✅ **Total** | Dar entrada/saída, ver grade. |
| **Configurações da Loja** | ❌ **Bloqueado** | Não acessa nome da loja, horários, pagamentos. |
| **Relatórios Financeiros** | ❌ **Bloqueado** | Não vê faturamento, DRE, lucro. |
| **Gestão de Usuários** | ❌ **Bloqueado** | Não cria nem edita outros usuários. |
| **Assinatura/Plano** | ❌ **Bloqueado** | Não acessa dados de cobrança do sistema. |

> **Nota:** O Funcionário tem acesso às abas internas de Produtos (Categorias, Complementos, etc) para manter a operação rodando.

### 3. Motoboy 🏍️
Isolado do sistema administrativo.

*   **Rota Única:** `/motoboy/*` (Dashboard, Entregas, Perfil).
*   **Bloqueio Geral:** Se tentar acessar `/dashboard`, `/pedidos`, `/configuracoes` -> **Redirecionar para `/motoboy/dashboard`** ou **403 Forbidden**.
*   **Dados:** Vê apenas as entregas atribuídas a ele ou disponíveis na fila de espera (se configurado). Não vê dados de outros motoboys.

---

## 🛡️ Implementação Técnica Sugerida

### Middleware de Proteção
Criar (ou refatorar) middlewares para garantir essas regras no `routes/web.php`.

```php
// Exemplo de estrutura de rotas
Route::middleware(['auth', 'role:admin'])->group(function () {
    // Rotas Financeiras
    // Rotas de Configuração (SettingsController)
    // Rotas de Usuários
});

Route::middleware(['auth', 'role:admin,employee'])->group(function () {
    // Rotas Operacionais
    // ProductsController
    // OrderController
    // StockController
    // PDVController
});

Route::middleware(['auth', 'role:motoboy'])->prefix('motoboy')->group(function () {
    // Rotas do Motoboy
});
```

### Menu Lateral (Sidebar)
O front-end deve ocultar os links que o usuário não tem permissão para ver.
*   **Funcionário Logado:** Sidebar não exibe "Financeiro", "Configurações", "Equipe".
*   **Motoboy Logado:** Sidebar exibe layout exclusivo mobile.
