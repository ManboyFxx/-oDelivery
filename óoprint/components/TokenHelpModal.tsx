
import React from 'react';

interface TokenHelpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const TokenHelpModal: React.FC<TokenHelpModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[#30363d] bg-[#0d1117]">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        🔑 Como obter seu Token de Acesso
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-[#30363d] rounded-lg"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">

                    {/* Step 1 */}
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#ff3d03]/10 text-[#ff3d03] flex items-center justify-center font-bold border border-[#ff3d03]/20">1</div>
                        <div>
                            <h4 className="text-white font-bold mb-1">Acesse o Painel Administrativo</h4>
                            <p className="text-gray-400 text-sm">Faça login no seu painel OoDelivery e navegue até o menu lateral.</p>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#ff3d03]/10 text-[#ff3d03] flex items-center justify-center font-bold border border-[#ff3d03]/20">2</div>
                        <div>
                            <h4 className="text-white font-bold mb-1">Vá em Configurações <span className="text-[#ff3d03]">→</span> Impressoras</h4>
                            <p className="text-gray-400 text-sm">
                                No menu "Configurações", clique na opção "Impressoras" ou "Integrações".
                                Lá você encontrará a seção de Tokens de Acesso.
                            </p>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#ff3d03]/10 text-[#ff3d03] flex items-center justify-center font-bold border border-[#ff3d03]/20">3</div>
                        <div>
                            <h4 className="text-white font-bold mb-1">Gere ou Copie o Token</h4>
                            <p className="text-gray-400 text-sm mb-3">
                                Clique no botão "Gerar Novo Token" se ainda não tiver um, ou clique no ícone de cópia ao lado do token existente.
                            </p>

                            <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4 relative group">
                                <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-bold">Exemplo de Dashboard</div>
                                <div className="aspect-video bg-[#1c2128] rounded border border-[#30363d] flex flex-col items-center justify-center gap-2 relative overflow-hidden">
                                    <div className="w-3/4 h-2 bg-[#30363d] rounded"></div>
                                    <div className="w-1/2 h-2 bg-[#30363d] rounded"></div>
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#ff3d03]/20 text-[#ff3d03] px-3 py-1 rounded text-xs font-bold border border-[#ff3d03]/30">
                                        Botão "Gerar Token"
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-[#30363d] bg-[#0d1117] flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-[#ff3d03] hover:bg-[#ff6b35] text-white font-bold rounded-lg transition-colors text-sm uppercase tracking-wide"
                    >
                        Entendi, vou buscar!
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TokenHelpModal;
