<x-mail::message>
    # Tivemos um problema com seu pagamento 😕

    Olá!

    Identificamos uma falha ao processar o pagamento da sua assinatura do plano **{{ $planName }}**.

    **Motivo:** O banco emissor do cartão recusou a transação.

    <x-mail::panel>
        Tentativa: #{{ $attemptNumber }} de 3<br>
        Próxima tentativa em: {{ $nextAttemptDate }}
    </x-mail::panel>

    Não se preocupe, seus dados estão seguros. Isso geralmente acontece por bloqueio de segurança do banco ou limite
    insuficiente.

    Para evitar a suspensão do serviço, por favor, verifique seu cartão ou atualize sua forma de pagamento:

    <x-mail::button :url="$updatePaymentUrl" color="error">
        Atualizar Pagamento
    </x-mail::button>

    Se precisar de ajuda, entre em contato com nosso suporte.

    Atenciosamente,<br>
    {{ config('app.name') }}
</x-mail::message>