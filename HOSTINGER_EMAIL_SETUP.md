# Configuração de Email na Hostinger

Quando você enviar o projeto para a Hostinger, você **não** deve usar `MAIL_MAILER=log`. Você deve configurar o SMTP real da Hostinger para que os emails sejam enviados de verdade.

## 1. Criar Conta de Email na Hostinger
1.  Acesse seu painel da Hostinger (hPanel).
2.  Vá em **Emails** -> **Contas de Email**.
3.  Clique em **Criar nova conta de email**.
4.  Crie um email como `nao-responda@oodelivery.online` ou `suporte@oodelivery.online`.
5.  Defina uma senha segura e **guarde-a**.

## 2. Configurar o `.env` (Produção)
No seu arquivo `.env` que está lá na hospedagem (Hostinger), altere as linhas de email para ficar assim:

```ini
MAIL_MAILER=smtp
MAIL_HOST=smtp.hostinger.com
MAIL_PORT=465
MAIL_USERNAME=seu-email-criado@oodelivery.online
MAIL_PASSWORD=sua-senha-do-email
MAIL_ENCRYPTION=ssl
MAIL_FROM_ADDRESS=seu-email-criado@oodelivery.online
MAIL_FROM_NAME="${APP_NAME}"
```

> **Atenção:**
> -   `MAIL_PORT` deve ser `465` (com `ssl`) ou `587` (com `tls`). A Hostinger recomenda `465` + `ssl`.
> -   `MAIL_USERNAME` e `MAIL_FROM_ADDRESS` devem ser **o mesmo email** que você criou. A Hostinger bloqueia envios se o remetente for diferente do usuário autenticado.

## 3. Testar
Após salvar o `.env` na Hostinger:
1.  Limpe o cache: `php artisan config:clear` (via terminal ou rota de deploy).
2.  Tente recuperar a senha pelo site.
3.  Verifique se o email chegou na caixa de entrada (ou spam).
