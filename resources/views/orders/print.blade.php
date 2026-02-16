<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pedido #{{ $order->order_number }}</title>
    <style>
        body {
            font-family: 'Courier New', Courier, monospace;
            font-size: 12px;
            max-width: 300px;
            margin: 0 auto;
            padding: 10px;
        }

        .header {
            text-align: center;
            border-bottom: 1px dashed #000;
            padding-bottom: 10px;
            margin-bottom: 10px;
        }

        .item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
        }

        .total {
            border-top: 1px dashed #000;
            padding-top: 10px;
            margin-top: 10px;
            font-weight: bold;
            text-align: right;
        }

        .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 10px;
        }

        @media print {
            .no-print {
                display: none;
            }
        }
    </style>
</head>

<body onload="window.print()">
    <div class="header">
        <strong>HAPPY PLACE</strong><br>
        Pedido #{{ $order->order_number }}<br>
        {{ $order->created_at->format('d/m/Y H:i') }}<br>
        <strong>{{ strtoupper($order->mode === 'delivery' ? 'Entrega' : ($order->mode === 'pickup' ? 'Retirada' : 'Mesa')) }}</strong>
    </div>

    <div>
        <strong>Cliente:</strong> {{ $order->customer_name }}<br>
        @if($order->customer_phone)
            <strong>Tel:</strong> {{ $order->customer_phone }}<br>
        @endif
        @if($order->mode === 'delivery' && $order->address)
            <strong>Endereço:</strong><br>
            {{ $order->address['street'] }}, {{ $order->address['number'] }}<br>
            {{ $order->address['neighborhood'] }}
            @if(isset($order->address['complement']))
                - {{ $order->address['complement'] }}
            @endif
            <br>
        @endif
    </div>

    <div style="margin-top: 15px; border-bottom: 1px dashed #000;"></div>

    <div style="margin-top: 10px;">
        @foreach($order->items as $item)
            <div class="item">
                <span>{{ $item->quantity }}x {{ $item->product ? $item->product->name : $item->product_name }}</span>
                <span>R$ {{ number_format($item->subtotal, 2, ',', '.') }}</span>
            </div>
            @if($item->complements && $item->complements->count() > 0)
                <div style="margin-left: 15px; font-size: 10px; margin-bottom: 5px;">
                    @foreach($item->complements as $complement)
                        + {{ $complement->quantity > 1 ? $complement->quantity . 'x ' : '' }}{{ $complement->name }}<br>
                    @endforeach
                </div>
            @endif
        @endforeach
    </div>

    <div class="total">
        Subtotal: R$ {{ number_format($order->subtotal, 2, ',', '.') }}<br>
        @if($order->delivery_fee > 0)
            Taxa Entrega: R$ {{ number_format($order->delivery_fee, 2, ',', '.') }}<br>
        @endif
        TOTAL: R$ {{ number_format($order->total, 2, ',', '.') }}
    </div>

    <div style="margin-top: 10px;">
        <strong>Pagamento:</strong> {{ $order->payment_method ?? 'Não informado' }}<br>
        Status: {{ $order->payment_status === 'paid' ? 'PAGO' : 'PENDENTE' }}
    </div>

    <div class="footer">
        Obrigado pela preferência!
    </div>

    <button class="no-print" onclick="window.print()"
        style="width: 100%; padding: 10px; margin-top: 20px;">Imprimir</button>
</body>

</html>