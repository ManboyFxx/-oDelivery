
import React from 'react';
import { CouponConfig } from '../types';

interface CouponConfigPanelProps {
  config: CouponConfig;
  setConfig: React.Dispatch<React.SetStateAction<CouponConfig>>;
}

const CouponConfigPanel: React.FC<CouponConfigPanelProps> = ({ config, setConfig }) => {
  const handleChange = (field: keyof CouponConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const getSeparatorChar = () => {
    if (config.separatorStyle === 'solid') return '_________________';
    if (config.separatorStyle === 'dashed') return '-----------------';
    return '.................';
  };

  return (
    <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 animate-in fade-in duration-500 font-sans">
      <div className="space-y-8">
        <div className="space-y-1">
          <h3 className="text-2xl font-bold text-white tracking-tight">Customização do Cupom</h3>
          <p className="text-gray-400 text-sm">Configure o layout e as informações que aparecem no ticket impresso.</p>
        </div>

        <div className="bg-[#0d1117] border border-[#1e293b] rounded-[1.5rem] p-6 space-y-8 shadow-xl">
          {/* Identidade */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold text-orange-500 uppercase tracking-[0.2em]">Identidade Visual</h4>
            <div className="grid gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400">Título Principal</label>
                <input
                  type="text"
                  placeholder="Nome do seu estabelecimento"
                  value={config.headerText}
                  onChange={(e) => handleChange('headerText', e.target.value)}
                  className="w-full bg-[#05070a] border border-[#1e293b] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400">Rodapé</label>
                <input
                  type="text"
                  placeholder="Mensagem de agradecimento..."
                  value={config.footerText}
                  onChange={(e) => handleChange('footerText', e.target.value)}
                  className="w-full bg-[#05070a] border border-[#1e293b] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Ajustes de Papel */}
          <div className="space-y-4 pt-6 border-t border-[#1e293b]">
            <h4 className="text-[10px] font-bold text-orange-500 uppercase tracking-[0.2em]">Ajustes de Impressão</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400">Tamanho da Fonte</label>
                <select
                  value={config.fontSize}
                  onChange={(e) => handleChange('fontSize', e.target.value)}
                  className="w-full bg-[#05070a] border border-[#1e293b] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 appearance-none"
                >
                  <option value="small">Pequena</option>
                  <option value="medium">Média</option>
                  <option value="large">Grande</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-400">Margem Esquerda (mm)</label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={config.leftMargin}
                  onChange={(e) => handleChange('leftMargin', parseInt(e.target.value) || 0)}
                  className="w-full bg-[#05070a] border border-[#1e293b] rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Opções de Conteúdo */}
          <div className="space-y-3 pt-6 border-t border-[#1e293b]">
            <h4 className="text-[10px] font-bold text-orange-500 uppercase tracking-[0.2em]">Informações do Pedido</h4>

            {[
              { id: 'highlightOrderNumber', label: 'Destacar Número do Pedido' },
              { id: 'showCustomerPhone', label: 'Exibir Telefone' },
              { id: 'showObservations', label: 'Exibir Opcionais e Complementos' },
              { id: 'showItemPrices', label: 'Exibir Preço por Item' },
              { id: 'upperCaseOnly', label: 'Apenas Maiúsculas' },
              { id: 'condensedMode', label: 'Modo Condensado (Hardware)' },
            ].map(item => (
              <label key={item.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-transparent hover:border-white/5 cursor-pointer transition-all group">
                <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">{item.label}</span>
                <button
                  onClick={() => handleChange(item.id as keyof CouponConfig, !config[item.id as keyof CouponConfig])}
                  className={`w-9 h-5 rounded-full relative transition-all ${config[item.id as keyof CouponConfig] ? 'bg-orange-500' : 'bg-slate-700'}`}
                >
                  <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${config[item.id as keyof CouponConfig] ? 'left-5' : 'left-1'}`} />
                </button>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center">
        <div className="w-full mb-6">
          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-widest text-center lg:text-right">Prévia de Impressão</h4>
        </div>

        <div className={`bg-white text-black p-6 shadow-2xl w-full max-w-[320px] font-mono leading-tight border border-gray-200 ${config.upperCaseOnly ? 'uppercase' : ''} ${config.fontSize === 'small' ? 'text-[10px]' : config.fontSize === 'large' ? 'text-[14px]' : 'text-[12px]'}`} style={{ marginLeft: `${config.leftMargin * 4}px` }}>
          <div className="text-center space-y-1 mb-4">
            <p className="font-bold text-base">{config.headerText || 'ÓOPRINT SISTEMA'}</p>
            <p className="text-[9px]">SISTEMA DE IMPRESSÃO AUTOMÁTICO</p>
            <p className="text-[10px] opacity-50">{getSeparatorChar()}</p>
          </div>

          <div className="mb-4">
            {config.highlightOrderNumber ? (
              <div className="border-y border-black py-2 my-1 text-center font-bold text-2xl">
                PEDIDO #9281
              </div>
            ) : (
              <p className="font-bold">PEDIDO: #9281</p>
            )}
            <p className="text-[10px]">DATA: 25/05/2024 20:15:33</p>
          </div>

          <div className="mb-4">
            <p className="font-bold">CLIENTE: RICARDO OLIVEIRA</p>
            {config.showCustomerPhone && <p>TEL: (11) 98765-4321</p>}
            <p className="text-[10px] mt-1">RUA DAS FLORES, 123 - AP 42</p>
            <p className="text-[10px]">BAIRRO: CENTRO - SÃO PAULO/SP</p>
          </div>

          <p className="text-[10px] opacity-50 mb-2">{getSeparatorChar()}</p>

          <div className="my-2 space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between font-bold">
                <span className="flex-1">1X BURGER GOURMET MASTER</span>
                {config.showItemPrices && <span className="ml-2">34.90</span>}
              </div>
              {config.showObservations && (
                <div className="pl-4 space-y-0.5 text-[10px] text-black font-medium">
                  <p>+ ADICIONAL BACON</p>
                  <p>+ QUEIJO CHEDDAR</p>
                  <p className="italic">&gt;&gt; CARNE MAL PASSADA</p>
                </div>
              )}
            </div>
          </div>

          <p className="text-[10px] opacity-50 mb-2">{getSeparatorChar()}</p>

          <div className="space-y-1 font-bold">
            <div className="flex justify-between">
              <span>SUBTOTAL:</span>
              <span>52.90</span>
            </div>
            <div className="flex justify-between">
              <span>TAXA ENTREGA:</span>
              <span>6.00</span>
            </div>
            <div className="flex justify-between text-orange-600">
              <span>ACRÉSC. MAQUINETA:</span>
              <span>4.00</span>
            </div>
            <div className="flex justify-between text-base pt-1 border-t border-black mt-1">
              <span>TOTAL GERAL:</span>
              <span>R$ 62.90</span>
            </div>
          </div>

          <div className="mt-4 border border-black p-1.5 text-center font-bold text-[11px] bg-gray-50 uppercase">
            PAGTO: CARTÃO DE CRÉDITO
          </div>

          <div className="mt-6 text-center space-y-2">
            <p className="italic text-[10px] px-2">{config.footerText}</p>
            <div className="flex justify-center items-center gap-2 opacity-30">
              <div className="h-[1px] bg-black flex-1"></div>
              <p className="text-[7px] uppercase tracking-tighter shrink-0">ÓoPrint Sistema v2.4</p>
              <div className="h-[1px] bg-black flex-1"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CouponConfigPanel;
