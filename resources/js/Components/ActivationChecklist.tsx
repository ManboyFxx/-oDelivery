import { Link } from '@inertiajs/react';
import { CheckCircle2, Circle, ArrowRight, ShoppingBag, MessageSquare, Smartphone, Trophy } from 'lucide-react';
import clsx from 'clsx';

interface Props {
    hasProducts: boolean;
    hasOrders: boolean;
    whatsappConnected: boolean;
}

export default function ActivationChecklist({ hasProducts, hasOrders, whatsappConnected }: Props) {
    const steps = [
        {
            id: 'account',
            title: 'Criar sua conta',
            description: 'Parabéns! Você já deu o primeiro passo.',
            completed: true, // Always true if seeing this
            icon: Trophy,
            link: null,
            action: null
        },
        {
            id: 'product',
            title: 'Cadastrar primeiro produto',
            description: 'Adicione itens deliciosos ao seu cardápio.',
            completed: hasProducts,
            icon: ShoppingBag,
            link: route('products.create'),
            action: 'Cadastrar Produto'
        },
        {
            id: 'whatsapp',
            title: 'Conectar WhatsApp',
            description: 'Automatize o atendimento com o ÓoBot.',
            completed: whatsappConnected,
            icon: MessageSquare,
            link: route('whatsapp.index'), // Assuming admin/whatsapp route exists or is accessible
            action: 'Conectar Agora'
        },
        {
            id: 'order',
            title: 'Realizar pedido teste',
            description: 'Simule a experiência do seu cliente.',
            completed: hasOrders,
            icon: Smartphone,
            link: route('pdv.index'), // Or external link to store
            action: 'Abrir PDV / Loja'
        }
    ];

    const completedCount = steps.filter(s => s.completed).length;
    const progress = (completedCount / steps.length) * 100;
    const isFullyActive = progress === 100;

    if (isFullyActive) return null; // Don't show if done

    return (
        <div className="bg-white dark:bg-[#1a1b1e] rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-sm mb-6 relative overflow-hidden">
            <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between mb-6 relative z-10">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        🚀 Vamos ativar sua loja!
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                        Complete os passos abaixo para começar a vender de verdade.
                    </p>
                </div>

                <div className="flex items-center gap-3 bg-gray-50 dark:bg-white/5 px-4 py-2 rounded-xl">
                    <div className="text-right">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Progresso</span>
                        <p className="text-lg font-black text-[#ff3d03]">{Math.round(progress)}%</p>
                    </div>
                    <div className="w-12 h-12 relative flex items-center justify-center">
                        <svg className="transform -rotate-90 w-full h-full">
                            <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-200 dark:text-gray-700" />
                            <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-[#ff3d03]" strokeDasharray={113} strokeDashoffset={113 - (113 * progress) / 100} />
                        </svg>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
                {steps.map((step, i) => (
                    <div
                        key={step.id}
                        className={clsx(
                            "p-4 rounded-2xl border transition-all duration-300 relative group",
                            step.completed
                                ? "bg-green-50 border-green-100 dark:bg-green-900/10 dark:border-green-900/20"
                                : "bg-gray-50 border-gray-100 dark:bg-white/5 dark:border-white/5 hover:border-[#ff3d03]/30"
                        )}
                    >
                        <div className="flex justify-between items-start mb-3">
                            <div className={clsx(
                                "p-2 rounded-lg",
                                step.completed ? "bg-green-200 text-green-700" : "bg-white dark:bg-white/10 text-gray-400"
                            )}>
                                <step.icon className="w-5 h-5" />
                            </div>
                            {step.completed ? (
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                            ) : (
                                <Circle className="w-5 h-5 text-gray-300" />
                            )}
                        </div>

                        <h4 className={clsx("font-bold text-sm mb-1", step.completed ? "text-green-800 dark:text-green-400" : "text-gray-900 dark:text-white")}>
                            {step.title}
                        </h4>
                        <p className="text-xs text-gray-500 mb-4 line-clamp-2">
                            {step.description}
                        </p>

                        {!step.completed && step.link && (
                            <Link
                                href={step.link}
                                className="inline-flex items-center gap-1 text-xs font-bold text-[#ff3d03] hover:underline"
                            >
                                {step.action} <ArrowRight className="w-3 h-3" />
                            </Link>
                        )}
                    </div>
                ))}
            </div>

            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-100/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        </div>
    );
}
