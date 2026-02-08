import Modal from '@/Components/Modal';
import { useState } from 'react';
import { AlertTriangle, ArrowRight, Gift, MessageSquare, Check, X, ShieldAlert } from 'lucide-react';

interface Props {
    show: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    currentPlanName: string;
    processing?: boolean;
}

export default function DowngradeModal({
    show,
    onClose,
    onConfirm,
    currentPlanName,
    processing = false
}: Props) {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [reason, setReason] = useState('');
    const [otherReason, setOtherReason] = useState('');

    const handleClose = () => {
        setStep(1);
        setReason('');
        setOtherReason('');
        onClose();
    };

    const handleConfirm = () => {
        const finalReason = reason === 'Outro' ? otherReason : reason;
        onConfirm(finalReason);
    };

    const handleAcceptOffer = () => {
        // Here you would implement the logic to apply the discount
        // For now, we'll just close the modal as if they accepted (or redirect to a WhatsApp link to claim)
        window.open('https://wa.me/55999999999?text=Olá, quero aceitar a oferta de retencão de 30% de desconto no ÓoDelivery!', '_blank');
        handleClose();
    };

    return (
        <Modal show={show} onClose={handleClose} maxWidth="lg">
            {/* STEP 1: IMPACT ANALYSIS */}
            {step === 1 && (
                <div className="p-6">
                    <div className="flex justify-center mb-6">
                        <div className="bg-red-100 p-4 rounded-full">
                            <AlertTriangle className="w-8 h-8 text-red-600" />
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
                        Tem certeza que deseja mudar?
                    </h2>
                    <p className="text-gray-500 text-center mb-8">
                        Ao voltar para o plano Gratuito, você perderá acesso imediato a recursos vitais para seu delivery.
                    </p>

                    <div className="bg-red-50 rounded-xl p-5 border border-red-100 mb-8 space-y-3">
                        <h3 className="text-sm font-bold text-red-800 uppercase tracking-wide mb-2">
                            O que será desativado:
                        </h3>
                        <div className="flex items-start gap-3 text-red-700">
                            <X className="w-5 h-5 shrink-0" />
                            <span>Integração com <strong>WhatsApp (ÓoBot)</strong></span>
                        </div>
                        <div className="flex items-start gap-3 text-red-700">
                            <X className="w-5 h-5 shrink-0" />
                            <span>Gestão de <strong>Motoboys</strong> e Rastreamento</span>
                        </div>
                        <div className="flex items-start gap-3 text-red-700">
                            <X className="w-5 h-5 shrink-0" />
                            <span>Limite reduzido para <strong>100 produtos</strong></span>
                        </div>
                        <div className="flex items-start gap-3 text-red-700">
                            <X className="w-5 h-5 shrink-0" />
                            <span>Impressão Automática <strong>(ÓoPrint)</strong></span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={handleClose}
                            className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors"
                        >
                            Manter meu plano {currentPlanName}
                        </button>
                        <button
                            onClick={() => setStep(2)}
                            className="w-full py-3 text-gray-500 font-medium hover:text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                        >
                            Entendo os riscos, quero continuar
                        </button>
                    </div>
                </div>
            )}

            {/* STEP 2: RETENTION OFFER */}
            {step === 2 && (
                <div className="p-6 bg-gradient-to-br from-white to-orange-50/50">
                    <div className="flex justify-center mb-6">
                        <div className="bg-orange-100 p-4 rounded-full shadow-lg shadow-orange-100/50 animate-bounce">
                            <Gift className="w-8 h-8 text-[#ff3d03]" />
                        </div>
                    </div>

                    <h2 className="text-2xl font-black text-center text-gray-900 mb-2">
                        Espere! Temos uma proposta
                    </h2>
                    <p className="text-gray-600 text-center mb-8 font-medium">
                        Não queremos perder você. Que tal um desconto exclusivo para continuar crescendo com a gente?
                    </p>

                    <div className="bg-white rounded-2xl p-6 border-2 border-[#ff3d03]/10 shadow-xl shadow-orange-100 mb-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-[#ff3d03] text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                            OFERTA ÚNICA
                        </div>
                        <div className="text-center">
                            <span className="block text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">
                                Desconto de Retenção
                            </span>
                            <div className="text-5xl font-black text-[#ff3d03] mb-2">
                                30% OFF
                            </div>
                            <p className="text-gray-600">
                                Nos próximos <strong>3 meses</strong> no plano {currentPlanName}.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={handleAcceptOffer}
                            className="w-full py-3 bg-[#ff3d03] text-white rounded-xl font-bold hover:bg-[#d13302] transition-colors shadow-lg shadow-[#ff3d03]/20"
                        >
                            Aceitar oferta e continuar
                        </button>
                        <button
                            onClick={() => setStep(3)}
                            className="w-full py-3 text-gray-400 font-medium hover:text-gray-600 transition-colors text-sm"
                        >
                            Não obrigado, quero cancelar os benefícios
                        </button>
                    </div>
                </div>
            )}

            {/* STEP 3: FEEDBACK & CONFIRMATION */}
            {step === 3 && (
                <div className="p-6">
                    <div className="flex justify-center mb-6">
                        <div className="bg-gray-100 p-4 rounded-full">
                            <MessageSquare className="w-8 h-8 text-gray-500" />
                        </div>
                    </div>

                    <h2 className="text-xl font-bold text-center text-gray-900 mb-2">
                        Poxa, que pena...
                    </h2>
                    <p className="text-gray-500 text-center mb-6 text-sm">
                        Para finalizarmos, você poderia nos contar o motivo? Isso nos ajuda a melhorar.
                    </p>

                    <div className="space-y-3 mb-8">
                        {[
                            'Valor muito alto para mim',
                            'Não usei todos os recursos',
                            'Faltou alguma funcionalidade',
                            'Problemas técnicos / Bugs',
                            'Fechei meu estabelecimento',
                            'Outro'
                        ].map((r) => (
                            <label
                                key={r}
                                className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all ${reason === r
                                        ? 'border-[#ff3d03] bg-orange-50 text-[#ff3d03] font-bold shadow-sm'
                                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="reason"
                                    value={r}
                                    checked={reason === r}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="hidden"
                                />
                                <span className="flex-1">{r}</span>
                                {reason === r && <Check className="w-4 h-4" />}
                            </label>
                        ))}

                        {reason === 'Outro' && (
                            <textarea
                                value={otherReason}
                                onChange={(e) => setOtherReason(e.target.value)}
                                placeholder="Conte mais detalhes se puder..."
                                className="w-full rounded-xl border-gray-300 shadow-sm focus:border-[#ff3d03] focus:ring-[#ff3d03]"
                                rows={2}
                            ></textarea>
                        )}
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={handleConfirm}
                            disabled={!reason || processing}
                            className="w-full py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {processing ? 'Processando...' : 'Confirmar Downgrade'}
                        </button>
                        <button
                            onClick={handleClose}
                            className="w-full py-3 text-gray-500 font-medium hover:text-gray-700 transition-colors"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
        </Modal>
    );
}
