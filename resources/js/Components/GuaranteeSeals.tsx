import { Check, Shield } from 'lucide-react';
import { useState } from 'react';

interface GuaranteeSeal {
    icon: React.ReactNode;
    title: string;
    description: string;
    tooltip: string;
}

export default function GuaranteeSeals() {
    const [tooltipOpen, setTooltipOpen] = useState<string | null>(null);

    const seals: GuaranteeSeal[] = [
        {
            icon: <Check className="h-5 w-5 text-green-600" />,
            title: '7 Dias de Garantia',
            description: 'Sem satisfeito, reembolso total',
            tooltip: 'Se não estiver satisfeito, devolvemos 100% do seu pagamento nos primeiros 7 dias. Sem perguntas.',
        },
        {
            icon: <Shield className="h-5 w-5 text-blue-600" />,
            title: 'Cancele Quando Quiser',
            description: 'Sem fidelidade',
            tooltip: 'Não há contrato de fidelidade. Cancele sua assinatura a qualquer momento sem multas ou taxas escondidas.',
        },
    ];

    return (
        <div className="flex justify-center items-center gap-6 mt-6 flex-wrap">
            {seals.map((seal) => (
                <div
                    key={seal.title}
                    className="relative flex items-center gap-3 px-4 py-2 rounded-lg bg-gray-50 border border-gray-200"
                >
                    {seal.icon}
                    <div>
                        <div className="text-xs font-bold text-gray-900">{seal.title}</div>
                        <div className="text-xs text-gray-500">{seal.description}</div>
                    </div>

                    {/* Tooltip */}
                    <button
                        type="button"
                        className="ml-1 h-5 w-5 rounded-full bg-gray-300 text-white flex items-center justify-center text-xs font-bold hover:bg-gray-400 transition-colors relative group"
                        onMouseEnter={() => setTooltipOpen(seal.title)}
                        onMouseLeave={() => setTooltipOpen(null)}
                        onClick={() => setTooltipOpen(tooltipOpen === seal.title ? null : seal.title)}
                        aria-label={`Mais informações sobre ${seal.title}`}
                    >
                        ?
                        {(tooltipOpen === seal.title) && (
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs rounded-lg py-2 px-3 w-48 z-50 pointer-events-none">
                                {seal.tooltip}
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                            </div>
                        )}
                    </button>
                </div>
            ))}
        </div>
    );
}
