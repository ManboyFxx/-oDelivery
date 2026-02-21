# ✅ Projeto Pronto para Deploy na Hostinger via GitHub

## 📦 O que foi feito:

### 1. Build do Frontend ✅
- `npm run build` executado com sucesso
- Arquivos otimizados em `public/build/`
- Tamanho total: ~1.5MB (gzipped)

### 2. Caches do Laravel ✅
- Config cache cleared
- Route cache cleared
- View cache cleared
- Application cache cleared

### 3. Arquivos Criados ✅
- `.env` configurado (valores de exemplo)
- `DEPLOY_GITHUB_HOSTINGER.md` - Guia completo de deploy
- `prepare_deploy.ps1` - Script de build automático
- `.git/hooks/pre-commit` - Hook para build automático

### 4. .gitignore Atualizado ✅
- `.env` ignorado (nunca commit senhas!)
- `vendor/` ignorado
- `node_modules/` ignorado
- `storage/` logs e caches ignorados
- `public/storage` (symlink) ignorado

---

## 🚀 Como Fazer Deploy (Passo a Passo)

### No seu computador:

```bash
# 1. Execute o script de prepare (já rodamos!)
.\prepare_deploy.ps1

# 2. Faça commit e push
git add .
git commit -m "Build: prepara para deploy na Hostinger"
git push origin main
```

### Na Hostinger (via SSH):

```bash
# 1. Acesse via SSH
ssh u0000000000@ftp.oodelivery.online

# 2. Vá para public_html
cd public_html

# 3. Clone o repositório (primeira vez)
git clone https://github.com/seu-usuario/oDelivery.git .

# Ou faça pull (atualizações)
git pull origin main

# 4. Instale dependências
composer install --optimize-autorouter --no-dev

# 5. Configure .env
cp .env.example .env
# Edite .env com dados do banco da Hostinger

# 6. Gere APP_KEY
php artisan key:generate

# 7. Rode migrations
php artisan migrate --force

# 8. CRIE O SYMLINK (IMPORTANTE PARA IMAGENS!)
php artisan storage:link

# 9. Limpe caches
php artisan config:clear
php artisan cache:clear
```

---

## 🖼️ Validação do Banco de Imagens

Após o deploy, teste:

1. **Upload de imagem:**
   - Acesse `/media`
   - Faça upload de uma imagem de teste

2. **Produto com imagem:**
   - Edite um produto
   - Selecione imagem do banco
   - Salve

3. **Verificação:**
   - Veja se imagem aparece no card do produto
   - Veja se imagem aparece no menu público

**Se não aparecer:**
```bash
# Verifique symlink
ls -la public/storage

# Se não existir:
php artisan storage:link

# Verifique permissões:
chmod -R 0755 storage/app/public
```

---

## 🔄 Atualizações Futuras

### Automático (se habilitar Auto Deploy):
1. Faça push no GitHub
2. Hostinger atualiza automaticamente

### Manual (via SSH):
```bash
cd public_html
git pull origin main
composer install --optimize-autorouter --no-dev
php artisan migrate --force
php artisan config:clear
php artisan cache:clear
```

---

## ⚠️ IMPORTANTE

### Nunca faça:
- ❌ Commit do `.env` (contém senhas)
- ❌ Commit de `vendor/` ou `node_modules/`
- ❌ Esqueça de rodar `npm run build`

### Sempre faça:
- ✅ Build antes do push: `npm run build`
- ✅ Symlink após deploy: `php artisan storage:link`
- ✅ Migrations: `php artisan migrate --force`
- ✅ Limpe caches: `php artisan cache:clear`

---

## 📋 Checklist Deploy

- [ ] Build do frontend rodou
- [ ] Caches do Laravel limpos
- [ ] Push no GitHub feito
- [ ] SSH na Hostinger acessado
- [ ] `composer install` executado
- [ ] `.env` configurado
- [ ] `php artisan key:generate` rodado
- [ ] Migrations executadas
- [ ] **`php artisan storage:link` executado** ⚠️
- [ ] Imagens testadas em `/media`
- [ ] Produto com imagem testado

---

## 🎉 Tudo Pronto!

Seu projeto está configurado e pronto para deploy via GitHub na Hostinger!

**Próximo passo:** Fazer o push e rodar os comandos na Hostinger.
