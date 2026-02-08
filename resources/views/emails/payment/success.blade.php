<x-mail::message>
    # Pagamento Confirmado! 🚀

    Olá!

    Temos uma ótima notícia: o pagamento da sua assinatura do plano **{{ $planName }}** foi confirmado com sucesso.

    <x-mail::panel>
        Valor: **R$ {{ number_format($amount, 2, ',', '.') }}**<br>
        Data: {{ $date }}
    </x-mail::panel>

    Agora você tem acesso total a todos os recursos exclusivos do seu plano. Aproveite para impulsionar suas vendas!

    <x-mail::button :url="config('app.url') . '/dashboard'">
        Acessar Painel
    </x-mail::button>

    Se precisar da nota fiscal ou recibo, você pode baixar clicando abaixo:

    <x-mail::button :url="$invoiceUrl" color="success">
        Baixar Recibo
    </x-mail::button>

    Obrigado por confiar no **{{ config('app.name') }}**!

    Atenciosamente,<br>
    {{ config('app.name') }}
</x-mail::message>