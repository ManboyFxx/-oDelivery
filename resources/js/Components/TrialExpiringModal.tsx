import { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { X, Clock, Sparkles, ArrowRight } from 'lucide-react';

interface Props {
    daysRemaining: number;
    planName?: string;
    onClose?: () => void;
}

export default function TrialExpiringModal({ daysRemaining, planName = 'Básico', onClose }: Props) {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Check if modal was dismissed today
        const dismissedAt = localStorage.getItem('trial_modal_dismissed_at');
        const today = new Date().toDateString();

        if (dismissedAt !== today && daysRemaining <= 3 && daysRemaining > 0) {
            // Show modal after a short delay
            const timer = setTimeout(() => setIsOpen(true), 2000);
            return () => clearTimeout(timer);
        }
    }, [daysRemaining]);

    const handleClose = () => {
        setIsOpen(false);
        localStorage.setItem('trial_modal_dismissed_at', new Date().toDateString());
        onClose?.();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-300">
                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Icon */}
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                        <Clock className="w-8 h-8 text-[#ff3d03]" />
                    </div>
                </div>

                {/* Content */}
                <div className="text-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                        Seu período de teste termina em {daysRemaining} {daysRemaining === 1 ? 'dia' : 'dias'}!
                    </h2>
                    <p className="text-gray-500 text-sm">
                        Você está aproveitando recursos do plano {planName}.
                        Para continuar com acesso completo, escolha um plano.
                    </p>
                </div>

                {/* Offer */}
                <div className="bg-gradient-to-r from-[#ff3d03]/10 to-orange-100 rounded-xl p-4 mb-6">
                    <div className="flex items-center gap-3">
                        <Sparkles className="w-5 h-5 text-[#ff3d03]" />
                        <div>
                            <p className="text-sm font-bold text-gray-900">
                                Oferta especial: 20% OFF no primeiro mês!
                            </p>
                            <p className="text-xs text-gray-600">
                                Use o código: <span className="font-mono font-bold">TRIAL20</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={handleClose}
                        className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all text-sm"
                    >
                        Lembrar depois
                    </button>
                    <Link
                        href={route('subscription.upgrade')}
                        className="flex-1 py-3 px-4 bg-[#ff3d03] hover:bg-[#e63700] text-white font-bold rounded-xl transition-all text-sm flex items-center justify-center gap-2"
                    >
                        Ver Planos
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
