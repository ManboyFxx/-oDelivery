<x-mail::message>
    # Psst... Você esqueceu algo incrível! 👀

    Olá!

    Notamos que você estava quase finalizando a assinatura do plano **{{ $planName }}**, mas acabou não concluindo.

    Entendemos que imprevistos acontecem. Por isso, guardamos seu carrinho com carinho!

    Para te dar aquele empurrãozinho final, liberamos um **Cupom de 10% DE DESCONTO** exclusivo para você:

    <x-mail::panel>
        CUPOM: **{{ $couponCode }}**
    </x-mail::panel>

    Com o plano **{{ $planName }}**, você terá acesso a recurso que vão transformar seu delivery. Não deixe essa
    oportunidade passar!

    <x-mail::button :url="$recoveryUrl" color="primary">
        Finalizar Assinatura com Desconto
    </x-mail::button>

    Esta oferta expira em breve.

    Atenciosamente,<br>
    {{ config('app.name') }}
</x-mail::message>