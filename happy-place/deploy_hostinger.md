# Guia de Deploy na Hostinger (Laravel + Inertia/React)

Este guia cobre o processo de publicação do **ÓoDelivery** na Hostinger.

## 1. Banco de Dados (Estratégia Recomendada)

Embora seu ambiente local use **SQLite**, para produção na Hostinger recomendamos usar **MySQL** ou **MariaDB** pela performance e robustez.

**Não tente importar o arquivo `database.sqlite` no MySQL.** Eles são incompatíveis.

### Como levar sua estrutura (Tabelas):
O Laravel gerencia isso via **Migrations**. Você não precisa exportar um `.sql` da sua máquina. Você vai rodar um comando na Hostinger que cria as tabelas lá.

### Como levar seus dados (Produtos/Cardápio):
Se você já cadastrou dados reais que precisa manter:
1. A melhor forma é usar um pacote como `iseed` para gerar seeders dos seus dados atuais.
2. Ou recadastrar na produção para garantir um ambiente limpo.

---

## 2. Passo a Passo do Deploy

### A. Preparação na Hostinger
1. Acesse o **hPanel**.
2. Vá em **Bancos de Dados MySQL** e crie um novo banco (anote Nome, Usuário e Senha).
3. Vá em **Gerenciador de Arquivos** ou use FTP (FileZilla).

### B. Upload dos Arquivos
1. Faça upload de **todos** os arquivos da pasta do projeto, **EXCETO**:
   - `node_modules/` (Pasta gigante, não envie)
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
