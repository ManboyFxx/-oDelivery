# 🚀 Deploy via GitHub na Hostinger

Este guia explica como fazer deploy do OoDelivery na Hostinger usando GitHub.

---

## ✅ Pré-requisitos

1. **Repositório GitHub** com o código do projeto
2. **Conta na Hostinger** com plano de hospedagem
3. **Acesso SSH** na Hostinger (habilitado no painel)

---

## 📦 Passo 1: Preparar o Repositório

### Arquivos que NÃO vão para o GitHub (já estão no .gitignore):
```
.env
vendor/
node_modules/
storage/logs/*
storage/framework/cache/*
public/storage (symlink)
```

### O que fazer ANTES de subir:
```bash
# 1. Build do frontend
npm run build

# 2. Limpar caches
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear

# 3. Gerar APP_KEY (se for primeira vez)
php artisan key:generate
```

---

## 🔗 Passo 2: Conectar GitHub na Hostinger

### No Painel da Hostinger:

1. Acesse **Hospedagem** → **Site** → **Git**
2. Clique em **Conectar Repositório**
3. Selecione seu repositório: `seu-usuario/oDelivery`
4. Branch: `main` (ou `master`)
5. Diretório de publicação: `public_html`
6. **Habilite Auto Deploy** (opcional - atualiza automaticamente ao fazer push)

### Ou via SSH (recomendado):

```bash
# Acesse via SSH na Hostinger
ssh u0000000000@ftp.oodelivery.online

# Vá para public_html
cd public_html

# Clone o repositório
git clone https://github.com/seu-usuario/oDelivery.git .

# Ou se já tiver clonado, faça pull
git pull origin main
```

---

## ⚙️ Passo 3: Configurar Ambiente na Hostinger

### 3.1. Criar arquivo .env

```bash
# Na Hostinger via SSH ou File Manager
cd public_html
cp .env.example .env
```

Edite o `.env` com os dados da Hostinger:

```env
APP_NAME=OoDelivery
APP_ENV=production
APP_KEY=base64:... (gerar com php artisan key:generate)
APP_DEBUG=false
APP_URL=https://oodelivery.online

# Banco de dados (pegue no painel da Hostinger)
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=u0000000000_oodelivery
DB_USERNAME=u0000000000_seu_usuario
DB_PASSWORD=sua_senha

# Filesystem
FILESYSTEM_DISK=local

# WhatsApp
EVOLUTION_API_URL=http://104.243.41.159:8080
EVOLUTION_API_KEY=B8D694DAd849499896E2B9610C83119F

# Stripe (se usar)
STRIPE_KEY=
STRIPE_SECRET=

# E-mail (SMTP Hostinger)
MAIL_MAILER=smtp
MAIL_HOST=smtp.hostinger.com
MAIL_PORT=465
MAIL_USERNAME=seu_email@oodelivery.online
MAIL_PASSWORD=sua_senha
MAIL_ENCRYPTION=ssl
```

### 3.2. Instalar dependências

```bash
# Na Hostinger via SSH
cd public_html

# Composer (PHP)
composer install --optimize-autorouter --no-dev

# Node (se precisar rebuild)
npm install
npm run build
```

### 3.3. Rodar migrations

```bash
php artisan migrate --force
```

### 3.4. Criar symlink das imagens ⚠️ IMPORTANTE

```bash
php artisan storage:link
```

Isso conecta `public/storage` → `storage/app/public` para as imagens dos produtos funcionarem.

### 3.5. Gerar chave da aplicação

```bash
php artisan key:generate
```

---

## 🖼️ Passo 4: Validar Banco de Imagens

Após o deploy, teste:

1. Acesse: `https://oodelivery.online/media`
2. Faça upload de uma imagem de teste
3. Edite um produto e selecione a imagem
4. Verifique se aparece no card do produto

**Se a imagem não aparecer:**

```bash
# Verifique o symlink
ls -la public/storage

# Se não existir, recrie:
php artisan storage:link

# Verifique permissões
chmod -R 0755 storage/app/public
```

---

## 🔄 Atualizar o Sistema (Deploy Contínuo)

### Opção 1: Auto Deploy (se habilitado)
- Sempre que fizer `git push`, a Hostinger atualiza automaticamente

### Opção 2: Manual via SSH
```bash
cd public_html
git pull origin main
composer install --optimize-autorouter --no-dev
npm run build
php artisan migrate --force
php artisan config:clear
php artisan cache:clear
```

### Opção 3: Painel da Hostinger
- Vá em **Git** → Clique em **Atualizar**

---

## 📋 Checklist Pós-Deploy

- [ ] `.env` configurado com dados do banco
- [ ] `composer install` executado
- [ ] `npm run build` executado
- [ ] Migrations rodadas (`php artisan migrate --force`)
- [ ] Symlink criado (`php artisan storage:link`)
- [ ] `APP_KEY` gerado
- [ ] Teste upload de imagem em `/media`
- [ ] Teste exibição de imagem em produtos
- [ ] Teste fluxo completo de pedido

---

## 🐛 Problemas Comuns

### Imagens não aparecem
```bash
# Verifique symlink
ls -la public/storage

# Recrie se necessário
rm public/storage
php artisan storage:link

# Verifique permissões
chmod -R 0755 storage/app/public
```

### Erro 500 após deploy
```bash
# Limpe caches
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# Verifique logs
tail -f storage/logs/laravel.log
```

### Erro de banco de dados
```bash
# Verifique .env
cat .env | grep DB_

# Teste conexão
php artisan tinker
>>> DB::connection()->getPdo();
```

---

## 📞 Suporte

Em caso de dúvidas:
1. Verifique os logs: `storage/logs/laravel.log`
2. Teste via SSH: `php artisan diagnose:hostinger`
3. Acesse o painel de suporte da Hostinger

---

**✅ Pronto!** Seu sistema está rodando na Hostinger com deploy via GitHub!
