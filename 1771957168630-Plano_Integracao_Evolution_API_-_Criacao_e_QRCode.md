# Plano de Implementação: Criação de Instância e QR Code via Plataforma

> **Última atualização:** 2026-02-24

---

## 1. Objetivo

Permitir que o administrador crie instâncias da Evolution API e que usuários (ADMIN ou EDITOR vinculado) gerem o QR Code para conectar o WhatsApp — tudo por dentro da plataforma, sem necessidade de acessar o painel da Evolution API manualmente.

---

## 2. Situação Atual

| Etapa | Como é feito hoje |
|---|---|
| Criar instância | Manualmente no painel da Evolution API |
| Configurar (ignorar grupos, rejeitar chamadas) | Manualmente no painel |
| Gerar QR Code | Print do painel e envio manual ao usuário |
| Cadastrar na plataforma | Admin acessa `/dashboard/instances` e preenche nome + URL |
| Configurar API Key | Admin adiciona secret no Supabase manualmente |

---

## 3. Solução Proposta

### 3.1 Nova Edge Function: `manage-evolution-instance`

Função única com duas ações controladas pelo campo `action` no body:

#### Ação `create` (somente ADMIN)

**Entrada:**
```json
{
  "action": "create",
  "instanceName": "MINHA_INSTANCIA",
  "number": "5511999999999",
  "api_url": "https://api.evolution.example.com"
}
```

**Processo:**
1. Validar autenticação (Bearer token do Supabase)
2. Verificar que o usuário tem papel ADMIN (`has_role`)
3. Buscar a Global API Key do secret `EVOLUTION_API_GLOBAL_KEY`
4. Chamar `POST {api_url}/instance/create` com:
   ```json
   {
     "instanceName": "MINHA_INSTANCIA",
     "number": "5511999999999",
     "integration": "WHATSAPP-BAILEYS",
     "qrcode": false,
     "groupsIgnore": true,
     "rejectCall": true,
     "alwaysOnline": true
   }
   ```
5. Se sucesso, inserir registro na tabela `instances` (name + api_url)
6. Retornar sucesso com o `instance_id` criado

**Headers para Evolution API:**
```
Content-Type: application/json
apikey: {EVOLUTION_API_GLOBAL_KEY}
```

#### Ação `connect` (ADMIN ou EDITOR vinculado)

**Entrada:**
```json
{
  "action": "connect",
  "instance_id": "uuid-da-instancia"
}
```

**Processo:**
1. Validar autenticação
2. Verificar permissão:
   - ADMIN: acesso a qualquer instância
   - EDITOR: somente se `profiles.instance_id` === `instance_id` informado
3. Buscar dados da instância no banco (`name`, `api_url`)
4. Montar nome do secret: `EVOLUTION_API_KEY_{NOME_FORMATADO}`
   - Regras: maiúsculas, espaços → `_`, hífens → `_`
5. Buscar API Key do secret
6. Chamar `GET {api_url}/instance/connect/{instanceName}`
   - Header: `apikey: {API_KEY_DA_INSTANCIA}`
7. Retornar o QR Code (base64) e o status da conexão

**Resposta de sucesso:**
```json
{
  "status": "qr_generated",
  "qrcode": "data:image/png;base64,iVBORw0KGgo...",
  "message": "Escaneie o QR Code com seu WhatsApp"
}
```

**Resposta se já conectado:**
```json
{
  "status": "already_connected",
  "message": "WhatsApp já está conectado nesta instância"
}
```

---

### 3.2 Secret Necessário

| Secret | Descrição | Onde obter |
|---|---|---|
| `EVOLUTION_API_GLOBAL_KEY` | API Key master/global da Evolution API | Painel do servidor Evolution API (variável de ambiente `AUTHENTICATION_API_KEY`) |

> **Nota:** As API Keys individuais por instância (`EVOLUTION_API_KEY_{NOME}`) continuam sendo usadas para a ação `connect` e demais funções existentes.

---

### 3.3 Alterações no Frontend

#### Página de Instâncias (`src/pages/Instances.tsx`) — somente ADMIN

**Formulário "Nova Instância":**
- Adicionar campo: **Número do telefone** (opcional, com DDI — ex: `5511999999999`)
- Adicionar toggle: **"Criar automaticamente na Evolution API"**
  - Quando ativado: ao salvar, chama a edge function `manage-evolution-instance` com `action: "create"` antes de inserir no banco
  - Quando desativado: comportamento atual (apenas cadastra na plataforma)

**Listagem de Instâncias:**
- Adicionar botão **"QR Code"** (ícone `QrCode`) ao lado do botão de teste de conexão
- Ao clicar, abre modal/dialog que:
  1. Chama a edge function com `action: "connect"`
  2. Exibe a imagem do QR Code em tamanho legível (~256x256px)
  3. Exibe timer de expiração (45 segundos)
  4. Botão "Recarregar QR Code" para gerar novo
  5. Se já conectado, exibe mensagem de sucesso

#### Página de Perfil (`src/pages/Profile.tsx`) — EDITOR com instância vinculada

**Novo card "Conexão WhatsApp":**
- Visível apenas se `profile.instance_id` não for nulo
- Botão **"Conectar WhatsApp"** / **"Gerar QR Code"**
- Ao clicar, abre o mesmo dialog de QR Code
- Mesma lógica do modal da página de instâncias

#### Novo componente: `src/components/QRCodeDialog.tsx`

Componente reutilizável que:
- Recebe `instance_id` como prop
- Gerencia o estado de loading, erro e exibição do QR Code
- Tem botão de recarregar
- Exibe mensagens de status (conectado, erro, expirado)

---

### 3.4 Configuração do Supabase

**`supabase/config.toml`** — adicionar:
```toml
[functions.manage-evolution-instance]
verify_jwt = false
```

> **Nota:** A verificação de JWT é feita manualmente dentro da função (como nas demais edge functions do projeto), permitindo controle granular de permissões.

---

## 4. Impacto nas Funcionalidades Existentes

| Componente | Impacto |
|---|---|
| Tabela `instances` | **Nenhum** — mesma estrutura |
| Tabela `profiles` | **Nenhum** — já tem `instance_id` |
| RLS policies | **Nenhum** |
| Edge function `test-instance-connection` | **Nenhum** — continua funcionando |
| Edge function `sync-groups` | **Nenhum** |
| Edge function `sync-contacts` | **Nenhum** |
| Edge function `broadcast-now` | **Nenhum** |
| Edge function `generate-ia-variants` | **Nenhum** |
| Secrets existentes (`EVOLUTION_API_KEY_*`) | **Nenhum** — continuam sendo usados |
| Fluxo manual de criação | **Continua disponível** — o toggle é opcional |

---

## 5. Fluxo Completo (após implementação)

### Admin criando nova instância:
```
1. Admin acessa /dashboard/instances
2. Clica "Nova Instância"
3. Preenche: Nome, URL da API, Número (opcional)
4. Ativa toggle "Criar automaticamente"
5. Clica Salvar
6. → Edge function cria na Evolution API + insere no banco
7. Admin clica no ícone QR Code na listagem
8. → QR Code aparece na tela
9. Admin envia o link/print para o usuário, OU
10. Vincula o usuário à instância em /dashboard/users
11. Usuário acessa seu Perfil e gera o QR Code sozinho
```

### Editor conectando WhatsApp:
```
1. Editor acessa /dashboard/profile
2. Vê card "Conexão WhatsApp" (se tem instância vinculada)
3. Clica "Gerar QR Code"
4. Escaneie com o celular
5. Status muda para "Conectado"
```

---

## 6. Tratamento de Erros

| Cenário | Mensagem ao usuário |
|---|---|
| Global API Key não configurada | "A chave global da Evolution API não está configurada. Contate o administrador do sistema." |
| API Key da instância não encontrada | "Secret EVOLUTION_API_KEY_{NOME} não configurado no Supabase." |
| Evolution API fora do ar / timeout | "Não foi possível conectar à Evolution API. Verifique se o servidor está online." |
| Instância já existe na Evolution | "Já existe uma instância com este nome na Evolution API." |
| QR Code expirado | Botão "Recarregar" gera novo QR Code automaticamente |
| Usuário sem permissão | "Você não tem permissão para acessar esta instância." |

---

## 7. Endpoints da Evolution API Utilizados

| Método | Endpoint | Uso | Autenticação |
|---|---|---|---|
| `POST` | `/instance/create` | Criar instância | Global API Key |
| `GET` | `/instance/connect/{instanceName}` | Gerar QR Code | API Key da instância |
| `GET` | `/instance/connectionState/{instanceName}` | Verificar status (já usado em `test-instance-connection`) | API Key da instância |

---

## 8. Arquivos Criados/Modificados

| Arquivo | Ação |
|---|---|
| `supabase/functions/manage-evolution-instance/index.ts` | **Criar** |
| `src/components/QRCodeDialog.tsx` | **Criar** |
| `src/pages/Instances.tsx` | **Modificar** — campos no form + botão QR |
| `src/pages/Profile.tsx` | **Modificar** — card Conexão WhatsApp |
| `supabase/config.toml` | **Modificar** — adicionar config da nova function |

---

## 9. Checklist de Pré-requisitos

- [ ] Confirmar versão da Evolution API (v1 ou v2) — endpoints podem variar
- [ ] Obter a Global API Key do servidor Evolution API
- [ ] Configurar secret `EVOLUTION_API_GLOBAL_KEY` no Supabase
- [ ] Testar endpoints da Evolution API manualmente (via Postman/curl) antes de implementar

---

## 10. Reutilização em Outros Projetos

Este plano pode ser reaproveitado em qualquer projeto que integre com a Evolution API. Os pontos de adaptação são:

1. **Nome dos secrets** — manter o padrão `EVOLUTION_API_KEY_{NOME}` ou adaptar
2. **Tabela de instâncias** — garantir que tenha `name` e `api_url`
3. **Sistema de permissões** — adaptar verificação de roles conforme o projeto
4. **Configurações da instância** — ajustar parâmetros do `POST /instance/create` conforme necessidade (ex: `groupsIgnore`, `rejectCall`, `alwaysOnline`)
