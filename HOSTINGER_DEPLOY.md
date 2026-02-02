# Guia de Deploy - Hostinger via Git (ÓoDelivery)

Este documento detalha como configurar a implantação automática via Git na Hostinger.

> [!IMPORTANT]
> **Segurança:** Nunca suba o arquivo `.env` para o Git. Crie um novo no servidor.

## 1. Preparação do Repositório (Local)

Para que o site funcione na Hostinger (que normalmente não roda `npm run build` automaticamente em planos compartilhados), precisamos commitar os assets compilados.

### 1.1. Build de Produção
Gere os arquivos estáticos otimizados:
```bash
npm run build
```
*Observação:* Verifique se a pasta `public/build` foi gerada. O arquivo `.gitignore` atual permite o envio desta pasta, o que é **ideal** para este cenário.

### 1.2. Commit
Adicione todos os arquivos, incluindo o build recente, e envie para o GitHub/GitLab:
```bash
git add .
git commit -m "Deploy: Production build assets"
git push origin main
```

## 2. Configuração no Painel Hostinger

1. Acesse o **hPanel** da Hostinger.
2. Vá em **Avançado > Git**.
3. **Repositório:** Insira a URL do seu repositório (ex: `https://github.com/usuario/projeto.git`).
4. **Branch:** `main` (ou a branch que você usou).
5. **Diretório:** Deixe em branco para instalar na raiz, ou coloque `public_html` (recomendado verificar se a pasta está vazia antes).
6. **Webhook:** Copie a URL de Webhook fornecida pela Hostinger e adicione nas configurações do seu repositório (GitHub > Settings > Webhooks) para deploy automático ao fazer push.

## 3. Configuração do Ambiente (Servidor)

Como o Git não sobe o `.env` nem a pasta `vendor`, precisamos configurá-los manualmente uma única vez.

### 3.1. Arquivo `.env`
No Gerenciador de Arquivos da Hostinger, crie o arquivo `.env` na raiz do projeto com os dados de produção:

```ini
APP_NAME="ÓoDelivery"
APP_ENV=production
APP_KEY=base64:...  # Copie do seu .env local ou gere um novo
APP_DEBUG=false
APP_URL=https://oodelivery.online

LOG_CHANNEL=daily

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=u525023092_oodelivery
DB_USERNAME=u525023092_oodelivery
DB_PASSWORD=SuaSenhaForteAqui

CACHE_DRIVER=file
CACHE_STORE=file
SESSION_DRIVER=file
QUEUE_CONNECTION=database
FILESYSTEM_DISK=public_html # Ajuste para usar o link simbólico correto se necessário
```

### 3.2. Instalação de Dependências (Composer)
Acesse o terminal SSH da Hostinger (ou use a opção "Deploy" no menu Git que às vezes roda composer, mas o SSH é mais garantido).

**Via SSH:**
```bash
cd domains/oodelivery.online/public_html
composer install --optimize-autoloader --no-dev
```

### 3.3. Configuração de Diretório (Importante!)
O Laravel serve os arquivos a partir da pasta `public`.
No hPanel, vá em **Site > Configuração do Site** (ou Pastas) e altere o **Document Root** de `public_html` para `public_html/public`.

*Se não tiver essa opção:* Crie um arquivo `.htaccess` na raiz `public_html` com:
```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteRule ^(.*)$ public/$1 [L]
</IfModule>
```

### 3.4. Finalização
Rode os comandos finais via SSH:
```bash
php artisan migrate --force
php artisan storage:link
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## Checklist de Deploy (Git)

- [ ] Arquivos `public/build` estão no repositório?
- [ ] Arquivo `.env` criado na Hostinger?
- [ ] Dependências PHP instaladas (`composer install`)?
- [ ] Document Root apontando para `/public`?
- [ ] Banco de dados migrado (`php artisan migrate`)?
- [ ] **E-mails de Recuperação de Senha chegam?** (SMTP)
    - *Teste:* Acesse `/forgot-password`, digite seu e-mail e verifique se chega.
    - *Se falhar:* Verifique `MAIL_USERNAME`, `MAIL_PASSWORD` e `MAIL_FROM_ADDRESS` no `.env`.

