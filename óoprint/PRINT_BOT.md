# Bot de Impressão - Documentação para Integração

Este documento explica como o bot de impressão deve se integrar com o sistema OODelivery, fazer autenticação e processar pedidos automaticamente.

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Configuração](#configuração)
3. [Autenticação](#autenticação)
4. [Estrutura das Tabelas](#estrutura-das-tabelas)
5. [Fluxo de Conexão](#fluxo-de-conexão)
6. [Processando Jobs de Impressão](#processando-jobs-de-impressão)
7. [Exemplo Completo](#exemplo-completo-do-bot)
8. [Troubleshooting](#troubleshooting)

---

## Visão Geral

O bot de impressão é um aplicativo instalável que:
1. **Autentica** com credenciais de um admin do estabelecimento
2. **Monitora** a fila de impressão em tempo real
3. **Imprime** automaticamente os pedidos na impressora térmica
4. **Reporta** seu status para o sistema web

### Arquitetura

```
┌──────────────────────────────────────────────────────────────────┐
│  FLUXO DE AUTENTICAÇÃO E OPERAÇÃO                                │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Bot inicia                                                   │
│       │                                                          │
│       ▼                                                          │
│  2. Login (email/senha) ──► Supabase Auth ──► JWT Token          │
│       │                                                          │
│       ▼                                                          │
│  3. JWT contém user_id ──► RLS busca tenant_id ──► Acesso auto   │
│       │                                                          │
│       ▼                                                          │
│  4. Escuta print_jobs ──► Recebe novos pedidos ──► Imprime       │
│       │                                                          │
│       ▼                                                          │
│  5. Atualiza bot_status ──► Heartbeat a cada 15s                 │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Configuração

### Variáveis de Ambiente

```env
# Conexão Supabase
SUPABASE_URL=https://eljcqzderihuvnjsnple.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsamNxemRlcmlodXZuanNucGxlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxNDM4MzQsImV4cCI6MjA4MjcxOTgzNH0.yQzJojyKOX5Q7yHA5ZwdJQmHffeyL26B5K6aAoMB4dU

# Credenciais do administrador do estabelecimento
ADMIN_EMAIL=admin@minhaloja.com
ADMIN_PASSWORD=senha_segura_aqui
```

### ⚠️ Segurança das Credenciais

- **NUNCA** compartilhe as credenciais em código-fonte
- Use um usuário admin **dedicado** para o bot de impressão
- Armazene credenciais de forma segura (arquivo .env local, keychain do sistema, etc.)
- Considere criar um usuário específico com role `admin` apenas para o bot

---

## 🔐 Autenticação

O bot **DEVE** fazer login com credenciais de um administrador do estabelecimento para acessar as tabelas.

### Por que precisa de login?

As políticas RLS (Row Level Security) garantem que:
- Cada bot só acessa dados do seu estabelecimento
- O `tenant_id` é obtido automaticamente do usuário logado (via tabela `profiles`)
- Não é possível acessar dados de outros estabelecimentos
- Toda operação é rastreável

### Fluxo de Login

```javascript
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) {
    console.error('❌ Erro no login:', error.message);
    throw error;
  }
  
  console.log('✅ Login bem-sucedido!');
  console.log('   User ID:', data.user.id);
  
  return data;
}
```

### Obtendo o Tenant ID

Após login, busque o `tenant_id` do perfil do usuário:

```javascript
async function getTenantId() {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('tenant_id')
    .single();
  
  if (error) {
    console.error('❌ Erro ao buscar tenant:', error.message);
    throw error;
  }
  
  console.log('   Tenant ID:', profile.tenant_id);
  return profile.tenant_id;
}
```

### Mantendo a Sessão Ativa

```javascript
// Escutar mudanças de autenticação
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth event:', event);
  
  if (event === 'SIGNED_OUT') {
    console.log('⚠️ Sessão expirada - reconectando...');
    // Implementar lógica de reconexão
    reconnect();
  }
  
  if (event === 'TOKEN_REFRESHED') {
    console.log('🔄 Token renovado automaticamente');
  }
});

// O SDK do Supabase faz refresh automático do token
```

### Logout

```javascript
async function logout() {
  await supabase.auth.signOut();
  console.log('👋 Logout realizado');
}
```

---

## Estrutura das Tabelas

### Tabela `profiles` (Consulta)

Usada para obter o `tenant_id` do usuário logado.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | uuid | ID do usuário (mesmo do auth.users) |
| `tenant_id` | uuid | ID do estabelecimento |
| `role` | text | Role do usuário (`owner`, `admin`, `employee`, `motoboy`) |
| `full_name` | text | Nome completo |

### Tabela `print_jobs` (Fila de Impressão)

Esta é a tabela principal que o bot deve monitorar.

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | uuid | Auto | ID único do job |
| `order_id` | uuid | Não | Referência ao pedido |
| `order_number` | integer | Não | Número do pedido para exibição |
| `tenant_id` | uuid | Sim | ID do estabelecimento (filtrado por RLS) |
| `status` | text | Não | `pending`, `printing`, `printed`, `error`, `cancelled` |
| `content` | text | Não | **HTML do cupom pronto para imprimir** |
| `copies` | integer | Não | Número de cópias (default: 1) |
| `priority` | integer | Não | Prioridade (maior = mais urgente) |
| `device_id` | text | Não | ID do bot que processou |
| `error_message` | text | Não | Mensagem de erro |
| `attempts` | integer | Não | Número de tentativas |
| `printed_at` | timestamp | Não | Data/hora de impressão |
| `created_at` | timestamp | Auto | Data de criação |
| `updated_at` | timestamp | Auto | Última atualização |

#### Status do Job

| Status | Descrição |
|--------|-----------|
| `pending` | Aguardando impressão |
| `printing` | Sendo impresso no momento |
| `printed` | Impresso com sucesso |
| `error` | Erro ao imprimir |
| `cancelled` | Cancelado pelo usuário/sistema |

### Tabela `bot_status` (Status do Bot)

O bot deve atualizar seu status nesta tabela periodicamente.

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| `id` | uuid | Auto | ID único |
| `device_id` | text | Sim | ID único da instalação (UUID gerado localmente) |
| `tenant_id` | uuid | Sim | ID do estabelecimento |
| `company_name` | text | Não | Nome para identificação (ex: "Caixa 1") |
| `last_seen` | timestamp | Não | Último heartbeat |
| `status` | text | Não | `online`, `paused`, `error`, `offline` |
| `version` | text | Não | Versão do bot (ex: "1.0.0") |
| `printer_name` | text | Não | Nome da impressora selecionada |
| `ip_address` | text | Não | IP do computador |
| `error` | text | Não | Mensagem de erro atual |
| `metadata` | jsonb | Não | Dados extras (SO, etc.) |

#### Status Possíveis

| Status | Quando Usar |
|--------|-------------|
| `online` | Bot funcionando, pronto para imprimir |
| `paused` | Usuário pausou manualmente |
| `error` | Erro na impressora ou no bot |
| `offline` | Bot sendo desligado |

---

## Fluxo de Conexão

### 1. Gerar Device ID (Primeira Execução)

```javascript
import { v4 as uuidv4 } from 'uuid';

function getOrCreateDeviceId() {
  // Em Electron, use electron-store ou similar
  // Em Node.js, salve em arquivo local
  const fs = require('fs');
  const configPath = './config.json';
  
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    if (config.deviceId) return config.deviceId;
  } catch (e) {
    // Arquivo não existe
  }
  
  const deviceId = uuidv4();
  fs.writeFileSync(configPath, JSON.stringify({ deviceId }));
  return deviceId;
}

const deviceId = getOrCreateDeviceId();
console.log('Device ID:', deviceId);
```

### 2. Login e Inicialização

```javascript
async function initialize() {
  // 1. Login
  await login(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD);
  
  // 2. Obter tenant_id
  const tenantId = await getTenantId();
  
  // 3. Enviar heartbeat inicial
  await sendHeartbeat(tenantId);
  
  // 4. Processar jobs pendentes
  await processPendingJobs();
  
  // 5. Escutar novos jobs
  subscribeToJobs();
  
  // 6. Iniciar heartbeat periódico
  setInterval(() => sendHeartbeat(tenantId), 15000);
  
  console.log('🖨️ Bot iniciado com sucesso!');
}
```

### 3. Heartbeat (Status)

Envie a cada **15 segundos**:

```javascript
async function sendHeartbeat(tenantId) {
  try {
    const { error } = await supabase
      .from('bot_status')
      .upsert({
        device_id: deviceId,
        tenant_id: tenantId,
        company_name: 'PrintBot - Caixa 1',
        last_seen: new Date().toISOString(),
        status: currentStatus, // 'online', 'paused', 'error'
        version: '1.0.0',
        printer_name: selectedPrinter,
        ip_address: getLocalIP(),
        metadata: {
          platform: process.platform,
          arch: process.arch,
          nodeVersion: process.version
        }
      }, {
        onConflict: 'device_id'
      });

    if (error) throw error;
    console.log('💓 Heartbeat enviado');
  } catch (err) {
    console.error('❌ Erro no heartbeat:', err.message);
  }
}
```

### 4. Shutdown Gracioso

```javascript
async function shutdown() {
  console.log('👋 Encerrando bot...');
  
  // Marcar como offline
  await supabase
    .from('bot_status')
    .update({
      status: 'offline',
      last_seen: new Date().toISOString()
    })
    .eq('device_id', deviceId);
  
  // Logout
  await supabase.auth.signOut();
  
  process.exit(0);
}

// Capturar sinais de encerramento
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('beforeExit', shutdown);
```

---

## Processando Jobs de Impressão

### 1. Escutar Novos Jobs (Realtime)

```javascript
function subscribeToJobs() {
  const channel = supabase
    .channel('print-jobs-listener')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'print_jobs'
        // RLS filtra automaticamente por tenant_id
      },
      async (payload) => {
        if (payload.new.status === 'pending') {
          console.log('📥 Novo job:', payload.new.order_number);
          await processJob(payload.new);
        }
      }
    )
    .subscribe((status) => {
      console.log('📡 Realtime:', status);
    });
  
  return channel;
}
```

### 2. Buscar Jobs Pendentes (Inicialização)

```javascript
async function processPendingJobs() {
  // RLS filtra automaticamente por tenant_id
  const { data: jobs, error } = await supabase
    .from('print_jobs')
    .select('*')
    .eq('status', 'pending')
    .order('priority', { ascending: false })
    .order('created_at', { ascending: true });

  if (error) {
    console.error('❌ Erro ao buscar jobs:', error.message);
    return;
  }

  console.log(`📋 ${jobs?.length || 0} jobs pendentes`);
  
  for (const job of jobs || []) {
    await processJob(job);
  }
}
```

### 3. Processar Job Individual

```javascript
async function processJob(job) {
  const { id, content, copies, order_number } = job;

  try {
    // 1. Marcar como "printing" (com lock otimista)
    const { data, error: updateError } = await supabase
      .from('print_jobs')
      .update({
        status: 'printing',
        device_id: deviceId,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('status', 'pending')  // Lock otimista
      .select()
      .single();

    // Se não retornou dados, outro bot já pegou
    if (!data) {
      console.log(`⚠️ Job ${id} já processado por outro bot`);
      return;
    }

    if (updateError) throw updateError;

    // 2. Imprimir cada cópia
    console.log(`🖨️ Imprimindo pedido #${order_number}...`);
    for (let i = 0; i < (copies || 1); i++) {
      await printHTML(content);
      console.log(`   ✓ Cópia ${i + 1}/${copies || 1}`);
    }

    // 3. Marcar como "printed"
    await supabase
      .from('print_jobs')
      .update({
        status: 'printed',
        printed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    console.log(`✅ Pedido #${order_number} impresso!`);

  } catch (error) {
    // 4. Marcar como "error"
    await supabase
      .from('print_jobs')
      .update({
        status: 'error',
        error_message: error.message,
        attempts: (job.attempts || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    console.error(`❌ Erro no pedido #${order_number}:`, error.message);
  }
}
```

### 4. Função de Impressão (Electron)

```javascript
const { BrowserWindow } = require('electron');

async function printHTML(htmlContent) {
  return new Promise((resolve, reject) => {
    const printWindow = new BrowserWindow({
      show: false,
      webPreferences: { 
        nodeIntegration: false,
        contextIsolation: true
      }
    });

    // Criar HTML completo com estilos para impressora térmica
    const fullHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          @page {
            size: 80mm auto;
            margin: 0;
          }
          body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            width: 80mm;
            margin: 0;
            padding: 5mm;
          }
        </style>
      </head>
      <body>${htmlContent}</body>
      </html>
    `;

    printWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(fullHTML)}`);

    printWindow.webContents.on('did-finish-load', () => {
      printWindow.webContents.print(
        {
          silent: true,
          printBackground: true,
          deviceName: selectedPrinter,
          margins: { marginType: 'none' }
        },
        (success, errorType) => {
          printWindow.close();
          if (success) {
            resolve();
          } else {
            reject(new Error(`Impressão falhou: ${errorType}`));
          }
        }
      );
    });

    printWindow.webContents.on('did-fail-load', (event, errorCode, errorDesc) => {
      printWindow.close();
      reject(new Error(`Falha ao carregar: ${errorDesc}`));
    });
  });
}
```

---

## Exemplo Completo do Bot

```javascript
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

// Configuração
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

class PrintBot {
  constructor() {
    this.deviceId = this.getOrCreateDeviceId();
    this.tenantId = null;
    this.status = 'online';
    this.printerName = null;
    this.heartbeatInterval = null;
    this.channel = null;
  }

  getOrCreateDeviceId() {
    const configPath = './print-bot-config.json';
    
    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      if (config.deviceId) return config.deviceId;
    } catch (e) {}
    
    const deviceId = uuidv4();
    fs.writeFileSync(configPath, JSON.stringify({ deviceId }, null, 2));
    return deviceId;
  }

  async login() {
    console.log('🔐 Fazendo login...');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });

    if (error) {
      console.error('❌ Erro no login:', error.message);
      throw error;
    }

    // Buscar tenant_id do perfil
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('tenant_id, full_name')
      .single();

    if (profileError) {
      console.error('❌ Erro ao buscar perfil:', profileError.message);
      throw profileError;
    }

    this.tenantId = profile.tenant_id;
    console.log('✅ Login bem-sucedido!');
    console.log('   Usuário:', profile.full_name);
    console.log('   Tenant:', this.tenantId);
    
    // Monitorar sessão
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        console.log('⚠️ Sessão expirada - reconectando...');
        this.reconnect();
      }
    });
    
    return data;
  }

  async reconnect() {
    try {
      await this.login();
      console.log('🔄 Reconectado com sucesso');
    } catch (error) {
      console.error('❌ Falha ao reconectar:', error.message);
      // Tentar novamente em 30 segundos
      setTimeout(() => this.reconnect(), 30000);
    }
  }

  async start(config) {
    console.log('🚀 Iniciando PrintBot...');
    console.log('   Device ID:', this.deviceId);
    
    this.printerName = config.printerName;
    
    // 1. Login
    await this.login();
    
    // 2. Enviar heartbeat inicial
    await this.sendHeartbeat();
    
    // 3. Iniciar heartbeat periódico (15s)
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
    }, 15000);

    // 4. Processar jobs pendentes
    await this.processPendingJobs();

    // 5. Escutar novos jobs via Realtime
    this.subscribeToJobs();

    console.log('');
    console.log('═══════════════════════════════════════');
    console.log('  🖨️  PrintBot ONLINE');
    console.log(`  📍  Impressora: ${this.printerName}`);
    console.log('  ⏳  Aguardando pedidos...');
    console.log('═══════════════════════════════════════');
    console.log('');
  }

  async sendHeartbeat() {
    try {
      const { error } = await supabase
        .from('bot_status')
        .upsert({
          device_id: this.deviceId,
          tenant_id: this.tenantId,
          company_name: 'PrintBot Local',
          last_seen: new Date().toISOString(),
          status: this.status,
          version: '1.0.0',
          printer_name: this.printerName,
          metadata: {
            platform: process.platform,
            arch: process.arch,
            nodeVersion: process.version
          }
        }, {
          onConflict: 'device_id'
        });

      if (error) throw error;
    } catch (err) {
      console.error('❌ Heartbeat error:', err.message);
    }
  }

  subscribeToJobs() {
    // RLS já filtra por tenant automaticamente
    this.channel = supabase
      .channel('print-jobs-listener')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'print_jobs'
        },
        async (payload) => {
          if (payload.new.status === 'pending') {
            console.log(`📥 Novo pedido #${payload.new.order_number}`);
            await this.processJob(payload.new);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('📡 Conectado ao Realtime');
        }
      });
  }

  async processPendingJobs() {
    // RLS já filtra por tenant automaticamente
    const { data: jobs, error } = await supabase
      .from('print_jobs')
      .select('*')
      .eq('status', 'pending')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ Erro ao buscar jobs:', error.message);
      return;
    }

    if (jobs?.length > 0) {
      console.log(`📋 Processando ${jobs.length} jobs pendentes...`);
      for (const job of jobs) {
        await this.processJob(job);
      }
    }
  }

  async processJob(job) {
    const { id, content, copies, order_number } = job;

    try {
      // Marcar como printing (com lock otimista)
      const { data, error: updateError } = await supabase
        .from('print_jobs')
        .update({
          status: 'printing',
          device_id: this.deviceId,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('status', 'pending')
        .select()
        .single();

      if (!data) {
        console.log(`⚠️ Job ${id} já processado`);
        return;
      }

      if (updateError) throw updateError;

      // Imprimir cada cópia
      console.log(`🖨️ Imprimindo pedido #${order_number}...`);
      for (let i = 0; i < (copies || 1); i++) {
        await this.print(content);
        console.log(`   ✓ Cópia ${i + 1}/${copies || 1}`);
      }

      // Marcar como printed
      await supabase
        .from('print_jobs')
        .update({
          status: 'printed',
          printed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      console.log(`✅ Pedido #${order_number} impresso!`);

    } catch (error) {
      await supabase
        .from('print_jobs')
        .update({
          status: 'error',
          error_message: error.message,
          attempts: (job.attempts || 0) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      console.error(`❌ Erro #${order_number}:`, error.message);
    }
  }

  async print(htmlContent) {
    // Implementar conforme sua stack (Electron, Node, etc.)
    // Ver seção "Função de Impressão (Electron)" acima
    console.log('   [Imprimindo...]');
    
    // Simular tempo de impressão
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  async setStatus(status) {
    this.status = status;
    await this.sendHeartbeat();
    console.log(`📊 Status alterado para: ${status}`);
  }

  async stop() {
    console.log('');
    console.log('👋 Encerrando PrintBot...');
    
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    if (this.channel) {
      supabase.removeChannel(this.channel);
    }

    await supabase
      .from('bot_status')
      .update({
        status: 'offline',
        last_seen: new Date().toISOString()
      })
      .eq('device_id', this.deviceId);

    await supabase.auth.signOut();

    console.log('✅ PrintBot encerrado');
  }
}

// ==================== USO ====================

const bot = new PrintBot();

// Iniciar
await bot.start({ printerName: 'EPSON TM-T20X' });

// Pausar impressão
// await bot.setStatus('paused');

// Retomar impressão
// await bot.setStatus('online');

// Parar bot
// await bot.stop();

// Capturar encerramento
process.on('SIGINT', async () => {
  await bot.stop();
  process.exit(0);
});
```

---

## Detecção de Status pelo Sistema Web

O sistema web considera o bot:

| Indicador | Condição |
|-----------|----------|
| 🟢 **Online** | `last_seen` < 60s E `status = 'online'` |
| 🟡 **Pausado** | `last_seen` < 60s E `status = 'paused'` |
| 🔴 **Erro** | `last_seen` < 60s E `status = 'error'` |
| ⚫ **Offline** | `last_seen` > 60s (qualquer status) |

---

## Troubleshooting

### Erro de Login

**Sintomas:** `Invalid login credentials` ou `Email not confirmed`

**Soluções:**
1. Verifique se o email e senha estão corretos
2. Confirme que o usuário tem role `admin` ou `owner`
3. Verifique se a conta está ativa e confirmada
4. Teste o login manualmente no sistema web

### Erro "permission denied" (RLS)

**Sintomas:** Erro ao acessar `print_jobs` ou `bot_status`

**Soluções:**
1. Confirme que fez login ANTES de acessar as tabelas
2. Verifique se o usuário tem `tenant_id` na tabela `profiles`
3. O usuário deve ter role `admin` ou `owner`
4. Verifique os logs do Supabase para detalhes do erro RLS

### Jobs não aparecem

**Sintomas:** Bot conectado mas não recebe novos pedidos

**Soluções:**
1. Verifique se o login está ativo (`supabase.auth.getSession()`)
2. Confirme que existem jobs com `status = 'pending'` no banco
3. Verifique se o Realtime está conectado (`SUBSCRIBED`)
4. Teste manualmente com uma query SELECT

### Bot não aparece como Online no sistema

**Sintomas:** Sistema mostra bot como offline mesmo rodando

**Soluções:**
1. Verifique se o heartbeat está sendo enviado (logs)
2. Confirme que o `tenant_id` está correto no heartbeat
3. Verifique se `device_id` é consistente entre reinícios
4. O intervalo de heartbeat deve ser < 60 segundos

### Impressão não funciona

**Sintomas:** Job marcado como `printing` mas não imprime

**Soluções:**
1. Verifique se a impressora está conectada e online
2. Teste impressão manualmente fora do bot
3. Verifique os logs de erro no campo `error_message`
4. Confirme que o nome da impressora está correto
5. Em Windows, verifique se o spooler está rodando

### Erro de conexão Realtime

**Sintomas:** `WebSocket connection failed`

**Soluções:**
1. Verifique a conexão de internet
2. Confirme que as URLs do Supabase estão corretas
3. Verifique se há firewall bloqueando WebSocket
4. Tente reconectar após alguns segundos

---

## Recursos Adicionais

- **Supabase JS Client:** https://supabase.com/docs/reference/javascript
- **Supabase Realtime:** https://supabase.com/docs/guides/realtime
- **Electron Printing:** https://www.electronjs.org/docs/latest/api/web-contents#contentsprintoptions-callback
