import { DBOrder, CouponConfig } from '../types';
import QRCode from 'qrcode';

export async function generateOrderHtml(order: DBOrder, config: CouponConfig, tenantDetails?: any): Promise<string> {
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
    const storeAddress = tenantDetails?.address;

    // Gerar QR Code para o Cardápio Digital
    let qrCodeDataUrl = '';
    try {
        const menuUrl = `https://oodelivery.com.br/${storeName.toLowerCase().replace(/\s+/g, '-')}`;
        qrCodeDataUrl = await QRCode.toDataURL(menuUrl, {
            margin: 1,
            width: 128,
            color: { dark: '#000000', light: '#ffffff' }
        });
    } catch (err) {
        console.error('Failed to generate QR Code for receipt:', err);
    }

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

    // Loyalty Info
    let loyaltyHtml = '';
    if (order.loyalty_points_earned || order.customer_points) {
        loyaltyHtml = `
            <div class="loyalty-box">
                <div class="loyalty-title">PROGRAMA DE FIDELIDADE</div>
                ${order.loyalty_points_earned ? `<div class="loyalty-earned">Você ganhou: <b>${order.loyalty_points_earned}</b> pontos!</div>` : ''}
                <div class="loyalty-total">Saldo Total: ${order.customer_points || 0} pontos</div>
            </div>
        `;
    }

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
            
            .header { margin-bottom: 10px; text-align: center; }
            .logo { max-width: 60px; max-height: 60px; margin: 0 auto 8px; display: block; filter: grayscale(1) contrast(200%); }
            .store-name { font-size: 1.3em; font-weight: bold; margin-bottom: 3px; }
            .store-address { font-size: 0.75em; margin-bottom: 3px; }
            
            .divider { 
                text-align: center;
                margin: 8px 0;
                border-top: 1px dashed #000;
            }
            
            .order-title { 
                font-size: 1.5em; 
                font-weight: bold; 
                margin: 8px 0 5px; 
                text-align: center; 
                border-top: 2px solid #000;
                border-bottom: 2px solid #000;
                padding: 4px 0;
            }
            .order-date { 
                font-size: 0.85em; 
                margin-bottom: 10px; 
                text-align: center;
                color: #333;
            }
            
            .customer-info { margin-bottom: 10px; text-align: left; }
            .customer-label { font-weight: bold; }
            
            .items { text-align: left; }
            .item-row { margin-bottom: 6px; }
            .item-main { 
                display: flex; 
                justify-content: space-between; 
                font-weight: bold;
            }
            .qty { margin-right: 3px; }
            .price { min-width: 80px; text-align: right; }
            .complement { font-size: 0.85em; margin-left: 15px; }
            .observations { font-size: 0.85em; margin-left: 15px; font-style: italic; }
            
            .totals { margin-top: 10px; text-align: left; }
            .total-row { 
                display: flex; 
                justify-content: space-between; 
                margin-bottom: 2px;
            }
            .total-big { 
                font-size: 1.25em; 
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
                font-size: 1.1em;
            }

            .loyalty-box {
                margin: 10px 0;
                padding: 5px;
                border: 1px dashed #000;
                text-align: center;
            }
            .loyalty-title { font-size: 0.75em; font-weight: bold; }
            .loyalty-earned { font-size: 0.9em; margin: 3px 0; }
            .loyalty-total { font-size: 0.85em; }

            .qr-section { margin: 15px 0; text-align: center; }
            .qr-code { width: 100px; height: 100px; margin: 0 auto; }
            .qr-label { font-size: 0.7em; font-weight: bold; margin-bottom: 5px; }
            
            .footer { 
                margin-top: 15px; 
                font-size: 0.8em; 
                text-align: center; 
                padding-bottom: 20px;
            }
        </style>
    </head>
    <body>
        <div class="header">
            ${showLogo && logoUrl ? `<img src="${logoUrl}" class="logo" />` : ''}
            <div class="store-name uppercase">${storeName}</div>
            ${storeAddress ? `<div class="store-address">${storeAddress}</div>` : ''}
            <div class="divider"></div>
        </div>

        <div class="order-title">PEDIDO #${order.order_number}</div>
        <div class="order-date">DATA: ${formatDate(order.created_at)}</div>
        
        <div class="customer-info">
            <div><span class="customer-label">CLIENTE:</span> <span class="uppercase">${order.customer?.name || 'Não Identificado'}</span></div>
            ${showCustomerPhone && order.customer?.phone ? `<div>TEL: ${order.customer.phone}</div>` : ''}
            ${order.address ? `
                <div class="uppercase">
                    ${order.address.street}, ${order.address.number}<br>
                    ${order.address.neighborhood} - ${order.address.city || ''}/${order.address.state || ''}
                    ${order.address.complement ? `<br>(${order.address.complement})` : ''}
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
                <div class="total-row">
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

        ${loyaltyHtml}

        <div class="qr-section">
            <div class="qr-label">CARDÁPIO DIGITAL</div>
            ${qrCodeDataUrl ? `<img src="${qrCodeDataUrl}" class="qr-code" />` : ''}
        </div>

        <div class="footer">
            <div style="font-style: italic; margin-bottom: 10px;">${footerText}</div>
            <div style="font-size: 0.75em; border-top: 1px solid #000; padding-top: 5px;">ÓoPrint Terminal v2.5</div>
        </div>
    </body>
    </html>
    `;
}
