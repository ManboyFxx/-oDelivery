# Walkthrough - óoprint v2 Foundation

## Changes Implemented

### Backend (Laravel)
- **New Endpoint:** `POST /api/printer/orders/{id}/status` to update order status from the terminal.
- **Enhanced Polling:** The `/api/printer/orders` endpoint now returns `new` and `out_for_delivery` orders, allowing the terminal to see and manage the entire lifecycle.
- **Validation:** Added validation for status transitions (`preparing`, `ready`, `out_for_delivery`, `delivered`).

### Frontend (óoprint)
- **Settings Sync:** The application now synchronizes `Paper Width`, `Copies`, and `Auto-Print` settings from the Cloud (Tenant Profile) on startup.
- **Local Persistence:** "Printed" orders are now saved to `localStorage`, preventing them from disappearing when the app is restarted (keeps last 50 orders).
- **Status Control:** Added action buttons to the order cards:
  - **[CONFIRMAR]**: Changes status from `New` to `Preparing`.
  - **[PRONTO]**: Changes status from `Preparing` to `Ready`.
  - **[SAIU P/ ENTREGA]**: Changes status from `Ready` to `Out for Delivery`.
  - **[ENTREGUE]** (Logic implemented, UI hides it): Changes to `Delivered`.

### Auth UX (Story 2.1.1)
- **Tenant Display:** O sidebar agora exibe o logo do estabelecimento e o nome de forma mais elegante. O Header também mostra o nome da loja.
- **Botão de Sair:** Adicionado ao Header. Ao sair, as configurações atuais são limpas, mas a sessão permanece no dispositivo para reconexão rápida.
- **Reconexão Inteligente:** No `SetupView`, se você já logou anteriormente, um cartão de "Sessão Salva" aparece permitindo reconectar com um clique (usando o mesmo token), sem precisar digitar nada.

## How to Test

1.  **Test Logout:** Clique no botão de "Sair" no Header. Você deve ser levado de volta à tela de configuração.
2.  **Test Reconnect:** Na tela de configuração, você deverá ver seu estabelecimento. Clique em "Reconectar Agora". O sistema deve logar instantaneamente.
3.  **Test Switch Account:** Clique em "Trocar" no cartão de sessão salva; a sessão será excluída e o formulário de token aparecerá limpo.
4.  **Test Tenant Display:** Verifique se o logo e nome da loja aparecem corretamente no Sidebar.

## Next Steps
- Implement **Receipt Enrichment** (QR Codes, Logos on Canvas).
- Implement **Hardware Precision** (Cut Paper command, Drawer Kick).
