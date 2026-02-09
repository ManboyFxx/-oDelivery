
import React, { useState } from 'react';
import { PrintJob } from '../types';

interface HistoryViewProps {
  history: PrintJob[];
  onPrint?: (htmlContent: string) => Promise<void>;
}

const HistoryView: React.FC<HistoryViewProps> = ({ history, onPrint }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleDetails = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const handleReprint = async (e: React.MouseEvent, job: PrintJob) => {
    e.stopPropagation();
    if (onPrint && job.content) {
      await onPrint(job.content);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 font-sans">
      <div className="flex flex-col gap-2">
        <h2 className="text-4xl font-bold tracking-tight text-white">Relatório de Impressões</h2>
        <p className="text-lg text-gray-500 font-medium">Registros detalhados de todas as operações de hardware da sessão.</p>
      </div>

      <div className="bg-[#0d1117] border border-[#1e293b] rounded-[1.5rem] overflow-hidden shadow-2xl">
        {history.length === 0 ? (
          <div className="py-24 px-10 text-center space-y-6">
            <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center mx-auto border border-white/10 shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="max-w-md mx-auto">
              <p className="text-white font-bold text-xl tracking-tight">Sem atividades recentes</p>
              <p className="text-gray-500 text-base font-medium mt-2">Nenhum comando de impressão foi enviado ao hardware nesta sessão.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1e293b] bg-white/5">
                  <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-gray-500">Horário</th>
                  <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-gray-500">Referência</th>
                  <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-gray-500">Cliente / Destino</th>
                  <th className="hidden md:table-cell px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-gray-500">Impressora</th>
                  <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-gray-500 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e293b]/50">
                {history.map((entry) => {
                  const isExpanded = expandedId === entry.id;
                  return (
                    <React.Fragment key={entry.id}>
                      <tr
                        onClick={() => toggleDetails(entry.id)}
                        className={`hover:bg-white/5 transition-all duration-300 group cursor-pointer ${isExpanded ? 'bg-white/5' : ''}`}
                      >
                        <td className="px-8 py-5">
                          <span className="text-sm font-semibold text-gray-400 font-mono">
                            {entry.printed_at ? new Date(entry.printed_at).toLocaleTimeString('pt-BR') : 'N/A'}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <span className="text-base font-bold text-white group-hover:text-[#ff4d00] transition-colors bg-white/5 px-3 py-1.5 rounded-lg">
                            #{entry.order_number || entry.id.slice(-4)}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex flex-col">
                            <span className="text-lg font-bold text-gray-200 truncate max-w-[250px] block uppercase tracking-tight">
                              {entry.customer}
                            </span>
                            <span className="text-xs text-gray-500 font-medium truncate max-w-[250px]">
                              {entry.paymentMethod}
                            </span>
                          </div>
                        </td>
                        <td className="hidden md:table-cell px-8 py-5">
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-widest truncate max-w-[200px] block font-mono">
                            {entry.device_id?.slice(-8) || 'N/A'}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <button
                            onClick={(e) => handleReprint(e, entry)}
                            className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all"
                          >
                            Reimprimir
                          </button>
                        </td>
                      </tr>
                      {/* Detalhes Expandidos */}
                      {isExpanded && (
                        <tr className="bg-white/[0.02]">
                          <td colSpan={5} className="px-8 py-6 border-b border-[#1e293b]/50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-top-2 duration-300">
                              {/* Lista de Itens */}
                              <div className="space-y-3">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-[#ff4d00]">Itens do Pedido</h4>
                                <ul className="space-y-4"> // Aumentando espaçamento
                                  {entry.items?.map((item: any, idx) => (
                                    <li key={idx} className="text-sm text-gray-300 flex justify-between items-start border-b border-white/5 pb-2">
                                      <div>
                                        <div className="flex gap-2 font-medium">
                                          <span className="text-[#ff4d00] font-bold">{item.quantity}x</span>
                                          <span>{item.name}</span>
                                        </div>
                                        {/* Complementos */}
                                        {item.complements && item.complements.length > 0 && (
                                          <div className="flex flex-col ml-6 mt-1 text-xs text-gray-400">
                                            {item.complements.map((comp: string, i: number) => (
                                              <span key={i}>{comp}</span>
                                            ))}
                                          </div>
                                        )}
                                        {item.observations && (
                                          <p className="text-xs text-gray-500 italic ml-6 mt-0.5">Obs: {item.observations}</p>
                                        )}
                                      </div>
                                      <span className="font-mono text-gray-500">R$ {(item.price * item.quantity).toFixed(2)}</span>
                                    </li>
                                  ))}
                                  {!entry.items?.length && <li className="text-sm text-gray-500 italic">Sem itens registrados.</li>}
                                </ul>
                              </div>

                              {/* Resumo Financeiro e Endereço */}
                              <div className="space-y-6">
                                <div>
                                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#ff4d00] mb-2">Endereço de Entrega</h4>
                                  <p className="text-sm text-gray-300 leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5">
                                    {entry.address}
                                  </p>
                                </div>

                                <div>
                                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#ff4d00] mb-2">Resumo Financeiro</h4>
                                  <div className="bg-white/5 p-4 rounded-xl space-y-2 border border-white/5">
                                    <div className="flex justify-between text-xs text-gray-400">
                                      <span>Entrega</span>
                                      <span>R$ {entry.deliveryFee?.toFixed(2) || '0.00'}</span>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-400">
                                      <span>Taxa Serviço</span>
                                      <span>R$ {entry.serviceFee?.toFixed(2) || '0.00'}</span>
                                    </div>
                                    <div className="border-t border-white/10 pt-2 flex justify-between text-lg font-bold text-white">
                                      <span>Total</span>
                                      <span className="text-emerald-500">R$ {entry.total?.toFixed(2) || '0.00'}</span>
                                    </div>
                                    <div className="text-[10px] text-center text-gray-500 uppercase tracking-widest pt-1">
                                      {entry.paymentMethod}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex items-start gap-6 p-6 bg-orange-500/5 border border-orange-500/10 rounded-2xl shadow-lg">
        <div className="p-3 bg-orange-500/10 rounded-xl shrink-0 border border-orange-500/20">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="space-y-1">
          <h5 className="text-lg font-bold text-gray-100 uppercase tracking-tight">Retenção de Dados</h5>
          <p className="text-sm text-gray-500 leading-relaxed font-medium">
            Este terminal mantém logs voláteis da sessão operacional. Dados locais são purgados ao recarregar. Para exportação completa, utilize o painel Cloud.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HistoryView;
