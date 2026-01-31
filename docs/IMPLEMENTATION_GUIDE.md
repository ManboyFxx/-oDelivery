# Guia de Implementação - FASE 1 & FASE 2

## 📋 Sumário

Este documento é um guia rápido de referência para:
- **FASE 1**: Integração Evolution API (WhatsApp)
- **FASE 2**: Melhorias de Segurança (2FA, Rate Limiting, Audit, Criptografia)

---

## 🚀 FASE 1: EVOLUTION API - WHATSAPP INTEGRATION

### 1. Configurar Ambiente

Adicione ao seu `.env`:

```env
EVOLUTION_API_URL=http://seu-ip-vps:8080
EVOLUTION_API_KEY=sua-chave-api-aqui
```

### 2. Testar Conexão

```bash
php artisan evolution:test
```

Saída esperada:
```
✅ Conexão estabelecida com sucesso!
Instâncias Ativas:
+----------------+------------+------------------+
| Nome           | Status     | Telefone         |
+----------------+------------+------------------+
| loja-centro    | connected  | 5511999999999    |
+----------------+------------+------------------+
```

### 3. Gerenciar Instâncias

**URL**: http://seu-app.local/whatsapp/instances

Funcionalidades:
- ✅ Criar nova instância
- ✅ Escanear QR Code para conectar
- ✅ Visualizar status (auto-atualiza)
- ✅ Desconectar instância
- ✅ Remover instância

### 4. Mensagens Automáticas

Enviadas automaticamente quando:
- `status → preparing`: "Pedido Confirmado! 🎉"
- `status → ready`: "Pedido Pronto! ✅"
- `status → out_for_delivery`: "Saiu para Entrega! 🛵"
- `status → delivered`: "Pedido Entregue! 🎉"

### 5. Customizar Templates

Acesse: `SELECT * FROM whatsapp_templates;`

**Variáveis disponíveis**:
- `{customer_name}` - Nome do cliente
- `{order_number}` - Número do pedido
- `{order_total}` - Total formatado (R$ X,XX)
- `{store_name}` - Nome da loja
- `{store_phone}` - Telefone da loja
- `{delivery_address}` - Endereço de entrega
- `{payment_method}` - Forma de pagamento
- `{delivery_fee}` - Taxa de entrega

### Rotas Evolution API

```
GET    /whatsapp                              (index)
GET    /whatsapp/instances                    (gerenciar)
POST   /whatsapp/instances                    (criar)
GET    /whatsapp/instances/{id}/qrcode        (obter QR)
GET    /whatsapp/instances/{id}/status        (verificar status)
POST   /whatsapp/instances/{id}/disconnect    (desconectar)
DELETE /whatsapp/instances/{id}               (remover)
POST   /api/webhooks/whatsapp                 (webhook da Evolution)
```

---

## 🔐 FASE 2: SEGURANÇA

### 2FA (Two-Factor Authentication)

**URL**: `/settings/two-factor`

**Fluxo**:
1. Admin acessa `/settings/two-factor`
2. Clica "Ativar 2FA"
3. Escaneia QR Code com Google Authenticator
4. Insere código de 6 dígitos
5. Recebe 8 recovery codes (SALVAR!)
6. Próximo login exigirá código 2FA

**Recovery Codes**:
- Um por vez
- Uso único
- Válido se perder authenticator
- Possível regenerar

**Forçado para**: Super Admins (via middleware)

### Rate Limiting Global

Automático em todas as rotas:
- Super Admins: **1000 requisições/minuto**
- Usuários autenticados: **100 requisições/minuto**
- Visitantes (Guest): **30 requisições/minuto**

Resposta ao exceder: `HTTP 429 Too Many Requests`

### Audit Logging Automático

Registra automaticamente:
- `User` creation/update/delete
- `Order` creation/update/delete
- `Product` creation/update/delete
- `PaymentMethod` creation/update/delete

**Informações capturadas**:
- `user_id` (quem fez)
- `tenant_id` (qual loja)
- `action` (created/updated/deleted)
- `old_values` (valores anteriores em JSON)
- `new_values` (novos valores em JSON)
- `ip_address` (IP da requisição)
- `user_agent` (navegador/cliente)

Ver logs: Tabela `audit_logs`

### Criptografia de Dados Sensíveis

**Criptografado automaticamente**:

**Customer**:
- `phone`

**CustomerAddress**:
- `street`
- `number`
- `complement`
- `neighborhood`
- `city`
- `state`
- `zip_code`

**Segurança**:
- AES-256-CBC via APP_KEY
- Descriptação automática ao acessar
- Erro gracioso se APP_KEY mudar
- Transparente aos controllers
- LGPD compliant

### Rotas 2FA

```
GET    /settings/two-factor                   (página)
POST   /settings/two-factor/enable            (iniciar setup)
POST   /settings/two-factor/confirm           (confirmar com código)
POST   /settings/two-factor/disable           (desativar)
POST   /settings/two-factor/verify            (verificar no login)
POST   /settings/two-factor/regenerate-codes  (novos recovery codes)
```

---

## 🆘 TROUBLESHOOTING

### ❌ "Connection refused" ao testar Evolution API

✓ Verificar se Evolution API está rodando na VPS
✓ Verificar firewall (porta 8080 aberta)
✓ Testar: `curl -H "apikey: CHAVE" http://seu-ip:8080/instance/fetchInstances`

### ❌ QR Code não aparece

✓ Verificar se instância foi criada em Evolution API
✓ Verificar logs da Evolution API na VPS
✓ Tentar criar nova instância

### ❌ Webhook não recebe eventos

✓ Verificar se URL do webhook é acessível publicamente
✓ Testar: `php artisan evolution:test`
✓ Ver logs: `storage/logs/laravel.log`
✓ Verificar se webhook está configurado na Evolution API

### ❌ 2FA código não funciona

✓ Verificar sincronização de relógio (NTP)
✓ Usar recovery code ao invés
✓ Desativar e reativar 2FA

### ❌ Criptografia não funciona (APP_KEY mudou)

✓ Restaurar APP_KEY anterior (backup!)
✓ Ou fazer migração de dados com nova chave
✓ NUNCA mudar APP_KEY em produção sem backup

---

## 🔴 SEGURANÇA: IMPORTANTE!

### ⚠️ CRÍTICO

1. **APP_KEY é essencial para criptografia**
   - Fazer backup: `grep APP_KEY .env`
   - Armazenar em local seguro (password manager)
   - Mudança em produção quebra descriptação de dados

2. **Webhooks devem usar HTTPS em produção**
   - Validar assinatura/API key sempre
   - Logs auditam todas as tentativas

3. **Recovery codes são one-time use**
   - Mostrar apenas uma vez ao ativar 2FA
   - Usuário precisa salvar em local seguro
   - Não há como recuperar perdidos (só regenerar)

4. **Rate limiting protege contra brute force**
   - Não desabilitar em produção
   - Logs rastreiam violações

5. **Audit logs mantêm histórico completo**
   - Usar para compliance e investigation
   - Não deletar (apenas anonimizar)

---

## 📁 ARQUIVOS IMPORTANTES

### WhatsApp

- `app/Http/Controllers/WhatsAppInstanceController.php`
- `app/Http/Controllers/WhatsAppWebhookController.php`
- `app/Services/EvolutionApiService.php`
- `app/Services/OoBotService.php`
- `app/Jobs/SendWhatsAppMessageJob.php`
- `app/Console/Commands/TestEvolutionConnection.php`
- `database/seeders/WhatsAppTemplateSeeder.php`
- `resources/js/Pages/Settings/WhatsAppInstances.tsx`
- `config/services.php`
- `routes/api.php`, `routes/web.php`

### Segurança

- `app/Services/TwoFactorService.php`
- `app/Http/Controllers/TwoFactorController.php`
- `app/Http/Middleware/GlobalRateLimiter.php`
- `app/Http/Middleware/EnsureTwoFactorEnabled.php`
- `app/Traits/Auditable.php`
- `resources/js/Pages/Settings/TwoFactor.tsx`
- `database/migrations/2026_01_25_150000_add_two_factor_to_users_table.php`
- `app/Models/Customer.php` (com criptografia)
- `app/Models/CustomerAddress.php` (com criptografia)
- `bootstrap/app.php` (middleware global)
- `.env.example`

---

## ✅ PRÓXIMOS PASSOS

1. ✅ Testar Evolution API localmente
2. ✅ Verificar rate limiting funcionando
3. ✅ Confirmar audit logs sendo criados
4. ✅ Validar criptografia de dados
5. ✅ Documentar procedimentos de segurança
6. ✅ Configurar backups do APP_KEY
7. ✅ Planejar Fase 3 (Mercado Pago)

---

**Última atualização**: 25/01/2026
**Status**: Pronto para Produção
