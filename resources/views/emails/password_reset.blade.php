<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recuperação de Senha - ÓoDelivery</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Arial', sans-serif;
            background-color: #f3f4f6;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .header {
            background-color: #000000;
            padding: 30px;
            text-align: center;
        }

        .logo {
            height: 40px;
            width: auto;
        }

        .content {
            padding: 40px;
            color: #374151;
        }

        .h1 {
            font-size: 24px;
            font-weight: 800;
            color: #111827;
            margin-bottom: 16px;
            margin-top: 0;
        }

        .p {
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 24px;
        }

        .button-container {
            text-align: center;
            margin: 32px 0;
        }

        .button {
            background-color: #ff3d03;
            color: #ffffff;
            padding: 14px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            font-size: 16px;
            display: inline-block;
            box-shadow: 0 4px 14px 0 rgba(255, 61, 3, 0.39);
        }

        .button:hover {
            background-color: #e63700;
        }

        .footer {
            background-color: #f9fafb;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
        }

        .help-link {
            color: #ff3d03;
            text-decoration: none;
            word-break: break-all;
        }
    </style>
</head>

<body>
    <div style="padding: 40px 0;">
        <div class="container">
            <!-- Header Black -->
            <div class="header">
                <!-- Using the hosted logo or public path if configured. For now assuming typical direct link functionality or CID via message is not used, plain img src -->
                <img src="{{ asset('/images/logo-hq.png') }}" alt="ÓoDelivery" class="logo" style="max-height: 50px;">
                <div style="color: white; font-weight: bold; font-size: 20px; margin-top: 10px;">ÓoDelivery<span
                        style="color: #ff3d03;">.</span></div>
            </div>

            <!-- Body -->
            <div class="content">
                <h1 class="h1">Recuperação de Senha</h1>

                <p class="p">Olá, <strong>{{ $user->name }}</strong>!</p>

                <p class="p">Recebemos uma solicitação para redefinir a senha da sua conta no
                    <strong>ÓoDelivery</strong>. Se você não fez essa solicitação, pode ignorar este email com
                    segurança.</p>

                <div class="button-container">
                    <a href="{{ $url }}" class="button">Redefinir Minha Senha</a>
                </div>

                <p class="p">Este link expirará em 60 minutos por motivos de segurança.</p>

                <p
                    style="font-size: 14px; color: #6b7280; margin-top: 40px; padding-top: 20px; border-top: 1px solid #f3f4f6;">
                    Se o botão acima não funcionar, copie e cole o seguinte link no seu navegador:<br>
                    <a href="{{ $url }}" class="help-link">{{ $url }}</a>
                </p>
            </div>

            <!-- Footer -->
            <div class="footer">
                &copy; {{ date('Y') }} ÓoDelivery - Todos os direitos reservados.<br>
            </div>
        </div>
    </div>
</body>

</html>