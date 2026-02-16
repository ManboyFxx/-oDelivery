
import React, { useState } from 'react';
import { PrintJob } from '../types';

interface OrdersListProps {
  orders: PrintJob[];
  onPrint: (id: string) => Promise<boolean>;
  onUpdateStatus?: (id: string, status: string) => Promise<void>;
  autoPrint: boolean;
}

const OrdersList: React.FC<OrdersListProps> = ({ orders, onPrint, onUpdateStatus, autoPrint }) => {
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [processingId, setProcessingId] = useState<string | null>(null);

  const toggleDetails = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const handleStatusClick = async (orderId: string, newStatus: string) => {
    if (!onUpdateStatus) return;
    setProcessingId(orderId);
    await onUpdateStatus(orderId, newStatus);
    setProcessingId(null);
  };

  const getStatusButton = (order: PrintJob) => {
    if (!onUpdateStatus || order.status === 'printed' || order.status === 'cancelled' || order.backendStatus === 'delivered') return null;

    const status = order.backendStatus || 'new';

    // New/Confirmed -> [Confirmar] (Preparing)
    if (status === 'new' || status === 'confirmed') {
      return (
        <button
          onClick={() => handleStatusClick(order.id, 'preparing')}
          disabled={processingId === order.id}
          className="flex-1 lg:flex-none px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-widest shadow-lg transition-all"
        >
          {processingId === order.id ? '...' : 'Confirmar'}
        </button>
      );
    }

    // Preparing -> [Pronto] (Ready)
    if (status === 'preparing') {
      return (
        <button
          onClick={() => handleStatusClick(order.id, 'ready')}
          disabled={processingId === order.id}
          className="flex-1 lg:flex-none px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-widest shadow-lg transition-all"
        >
          {processingId === order.id ? '...' : 'Pronto'}
        </button>
      );
    }

    // Ready -> [Saiu p/ Entrega] (Out for delivery)
    if (status === 'ready') {
      return (
        <button
          onClick={() => handleStatusClick(order.id, 'out_for_delivery')}
          disabled={processingId === order.id}
          className="flex-1 lg:flex-none px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs uppercase tracking-widest shadow-lg transition-all"
        >
          {processingId === order.id ? '...' : 'Saiu p/ Entrega'}
        </button>
      );
    }

    return null;
  };

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div>
          <h3 className="text-3xl font-bold text-white tracking-tight">Pedidos Recentes</h3>
          <p className="text-gray-400 font-medium">Gerencie e imprima os tickets de delivery.</p>
        </div>
        {autoPrint && (
          <div className="flex items-center gap-3 px-5 py-2.5 rounded-2xl border shadow-sm self-start sm:self-center bg-[#ff3d03]/10 border-[#ff3d03]/20 text-[#ff3d03]">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#ff3d03' }} />
            <span className="text-xs font-bold uppercase tracking-widest">Auto-Print Ativo</span>
          </div>
        )}
      </div>

      <div className="grid gap-6">
        {orders.map((order) => {
          const isExpanded = expandedOrders.has(order.id);
          const isPrinted = order.status === 'printed';

          return (
            <div
              key={order.id}
              className={`bg-[#0d1117] border border-[#1e293b] rounded-[1.5rem] p-6 md:p-8 hover:border-[#ff3d03]/30 transition-all duration-300 shadow-xl ${isPrinted ? 'border-emerald-500/10 opacity-95' : ''}`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-6 justify-between">
                <div className="flex gap-5 items-start flex-1 min-w-0">
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${isPrinted ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'text-white'}`}
                    style={!isPrinted ? { backgroundColor: '#ff3d03', boxShadow: '0 10px 20px -5px rgba(255, 61, 3, 0.2)' } : {}}
                  >
                    <span className="font-bold text-xl tracking-tighter">#{order.order_number || order.id.slice(-4)}</span>
                  </div>
                  <div className="flex-1 min-w-0 py-0.5">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-1">
                      <h4 className="text-xl font-bold text-white truncate uppercase tracking-tight">{order.customer}</h4>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-widest w-fit ${isPrinted ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/10' : 'bg-[#ff3d03]/10 text-[#ff3d03] border border-[#ff3d03]/10'}`}>
                        {isPrinted ? 'Impresso' : (order.backendStatus === 'new' ? 'Novo Pedido' : (order.backendStatus || order.status))}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 font-medium line-clamp-1 mb-3">{order.address}</p>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        {order.timestamp}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        {order.paymentMethod}
                      </div>
                      <div className="text-xl font-bold text-emerald-500 tracking-tight">R$ {order.total.toFixed(2)}</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full lg:w-auto">
                  <button
                    onClick={() => toggleDetails(order.id)}
                    className={`flex-1 lg:flex-none px-6 py-3 rounded-xl border border-[#1e293b] text-xs font-bold uppercase tracking-widest transition-all ${isExpanded ? 'bg-white/10 text-white border-white/20' : 'text-gray-400 hover:bg-white/5'}`}
                  >
                    {isExpanded ? 'Ocultar' : 'Detalhes'}
                  </button>

                  {getStatusButton(order)}

                  <button
                    onClick={() => onPrint(order.id)}
                    className={`flex-1 lg:flex-none px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg text-white ${isPrinted
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'hover:brightness-110'
                      }`}
                    style={!isPrinted ? { backgroundColor: '#ff3d03', boxShadow: '0 8px 16px -4px rgba(255, 61, 3, 0.2)' } : {}}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    {isPrinted ? 'Reimprimir' : 'Imprimir'}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="mt-8 pt-8 border-t border-[#1e293b] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 animate-in slide-in-from-top-4 duration-300">
                  <div className="space-y-4">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Itens do Pedido</p>
                    <ul className="space-y-4">
                      {order.items.map(item => (
                        <li key={item.id} className="text-sm space-y-1">
                          <div className="flex justify-between items-center group/item">
                            <span className="flex items-center gap-3">
                              <span className="font-bold px-1.5 py-0.5 rounded text-xs bg-[#ff3d03]/10 text-[#ff3d03]">{item.quantity}x</span>
                              <span className="font-bold text-gray-200">{item.name}</span>
                            </span>
                            <span className="text-gray-400 font-semibold">R$ {(item.price * item.quantity).toFixed(2)}</span>
                          </div>

                          {(item.complements && item.complements.length > 0) && (
                            <div className="ml-10 flex flex-wrap gap-1.5">
                              {item.complements.map((comp, idx) => (
                                <span key={idx} className="bg-white/10 border border-white/20 px-2 py-0.5 rounded text-[9px] font-bold text-gray-300 uppercase">
                                  {comp}
                                </span>
                              ))}
                            </div>
                          )}

                          {item.observations && (
                            <p className="text-[11px] italic ml-10 border-l pl-2 border-[#ff3d03]/20 text-[#ff3d03]/80">
                              Obs: {item.observations}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Resumo Financeiro</p>
                    <div className="bg-white/5 p-5 rounded-2xl border border-white/5 space-y-3">
                      <div className="flex justify-between text-xs font-semibold text-gray-400">
                        <span>Produtos</span>
                        <span>R$ {(order.total - order.deliveryFee - (order.serviceFee || 0)).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs font-semibold text-gray-400">
                        <span>Entrega</span>
                        <span>R$ {order.deliveryFee.toFixed(2)}</span>
                      </div>
                      {order.serviceFee && order.serviceFee > 0 && (
                        <div className="flex justify-between text-xs font-semibold text-[#ff3d03]">
                          <span>Acrésc. Maquineta</span>
                          <span>R$ {order.serviceFee.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="pt-3 mt-3 border-t border-white/10 flex justify-between text-xl font-bold text-white tracking-tight">
                        <span>Total</span>
                        <span className="text-emerald-500">R$ {order.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Contato e Entrega</p>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 border border-white/5">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </div>
                        <span className="text-base font-bold text-gray-200">{order.phone}</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 shrink-0 border border-white/5">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </div>
                        <span className="text-sm font-medium text-gray-400 leading-tight pt-2">{order.address}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrdersList;
