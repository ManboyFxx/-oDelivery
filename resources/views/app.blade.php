<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title inertia>{{ config('app.name', 'ÓoDelivery') }}</title>
    <meta name="description"
        content="Sua própria plataforma de delivery. Tudo o que você precisa para lucrar mais sem pagar taxas por pedido.">
    <link rel="icon" type="image/png" href="/images/logo-main.png">

    <!-- Social Media Previews (Default) -->
    <meta property="og:type" content="website">
    <meta property="og:title" content="ÓoDelivery | Sua própria plataforma de delivery.">
    <meta property="og:description"
        content="Tenha controle total do seu delivery com PDV, WhatsApp Automático, Gestão de Motoboys e muito mais.">
    <meta property="og:image" content="{{ asset('images/logo-main.png') }}">

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700,900&display=swap" rel="stylesheet" />

    <!-- Scripts -->
    @routes
    @viteReactRefresh
    @vite(['resources/js/app.tsx', "resources/js/Pages/{$page['component']}.tsx"])
    @inertiaHead
    <!-- Theme Script -->
    <script>
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
    }
    </script>

    <!-- OneSignal SDK -->
    <script src="https://cdn.onesignal.com/sdks/web/v16/OneSignal.js" async=""></script>
    <script>
        window.OneSignal = window.OneSignal || [];
        OneSignal.push(function () {
            OneSignal.init({
                appId: "{{ config('services.onesignal.app_id') }}",
                safari_web_id: "{{ config('services.onesignal.safari_web_id') }}",
                notifyButton: {
                    enable: true,
                },
            });
    });
    </script>
</head>

<body class="font-sans antialiased">
    @inertia
</body>

</html>