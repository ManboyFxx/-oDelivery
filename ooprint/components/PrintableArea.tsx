
import React from 'react';
import { Order, CouponConfig, PrinterSettings } from '../types';
import { QRCodeSVG } from 'qrcode.react';

interface PrintableAreaProps {
  order: Order;
  config: CouponConfig;
  printer: PrinterSettings;
}

const PrintableArea: React.FC<PrintableAreaProps> = ({ order, config, printer }) => {
  const is80mm = printer.paperWidth === '80mm';

  const getSeparator = () => {
    const char = config.separatorStyle === 'solid' ? '_' : config.separatorStyle === 'dashed' ? '-' : '.';
    const width = is80mm ? 42 : 32;
    return char.repeat(width);
  };

  const containerStyle = {
    width: is80mm ? '302px' : '219px',
    marginLeft: `${config.leftMargin}mm`,
    backgroundColor: 'white',
    color: 'black',
    padding: '10px',
    fontFamily: '"Courier New", Courier, monospace',
    fontSize: config.condensedMode ? '10px' : config.fontSize === 'small' ? '10px' : config.fontSize === 'large' ? '14px' : '12px',
    lineHeight: '1.2'
  };

  return (
    <div className="print-only fixed top-0 left-0 z-[9999] bg-white text-black min-h-screen">
      <div style={containerStyle} className={config.upperCaseOnly ? 'uppercase' : ''}>

        {/* Cabeçalho / Logo */}
        <div className="text-center mb-2 flex flex-col items-center">
          {config.showLogo && order.tenant_data?.logo_url && (
            <img
              src={order.tenant_data.logo_url}
              alt="Logo"
              className="w-16 h-16 object-contain mb-2 grayscale brightness-110 contrast-125"
              style={{ filter: 'grayscale(1) contrast(200%) brightness(100%)' }}
            />
          )}
          <div className="font-bold text-base mb-1">{order.tenant_data?.name || config.headerText || 'ÓoPrint Sistema'}</div>
          {order.tenant_data?.address && <div className="text-[9px] mb-1">{order.tenant_data.address}</div>}
          <div>{getSeparator()}</div>
        </div>

        {/* Info Pedido */}
        <div className="mb-2">
          {config.highlightOrderNumber ? (
            <div className="text-xl font-bold border-y border-black py-1 mb-1 text-center">
              PEDIDO #{order.id.slice(-4)}
            </div>
          ) : (
            <div className="font-bold">PEDIDO: #{order.id.slice(-4)}</div>
          )}
          <div className="text-[10px]">DATA: {new Date().toLocaleDateString('pt-BR')} {new Date().toLocaleTimeString('pt-BR')}</div>
        </div>

        {/* Cliente */}
        <div className="mb-2">
          <div className="font-bold">CLIENTE: {order.customer}</div>
          {config.showCustomerPhone && <div>TEL: {order.phone}</div>}
          <div className="mt-1 text-[11px] leading-tight">{order.address}</div>
        </div>

        <div>{getSeparator()}</div>

        {/* Itens com Complementos */}
        <div className="my-2">
          <table className="w-full">
            <thead>
              <tr className="text-left font-bold border-b border-black">
                <th className="w-10">QTD</th>
                <th>PRODUTO</th>
                {config.showItemPrices && <th className="text-right">R$</th>}
              </tr>
            </thead>
            <tbody>
              {order.items.map(item => (
                <React.Fragment key={item.id}>
                  <tr>
                    <td className="font-bold align-top">{item.quantity}X</td>
                    <td className="align-top font-bold">{item.name}</td>
                    {config.showItemPrices && (
                      <td className="text-right align-top">{(item.price * item.quantity).toFixed(2)}</td>
                    )}
                  </tr>

                  {config.showObservations && (
                    <>
                      {item.complements?.map((comp, cIdx) => (
                        <tr key={cIdx}>
                          <td />
                          <td colSpan={2} className="text-[10px] font-medium text-black">+ {comp}</td>
                        </tr>
                      ))}
                      {item.observations && (
                        <tr>
                          <td />
                          <td colSpan={2} className="text-[10px] italic font-medium text-black">{'>>'} OBS: {item.observations}</td>
                        </tr>
                      )}
                    </>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        <div>{getSeparator()}</div>

        {/* Totais */}
        <div className="my-2 space-y-1">
          <div className="flex justify-between text-[11px]">
            <span>SUBTOTAL:</span>
            <span>R$ {(order.total - order.deliveryFee - (order.serviceFee || 0)).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span>TAXA ENTREGA:</span>
            <span>R$ {order.deliveryFee.toFixed(2)}</span>
          </div>
          {order.serviceFee && order.serviceFee > 0 && (
            <div className="flex justify-between text-[11px]">
              <span>ACRÉSC. MAQUINETA:</span>
              <span>R$ {order.serviceFee.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-base border-t border-black pt-1 mt-1">
            <span>TOTAL GERAL:</span>
            <span>R$ {order.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Pagamento */}
        <div className="text-center font-bold border-y border-black py-1.5 my-2">
          PAGAMENTO: {order.paymentMethod}
        </div>

        {/* Loyalty Section */}
        {order.loyalty_info && (order.loyalty_info.points_earned > 0 || order.loyalty_info.customer_total_points > 0) && (
          <div className="my-2 p-1.5 border border-dashed border-black rounded text-center">
            <div className="text-[9px] font-bold">PROGRAMA DE FIDELIDADE</div>
            {order.loyalty_info.points_earned > 0 && (
              <div className="text-[11px]">Você ganhou: <b>{order.loyalty_info.points_earned}</b> pontos!</div>
            )}
            <div className="text-[10px]">Saldo Total: {order.loyalty_info.customer_total_points} pontos</div>
          </div>
        )}

        {/* QR Code / Digital Menu */}
        <div className="flex flex-col items-center my-4">
          <div className="text-[8px] mb-1 font-bold">ACESSE NOSSO CARDÁPIO DIGITAL</div>
          <QRCodeSVG
            value={`https://oodelivery.com.br/${order.tenant_data?.name?.toLowerCase().replace(/\s+/g, '-') || 'cardapio'}`}
            size={is80mm ? 100 : 80}
            level="M"
            includeMargin={false}
          />
        </div>

        {/* Rodapé */}
        <div className="text-center mt-6">
          <div className="italic text-[10px] mb-3 px-4">{config.footerText}</div>
          <div className="text-[8px] opacity-40 uppercase tracking-widest font-bold">ÓoPrint Terminal v2.5</div>
          <div className="h-12" />
          {printer.cutPaper && <div className="hidden">.</div>}
        </div>
      </div>
    </div>
  );
};

export default PrintableArea;
