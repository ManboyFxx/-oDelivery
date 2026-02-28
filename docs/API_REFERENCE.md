# ÓoDelivery — API Reference

Esta documentação detalha as rotas públicas (APIs) disponibilizadas pelo sistema ÓoDelivery.

> **Base URL (Local):** `http://localhost:8000/api`
> **Base URL (Produção):** `https://seusistema.com/api`

---

## 🟢 Monitoramento e Saúde

### GET `/health`

Retorna o estado de saúde do sistema, incluindo banco de dados, cache, sistema de filas e espaço em disco.

**Retorno de sucesso (200 OK):**

```json
{
  "status": "ok",
  "version": "1.0.0",
  "environment": "production",
  "timestamp": "2026-02-28T02:00:02+00:00",
  "response_ms": 606.28,
  "checks": {
    "database": { "status": "ok", "latency_ms": 251.58 },
    "cache": { "status": "ok" },
    "broadcast": { "status": "configured", "driver": "pusher" },
    "queue": { "status": "ok", "failed_jobs": 0 },
    "storage": { "status": "ok", "free_mb": 341186 }
  }
}
```

---

## 📡 Autenticação

### POST `/login`

Autenticação de usuários (Admin/Employee/Motoboy).

> **Rate Limit:** 30 requisições por minuto por IP (`throttle:30,1`) para prevenir brute-force.

- **Requisição:**
  - `email` (string)
  - `password` (string)
- **Retorno:** Token Bearer (Sanctum) ou Cookie-based session.

### POST `/logout`

Invalida a sessão atual ou o token Sanctum. Requer `Bearer Token`.

---

## 📍 Polling e Acompanhamento Frontend Público

### GET `/poll/{tenantId}`

Verifica rapidamente se houve atualizações no tenant informado. Extremamente leve (não bate no DB, lê JSON).

- **Retorno:**
  ```json
  { "timestamp": 1708892300 }
  ```

---

## 🖨️ Sistema de Impressão (ÓoPrint Desktop)

Estas rotas são usadas pelo aplicativo **Electron** para consultar e mudar status de pedidos.

> Exigem Header `Authorization: Bearer <printer_token>` (gerado nas configurações).

### GET `/printer/orders`

Retorna todos os pedidos que precisam ser impressos.

### GET `/printer/profile`

Retorna dados básicos da loja (nome, logotipo, configurações de impressão termal).

### POST `/printer/orders/{id}/printed`

Marca o pedido como impresso na impressora local.

### POST `/printer/orders/{id}/status`

Muda o status do pedido (ex: `new` -> `preparing`).

---

## 🪝 Webhooks (Integrações)

> **Rate Limit:** 60 requisições por minuto (`throttle:60,1`).

### POST `/webhooks/evolution`

Recebe callbacks (mensagens, atualizações de status) da **Evolution API (WhatsApp)**.
A autenticação não usa IP ou Header padrão, valida através do header `x-evolution-signature` via **HMAC-SHA256**.

---

## ⛔ Notas de Segurança

1. **Proteção Multi-Tenant:** Rotas que lidam com dados (como pedidos e configurações) extraem o contexto via `tenant_id` atrelado ao usuário/token em uso ou ao domínio de requisição. A aplicação força **TenantScope** global impenetrável.
2. **PBAC (Permission Based Access Control):** Rotas sensíveis retornam `403 Forbidden` se a conta logada do provedor não possuir a permissão.
3. **Pusher:** Para assinar canais web privados, as requisições autenticadas fazem POST no endpoint Broadcaster Auth interno que devolve a autorização encriptada com o secret do Pusher.
