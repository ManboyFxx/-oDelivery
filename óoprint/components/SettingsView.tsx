
import React, { useState } from 'react';
import { SettingsTab, CouponConfig, PrinterSettings, ApiSettings } from '../types';
import PrinterSettingsPanel from './PrinterSettingsPanel';
import CouponConfigPanel from './CouponConfigPanel';
import ApiSettingsPanel from './ApiSettingsPanel';
import DebugPanel from './DebugPanel';

interface SettingsViewProps {
  printerSettings: PrinterSettings;
  setPrinterSettings: React.Dispatch<React.SetStateAction<PrinterSettings>>;
  couponConfig: CouponConfig;
  setCouponConfig: React.Dispatch<React.SetStateAction<CouponConfig>>;
  apiSettings: ApiSettings | null;
  onApiSettingsChange: (settings: ApiSettings) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({
  printerSettings,
  setPrinterSettings,
  couponConfig,
  setCouponConfig,
  apiSettings,
  onApiSettingsChange
}) => {
  const [activeSubTab, setActiveSubTab] = useState<SettingsTab>(SettingsTab.SYSTEM);
  const [debugPanelOpen, setDebugPanelOpen] = useState(false);

  const tabs = [
    { id: SettingsTab.SYSTEM, label: 'Sistema', icon: '💻' },
    { id: SettingsTab.PRINTER, label: 'Hardware', icon: '🖨️' },
    { id: SettingsTab.COUPON, label: 'Cupom', icon: '🎫' },
  ];

  const toggleSetting = (field: keyof PrinterSettings) => {
    setPrinterSettings(prev => ({ ...prev, [field]: !prev[field] }));
  };

  // Componente Switch Reutilizável para consistência
  const Switch = ({ active, onClick, color = "#ff3d03" }: { active: boolean, onClick: () => void, color?: string }) => (
    <button 
      onClick={onClick}
      className={`w-12 h-6 rounded-full relative transition-all duration-300`}
      style={{ backgroundColor: active ? color : '#334155' }}
    >
      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${active ? 'left-7' : 'left-1'}`} />
    </button>
  );

  return (
    <>
    <div className="space-y-10 animate-in fade-in duration-500 font-sans min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Configurações do Terminal</h2>
          <p className="text-gray-400 font-medium">Ajuste o comportamento do software e periféricos.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
           <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
           </svg>
           <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Ajustes Salvos Automaticamente</span>
        </div>
      </div>

      <div className="flex items-center gap-2 p-1.5 bg-[#0d1117] border border-[#1e293b] rounded-2xl w-fit shadow-lg sticky top-0 z-20 backdrop-blur-md">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
              activeSubTab === tab.id
                ? 'text-white shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
            style={activeSubTab === tab.id ? { backgroundColor: '#ff3d03' } : {}}
          >
            <span className="text-lg">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {activeSubTab === SettingsTab.SYSTEM && (
          <div className="max-w-5xl space-y-8 pb-20">
            <div className="grid md:grid-cols-2 gap-8">
              
              {/* Grupo 1: Automação de Pedidos */}
              <div className="bg-[#0d1117] border border-[#1e293b] rounded-[1.5rem] p-8 space-y-8 shadow-xl">
                 <div className="flex items-center gap-3 border-b border-[#1e293b] pb-4">
                    <div className="p-2 rounded-lg font-bold text-xs bg-[#ff3d03]/10 text-[#ff3d03]">A</div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-widest">Fluxo de Automação</h4>
                 </div>
                 
                 <div className="space-y-6">
                   <div className="flex justify-between items-center group">
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold text-gray-200">Impressão Automática</p>
                        <p className="text-[10px] text-gray-500 font-medium">Dispara o hardware assim que o pedido entra.</p>
                      </div>
                      <Switch active={printerSettings.autoPrint} onClick={() => toggleSetting('autoPrint')} />
                   </div>

                   <div className="flex justify-between items-center group">
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold text-gray-200">Início Automático (OS)</p>
                        <p className="text-[10px] text-gray-500 font-medium">Abre o terminal ao iniciar o Windows/Linux.</p>
                      </div>
                      <Switch active={printerSettings.autoStart} onClick={() => toggleSetting('autoStart')} />
                   </div>

                   <div className="flex justify-between items-center group">
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold text-gray-200">Ocultar Pedidos Impressos</p>
                        <p className="text-[10px] text-gray-500 font-medium">Remove da fila principal para evitar confusão.</p>
                      </div>
                      <Switch active={printerSettings.hidePrinted} onClick={() => toggleSetting('hidePrinted')} />
                   </div>
                 </div>
              </div>

              {/* Grupo 2: Alertas e Monitoramento */}
              <div className="bg-[#0d1117] border border-[#1e293b] rounded-[1.5rem] p-8 space-y-8 shadow-xl">
                 <div className="flex items-center gap-3 border-b border-[#1e293b] pb-4">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500 font-bold text-xs">B</div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-widest">Alertas e Interface</h4>
                 </div>
                 
                 <div className="space-y-6">
                   <div className="flex justify-between items-center group">
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold text-gray-200">Sinal Sonoro (Beep)</p>
                        <p className="text-[10px] text-gray-500 font-medium">Toca alerta no alto-falante do PC.</p>
                      </div>
                      <Switch active={printerSettings.alertSound} onClick={() => toggleSetting('alertSound')} color="#3b82f6" />
                   </div>

                   <div className="flex justify-between items-center group">
                      <div className="space-y-0.5">
                        <p className="text-sm font-bold text-gray-200">Sinal Visual (Flash)</p>
                        <p className="text-[10px] text-gray-500 font-medium">Pisca as bordas da tela em novos pedidos.</p>
                      </div>
                      <Switch active={printerSettings.visualAlert} onClick={() => toggleSetting('visualAlert')} color="#3b82f6" />
                   </div>

                   <div className="space-y-4 pt-4 border-t border-[#1e293b]">
                      <div className="flex justify-between items-end">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Zoom da Interface</p>
                        <span className="text-sm font-bold" style={{ color: '#ff3d03' }}>{printerSettings.uiScale}%</span>
                      </div>
                      <input 
                        type="range" min="80" max="140" step="5"
                        value={printerSettings.uiScale}
                        onChange={(e) => setPrinterSettings(p => ({ ...p, uiScale: parseInt(e.target.value) }))}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                        style={{ accentColor: '#ff3d03' }}
                      />
                   </div>
                 </div>
              </div>
            </div>

            {/* Configurações de Ciclo de Rede */}
            <div className="bg-[#ff3d03]/5 border border-[#ff3d03]/20 rounded-[1.5rem] p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
               <div className="space-y-2 flex-1">
                  <h4 className="text-lg font-bold text-white uppercase italic tracking-tight">Frequência de Monitoramento</h4>
                  <p className="text-sm text-gray-400 font-medium">
                    O terminal verifica novos pedidos no servidor a cada <span className="font-bold" style={{ color: '#ff3d03' }}>{printerSettings.pollingInterval} segundos</span>. 
                    Ciclos menores (5-10s) são ideais para horários de pico.
                  </p>
                  <div className="pt-4 flex items-center gap-6">
                    <input 
                      type="range" min="5" max="60" step="5"
                      value={printerSettings.pollingInterval}
                      onChange={(e) => setPrinterSettings(p => ({ ...p, pollingInterval: parseInt(e.target.value) }))}
                      className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                      style={{ accentColor: '#ff3d03' }}
                    />
                    <div className="w-12 text-right text-xl font-black" style={{ color: '#ff3d03' }}>{printerSettings.pollingInterval}s</div>
                  </div>
               </div>
               
               <div className="shrink-0 space-y-3 w-full md:w-auto">
                  <button className="w-full px-8 py-4 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-[#ff3d03]/20" style={{ backgroundColor: '#ff3d03' }}>Testar Conexão</button>
                  <button className="w-full px-8 py-4 bg-white/5 border border-white/10 text-gray-400 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:text-white transition-all">Ver Logs de Sincronia</button>
               </div>
            </div>

            {/* API Connection Settings */}
            <div className="bg-gradient-to-br from-[#111418] to-[#16191e] rounded-2xl p-8 border border-[#1f2937]/30">
              <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                🔗 Conexão API
              </h2>
              <p className="text-gray-400 text-sm mb-6">Configure a conexão com o servidor oDelivery</p>
              <ApiSettingsPanel
                settings={apiSettings}
                onChange={onApiSettingsChange}
              />
            </div>

            {/* Rodapé de Segurança e Debug */}
            <div className="flex justify-center gap-4 pt-10">
               <button
                 onClick={() => setDebugPanelOpen(true)}
                 className="flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-blue-500 transition-colors uppercase tracking-[0.2em]"
                 title="Abrir painel de debug para testar a API"
               >
                  <span>🔧</span>
                  Debug
               </button>
               <span className="text-gray-600">•</span>
               <button
                 onClick={() => { if(confirm('Deseja resetar todas as configurações para o padrão de fábrica?')) window.location.reload(); }}
                 className="flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-red-500 transition-colors uppercase tracking-[0.2em]"
               >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Restaurar Padrões de Fábrica
               </button>
            </div>
          </div>
        )}

        {activeSubTab === SettingsTab.PRINTER && (
          <PrinterSettingsPanel 
            settings={printerSettings} 
            setSettings={setPrinterSettings} 
          />
        )}
        
        {activeSubTab === SettingsTab.COUPON && (
          <CouponConfigPanel 
            config={couponConfig} 
            setConfig={setCouponConfig} 
          />
        )}
      </div>
    </div>

    <DebugPanel isOpen={debugPanelOpen} onClose={() => setDebugPanelOpen(false)} />
    </>
  );
};

export default SettingsView;
