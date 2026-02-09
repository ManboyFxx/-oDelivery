import { DBOrder, CouponConfig } from '../types';

export function generateOrderHtml(order: DBOrder, config: CouponConfig, tenantDetails?: any): string {
    const {
        headerText = 'ÓODELIVERY',
        footerText = 'Obrigado pela preferência!',
        showLogo = true,
        fontSize = 'medium',
        showCustomerPhone = true,
        showObservations = true
    } = config;

    // Estilos baseados no tamanho da fonte
    const fontSizes = {
        small: '10px',
        medium: '12px',
        large: '14px'
    };
    const currentFontSize = fontSizes[fontSize as keyof typeof fontSizes] || '12px';

    // Formatadores
    const formatCurrency = (val: number) => `R$ ${Number(val).toFixed(2).replace('.', ',')}`;
    const formatDate = (dateStr: string) => new Date(dateStr).toLocaleString('pt-BR');

    // Dados da loja
    const storeName = tenantDetails?.name || headerText;
    const logoUrl = tenantDetails?.logoUrl;

    // Itens HTML
    const itemsHtml = order.items?.map(item => {
        let complementsHtml = '';
        if (item.complements && item.complements.length > 0) {
            complementsHtml = item.complements.map(comp =>
                `<div class="complement">+ ${comp.quantity > 1 ? comp.quantity + 'x ' : ''}${comp.name}</div>`
            ).join('');
        }

        let obsHtml = '';
        if (showObservations && item.notes) {
            obsHtml = `<div class="observations">>> ${item.notes}</div>`;
        }

        return `
            <div class="item-row">
                <div class="item-main">
                    <span class="qty">${item.quantity}X</span> 
                    <span class="name">${item.product_name}</span>
                    <span class="price">${formatCurrency(item.unit_price * item.quantity)}</span>
                </div>
                ${complementsHtml}
                ${obsHtml}
            </div>
        `;
    }).join('') || '';

    // Pagamento
    const paymentMap: Record<string, string> = {
        'credit_card': 'CARTÃO DE CRÉDITO',
        'debit_card': 'CARTÃO DE DÉBITO',
        'cash': 'DINHEIRO',
        'pix': 'PIX'
    };
    let paymentMethod = order.payment_method || 'NÃO INFORMADO';
    if (paymentMap[paymentMethod]) paymentMethod = paymentMap[paymentMethod];
    paymentMethod = paymentMethod.toUpperCase().replace(/_/g, ' ');

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            @page { 
                margin: 0; 
                size: auto;
            }
            * {
                box-sizing: border-box;
            }
            body { 
                font-family: 'Courier New', Courier, monospace; 
                width: 100%; 
                max-width: 100%;
                margin: 0 auto;
                padding: 8px 12px;
                font-size: ${currentFontSize};
                line-height: 1.3;
                color: #000;
                background: #fff;
                text-align: center;
            }
            
            .text-center { text-align: center; }
            .text-left { text-align: left; }
            .text-right { text-align: right; }
            .font-bold { font-weight: bold; }
            .uppercase { text-transform: uppercase; }
            
            .header { margin-bottom: 10px; text-align: center; }
            .logo { max-width: 50%; max-height: 60px; margin: 0 auto 8px; display: block; }
            .store-name { font-size: 1.3em; font-weight: bold; margin-bottom: 3px; }
            .subtitle { font-size: 0.75em; margin-bottom: 3px; color: #333; }
            
            .divider { 
                text-align: center;
                margin: 8px 0;
                font-size: 0.9em;
                letter-spacing: -1px;
            }
            .divider-solid { border-bottom: 1px solid #000; margin: 8px 0; }
            
            .order-title { 
                font-size: 1.5em; 
                font-weight: bold; 
                margin: 12px 0 5px; 
                text-align: center; 
            }
            .order-date { 
                font-size: 0.85em; 
                margin-bottom: 10px; 
                text-align: center;
                color: #333;
            }
            
            .section-title { font-weight: bold; margin-bottom: 3px; font-size: 1em; text-align: left; }
            .customer-info { margin-bottom: 10px; text-align: left; }
            
            .items { text-align: left; }
            .item-row { margin-bottom: 6px; }
            .item-main { 
                display: flex; 
                justify-content: space-between; 
                font-weight: bold;
                font-size: 0.95em;
            }
            .qty { margin-right: 3px; }
            .complement { font-size: 0.85em; margin-left: 15px; color: #333; }
            .observations { font-size: 0.85em; margin-left: 15px; font-style: italic; margin-top: 1px; }
            
            .totals { margin-top: 10px; text-align: left; }
            .total-row { 
                display: flex; 
                justify-content: space-between; 
                margin-bottom: 2px;
                font-size: 0.95em;
            }
            .total-big { 
                font-size: 1.2em; 
                font-weight: bold; 
                margin-top: 5px; 
                border-top: 1px solid #000; 
                padding-top: 4px; 
            }
            
            .payment-box { 
                border: 2px solid #000; 
                padding: 6px 8px; 
                text-align: center; 
                margin: 15px auto 10px; 
                font-weight: bold; 
                font-size: 1em;
                max-width: 90%;
            }
            
            .footer { 
                margin-top: 15px; 
                font-size: 0.8em; 
                text-align: center; 
                padding-bottom: 15px;
            }
            .footer-version {
                font-size: 0.7em;
                margin-top: 8px;
                color: #666;
            }
        </style>
    </head>
    <body>
        <div class="header text-center">
            ${showLogo && logoUrl ? `<img src="${logoUrl}" class="logo" />` : ''}
            <div class="store-name uppercase">${storeName}</div>
            <div class="subtitle">SISTEMA DE IMPRESSÃO AUTOMÁTICO</div>
            <div>-------------------------</div>
        </div>

        <div class="order-title">PEDIDO #${order.order_number}</div>
        <div class="order-date">DATA: ${formatDate(order.created_at)}</div>
        
        <div class="divider-solid"></div>

        <div class="customer-info">
            <div class="section-title">CLIENTE: <span class="uppercase">${order.customer?.name || 'Não Identificado'}</span></div>
            ${showCustomerPhone && order.customer?.phone ? `<div>TEL: ${order.customer.phone}</div>` : ''}
            ${order.address ? `
                <div class="uppercase">
                    ${order.address.street}, ${order.address.number}<br>
                    ${order.address.neighborhood} - ${order.address.city || ''}/${order.address.state || ''}<br>
                    ${order.address.complement ? `(${order.address.complement})` : ''}
                </div>
            ` : '<div>RETIRADA NO LOCAL</div>'}
        </div>

        <div class="divider"></div>

        <div class="items">
            ${itemsHtml}
        </div>

        <div class="divider"></div>

        <div class="totals">
            <div class="total-row">
                <span>SUBTOTAL:</span>
                <span>${formatCurrency(Number(order.subtotal) || 0)}</span>
            </div>
            <div class="total-row">
                <span>TAXA ENTREGA:</span>
                <span>${formatCurrency(Number(order.delivery_fee) || 0)}</span>
            </div>
             ${Number(order.card_surcharge) > 0 ? `
                <div class="total-row orange">
                    <span>ACRÉSC. MAQUINETA:</span>
                    <span>${formatCurrency(Number(order.card_surcharge))}</span>
                </div>
            ` : ''}
            ${Number(order.discount) > 0 ? `
                <div class="total-row">
                    <span>DESCONTO:</span>
                    <span>-${formatCurrency(Number(order.discount))}</span>
                </div>
            ` : ''}
            
            <div class="total-row total-big">
                <span>TOTAL GERAL:</span>
                <span>${formatCurrency(Number(order.total) || 0)}</span>
            </div>
        </div>

        <div class="payment-box">
            PAGTO: ${paymentMethod}
        </div>

        <div class="footer">
            <div style="font-style: italic; margin-bottom: 10px;">${footerText}</div>
            <div style="font-size: 0.8em; border-top: 1px solid #ccc; padding-top: 5px;">ÓoPrint v2.4</div>
        </div>
    </body>
    </html>
    `;
}
