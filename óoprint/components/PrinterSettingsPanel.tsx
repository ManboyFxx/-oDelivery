
import React, { useState } from 'react';
import { PrinterSettings } from '../types';
import { MOCK_PRINTERS } from '../constants';

interface PrinterSettingsPanelProps {
  settings: PrinterSettings;
  setSettings: React.Dispatch<React.SetStateAction<PrinterSettings>>;
}

const PrinterSettingsPanel: React.FC<PrinterSettingsPanelProps> = ({ settings, setSettings }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isFeeding, setIsFeeding] = useState(false);

  const handleChange = (field: keyof PrinterSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const scanPrinters = () => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 2000);
  };

  const handleManualFeed = () => {
    setIsFeeding(true);
    setTimeout(() => setIsFeeding(false), 1000);
  };

  return (
    <div className="max-w-5xl animate-in slide-in-from-bottom-8 duration-700 font-sans pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h3 className="text-3xl font-bold tracking-tight text-white uppercase">Hardware de Comunicação</h3>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Serviço de Impressão Ativo</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleManualFeed}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-all"
          >
            {isFeeding ? 'Avançando...' : 'Avançar Papel'}
          </button>
          <button 
            onClick={scanPrinters}
            disabled={isScanning}
            className={`flex items-center gap-3 px-6 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 shadow-lg text-white ${isScanning ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-110 shadow-[#ff3d03]/20'}`}
            style={!isScanning ? { backgroundColor: '#ff3d03' } : { backgroundColor: '#ff3d0380' }}
          >
            {isScanning ? 'Sincronizando...' : 'Escanear Dispositivos'}
          </button>
        </div>
      </div>
      
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Coluna 1: Dispositivo e Protocolo */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-[#0d1117] border border-[#1e293b] rounded-[1.5rem] p-8 shadow-xl space-y-8">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: '#ff3d03' }}>Conectividade Principal</h4>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Impressora Padrão</label>
                <select 
                  value={settings.selectedPrinter}
                  onChange={(e) => handleChange('selectedPrinter', e.target.value)}
                  className="w-full bg-[#161b22] border border-[#1e293b] rounded-xl px-5 py-4 text-white text-base font-semibold appearance-none focus:outline-none focus:border-[#ff3d03] outline-none transition-all"
                >
                  {MOCK_PRINTERS.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Protocolo (Emulação)</label>
                <select 
                  value={settings.printerModel}
                  onChange={(e) => handleChange('printerModel', e.target.value)}
                  className="w-full bg-[#161b22] border border-[#1e293b] rounded-xl px-5 py-4 text-white text-base font-semibold appearance-none focus:outline-none focus:border-[#ff3d03] outline-none transition-all"
                >
                  <option value="esc-pos">ESC/POS (Epson/Bematech)</option>
                  <option value="windows-driver">Windows Driver (Spooler)</option>
                  <option value="star-line">Star Line Mode</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-[#1e293b]">
              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Largura da Bobina</label>
                <div className="flex bg-[#161b22] p-1 rounded-xl border border-[#1e293b]">
                  {(['58mm', '80mm'] as const).map((width) => (
                    <button
                      key={width}
                      onClick={() => handleChange('paperWidth', width)}
                      className={`flex-1 py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${settings.paperWidth === width ? 'text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                      style={settings.paperWidth === width ? { backgroundColor: '#ff3d03' } : {}}
                    >
                      {width}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Comandos de Saída</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => handleChange('cutPaper', !settings.cutPaper)}
                    className={`flex items-center justify-center gap-2 py-3.5 rounded-xl border transition-all text-[10px] font-bold uppercase tracking-tighter ${settings.cutPaper ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-slate-800/50 border-slate-700 text-slate-500'}`}
                  >
                    Guilhotina
                  </button>
                  <button 
                    onClick={() => handleChange('alertSound', !settings.alertSound)}
                    className={`flex items-center justify-center gap-2 py-3.5 rounded-xl border transition-all text-[10px] font-bold uppercase tracking-tighter ${settings.alertSound ? 'bg-blue-500/10 border-blue-500/30 text-blue-500' : 'bg-slate-800/50 border-slate-700 text-slate-500'}`}
                  >
                    Beep Alerta
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#0d1117] border border-[#1e293b] rounded-[1.5rem] p-8 shadow-xl">
             <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-6" style={{ color: '#ff3d03' }}>Controle de Vias (Cópias)</h4>
             <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <p className="text-sm font-bold text-gray-200">Via da Cozinha</p>
                    <span className="text-2xl font-bold" style={{ color: '#ff3d03' }}>{settings.copiesKitchen}x</span>
                  </div>
                  <input 
                    type="range" min="0" max="5" 
                    value={settings.copiesKitchen}
                    onChange={(e) => handleChange('copiesKitchen', parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                    style={{ accentColor: '#ff3d03' }}
                  />
                  <p className="text-[10px] text-gray-500 font-medium">Impressão focada em itens e observações de preparo.</p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <p className="text-sm font-bold text-gray-200">Via do Cliente</p>
                    <span className="text-2xl font-bold" style={{ color: '#ff3d03' }}>{settings.copiesDelivery}x</span>
                  </div>
                  <input 
                    type="range" min="1" max="5" 
                    value={settings.copiesDelivery}
                    onChange={(e) => handleChange('copiesDelivery', parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                    style={{ accentColor: '#ff3d03' }}
                  />
                  <p className="text-[10px] text-gray-500 font-medium">Ticket completo com endereço e dados de pagamento.</p>
                </div>
             </div>
          </div>
        </div>

        {/* Coluna 2: Informações e Status */}
        <div className="space-y-8">
          <div className="bg-gradient-to-br from-[#0d1117] to-[#05070a] border border-[#1e293b] rounded-[1.5rem] p-8 shadow-xl">
            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-6">Status em Tempo Real</h4>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Pronta para Uso</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Sem erros detectados</p>
                </div>
              </div>

              <div className="p-4 bg-white/5 rounded-xl border border-white/5 space-y-2">
                 <div className="flex justify-between text-[10px] font-bold uppercase">
                    <span className="text-gray-500">Porta</span>
                    <span className="text-gray-300">USB001 / VIRTUAL</span>
                 </div>
                 <div className="flex justify-between text-[10px] font-bold uppercase">
                    <span className="text-gray-500">Velocidade</span>
                    <span className="text-gray-300">9600 BPS</span>
                 </div>
              </div>
            </div>
          </div>

          <div className="p-8 bg-[#ff3d03]/5 border border-[#ff3d03]/10 rounded-2xl space-y-4">
            <h5 className="text-sm font-bold uppercase tracking-widest" style={{ color: '#ff3d03' }}>Dica Operacional</h5>
            <p className="text-xs text-gray-400 leading-relaxed font-medium">
              Para impressoras **Ethernet**, certifique-se que o IP do terminal está na mesma sub-rede da impressora. Recomendamos o uso de IPs estáticos.
            </p>
          </div>

          <button 
            onClick={() => window.print()}
            className="w-full flex items-center justify-center gap-3 bg-white text-black hover:bg-gray-200 rounded-xl py-5 text-sm font-bold uppercase tracking-widest transition-all shadow-xl"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Imprimir Cupom Teste
          </button>
        </div>

      </div>
    </div>
  );
};

export default PrinterSettingsPanel;
