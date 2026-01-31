# 🚀 Guia de Deploy - ÓoDelivery para Hostinger

Este guia detalha o processo de deploy da aplicação ÓoDelivery para o servidor Hostinger.

## 📋 Pré-requisitos

- Conta ativa no Hostinger
- Acesso ao painel de controle (cPanel)
- Banco de dados MySQL criado
- Email SMTP configurado no Hostinger

## ⚙️ Preparação Local

### 1. Gerar o pacote de deploy

Execute o comando para criar o arquivo `deploy.zip`:

```bash
npm run deploy
```

Isso executará o script `build_for_hosting.js` que:
- Faz build do frontend (Vite)
- Compacta todos os arquivos necessários
- Cria `deploy.zip` pronto para upload

**Tamanho esperado:** ~50-150 MB (dependendo dos assets)

## 📤 Upload para Hostinger

### 1. Via FTP/SFTP

1. **Conecte ao servidor Hostinger via FTP:**
   - Host: `seu-site.com` ou IP do servidor
   - Usuário: `usuario_ftp`
   - Senha: (fornecida pelo Hostinger)
   - Porta: 21 (FTP) ou 22 (SFTP)

2. **Navegue para a pasta `public_html`**

3. **Upload do arquivo `deploy.zip`:**
   - Envie `deploy.zip` para `public_html/`
   - Aguarde a conclusão do upload (pode levar alguns minutos)

### 2. Via Gerenciador de Arquivos (cPanel)

1. Acesse o cPanel do Hostinger
2. Abra o **Gerenciador de Arquivos**
3. Navegue para **public_html**
4. Clique em **Upload** e selecione `deploy.zip`

## 🔧 Executar o Deploy

### 1. Acessar o script de descompactação

Abra seu navegador e acesse:

```
https://seu-dominio.com/unzip_deploy.php
```

**O que acontece:**
- ✅ Descompacta os arquivos
- ✅ Copia `.env.production` para `.env`
- ✅ Executa migrations do banco de dados
- ✅ Limpa caches Laravel
- ✅ Remove o arquivo ZIP e o script de deploy

**Tempo esperado:** 2-5 minutos

**Observação:** O script se auto-destrói após executar com sucesso.

## 🗄️ Configurar Banco de Dados

### ⚠️ IMPORTANTE: Configurar Credenciais ANTES do Deploy

Antes de acessar `/unzip_deploy.php`, você **DEVE** editar o arquivo `.env` com as credenciais do Hostinger:

1. **Via Gerenciador de Arquivos do cPanel:**
   - Navegue para `public_html/`
   - Clique com botão direito em `.env` → Editar

2. **Configure as credenciais:**

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=seu_banco_de_dados
DB_USERNAME=seu_usuario_mysql
DB_PASSWORD=sua_senha_mysql
```

(Obtenha essas informações no painel MySQL do Hostinger)

### 1. Restaurar dados iniciais (Automático)

O script `unzip_deploy.php` agora:
- ✅ Executa as migrations (cria tabelas)
- ✅ Importa os dados do `database/hostinger_data.sql` automaticamente
- ✅ Limpa caches

Se houver problemas, use o script auxiliar:

```
https://seu-dominio.com/setup_database.php
```

Este script:
- Verifica conexão com o banco
- Importa dados com tratamento de erros
- Fornece feedback detalhado

### 2. Alternativa: phpMyAdmin Manual

Se preferir importar manualmente:

1. Acesse **phpMyAdmin** no cPanel
2. Selecione seu banco de dados
3. Vá para **Importar**
4. Selecione `database/hostinger_data.sql`
5. Clique em **Executar**

(Ignore erros sobre tabelas não existentes - as migrations criam automaticamente)

## 📧 Configurar Email

1. **Obtenha as credenciais SMTP:**
   - Acesse cPanel → Email Accounts
   - Crie uma conta de email para seu domínio
   - Anote: Username (email completo) e Senha

2. **Atualize o `.env`:**

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.hostinger.com
MAIL_PORT=465
MAIL_USERNAME=seu_email@seu-dominio.com
MAIL_PASSWORD=sua_senha_aqui
MAIL_ENCRYPTION=ssl
MAIL_FROM_ADDRESS="seu_email@seu-dominio.com"
```

3. **Limpe o cache:**

```
https://seu-dominio.com/clear_cache.php
```

## ✅ Verificar Instalação

Acesse seu domínio:

```
https://seu-dominio.com
```

Você deve ver a página inicial da aplicação.

### Se houver problemas:

1. **Acessar logs de erro:**
   ```
   storage/logs/laravel.log
   ```

2. **Limpar caches:**
   - Acesse `https://seu-dominio.com/clear_cache.php`
   - Ou execute via SSH (se disponível):
     ```bash
     php artisan cache:clear
     php artisan config:clear
     ```

3. **Verificar permissões:**
   - `storage/` deve ter permissão 755
   - `bootstrap/cache/` deve ter permissão 755

## 🔐 Segurança

### ⚠️ Importante!

- Remova os scripts de deployment após uso:
  - `unzip_deploy.php` (auto-removido)
  - `clear_cache.php` (remova manualmente se não usar)

- **Nunca** deixe `.env` com senhas em repositórios públicos

- Desabilite o `APP_DEBUG=false` em produção ✅ (já está assim)

## 🔄 Atualizações Futuras

Para atualizar a aplicação:

1. Gere novo `deploy.zip` localmente
2. Upload via FTP
3. Acesse `unzip_deploy.php` (novo upload)

## 🛠️ Troubleshooting

### Erro: "Artisan not found"
- Verifique se `vendor/` foi descompactado corretamente

### Erro: "SQLSTATE[HY000]"
- Verifique as credenciais do banco em `.env`

### Erro: "Permission denied"
- Configure permissões das pastas:
  ```bash
  chmod 755 storage
  chmod 755 bootstrap/cache
  ```

### Site fica em branco
- Acesse `/clear_cache.php`
- Verifique `storage/logs/laravel.log`

## 📞 Suporte

Para mais informações:
- Email: [seu email]
- Documentação: [seu site]

---

**Versão:** 1.0
**Data:** Janeiro 2026
   - `vendor/` (Pasta gigante, não envie)
   - `.env` (Você configurará um novo lá)
   - `.git/` (Se existir)

2. A estrutura na Hostinger deve ficar assim:
   ```
   /public_html
       / (conteúdo da pasta public do laravel)
   /laravel-project (crie essa pasta fora do public_html se possível, por segurança)
       /app
       /bootstrap
       /config
       ...
   ```
   *Dica avançada: O jeito mais seguro é colocar o projeto numa pasta `oodelivery` no mesmo nível da `public_html`, e mover o conteúdo de `public` para dentro de `public_html`, ajustando o `index.php` para apontar para a pasta correta.*

### C. Configuração (.env)
**Já preparei o arquivo para você!**

1. Na pasta do seu projeto, localize o arquivo `.env.production`.
2. Envie ele para a Hostinger.
3. Lá, renomeie ele para `.env`.
   - *Ele já está com o banco u525023092_oodelivery e a senha Big2020+ configurados.*

### D. Instalação e Banco de Dados (Método Sem SSH - Fácil)
Como você provavelmente não tem acesso SSH fácil, criei uma **Rota Secreta** para configurar seu banco:

1. Visite no seu navegador: `https://oodelivery.online/setup-production-db`
   - Você deve ver uma mensagem: *"Sucesso! Tabelas criadas..."*
   - *Isso cria toda a estrutura do banco (tabelas) vazia.*

2. **AGORA** popule os dados (Produtos/Categorias):
   - Acesse o **PHPMyAdmin** da Hostinger.
   - Abra o banco `u525023092_oodelivery`.
   - Vá na aba **Importar**.
   - Selecione o arquivo: `database/hostinger_data.sql`
   - Clique em Executar.
   - *Isso vai apagar a tabela de histórico de migrations (vazia) e inserir seus dados reais e o histórico correto.*

3. (Opcional) Segurança:
   - Edite o arquivo `routes/web.php` na Hostinger e remova ou comente essa rota `/setup-production-db` após o uso.

### E. Frontend (Vite/React)
Como a Hostinger (hospedagem compartilhada) não roda Node.js para servir arquivos estáticos o tempo todo:
1. **Na sua máquina local (Windows):**
   Rode: `npm run build`
2. Isso vai criar/atualizar a pasta `public/build`.
3. Certifique-se de enviar a pasta `public/build` para a Hostinger dentro de `public_html`.

---

## Checklist Final
- [ ] `.env` configurado com credenciais do MySQL da Hostinger.
- [ ] `php artisan migrate` rodado com sucesso (criou as tabelas).
- [ ] Pasta `public/build` enviada (contém o frontend React compilado).
- [ ] Permissões de escrita nas pastas `storage` e `bootstrap/cache` (775 ou 777).

Se precisar de ajuda específica com o painel deles, podemos exportar os dados locais para JSON se for crítico.
