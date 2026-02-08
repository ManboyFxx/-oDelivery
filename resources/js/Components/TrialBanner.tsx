import { Link } from '@inertiajs/react';
import { Clock, AlertTriangle, Sparkles, ArrowRight } from 'lucide-react';
import clsx from 'clsx';

interface Props {
    daysRemaining: number;
    planName?: string;
}

export default function TrialBanner({ daysRemaining, planName = 'Pro' }: Props) {
    // Determine state based on days remaining
    // > 7 days: Info (Blue) - usually trial is 7 days, so maybe this is mostly for extended trials
    // 3-7 days: Info (Blue)
    // 1-3 days: Warning (Orange)
    // 0 or less: Critical (Red)

    if (daysRemaining > 30) return null; // Don't show if it's a very long trial or verified account

    const isCritical = daysRemaining <= 1;
    const isWarning = daysRemaining <= 3 && daysRemaining > 1;

    // Configurações visuais por estado
    const config = isCritical ? {
        bg: "bg-red-600",
        border: "border-red-700",
        icon: AlertTriangle,
        text: "text-white",
        button: "bg-white text-red-600 hover:bg-red-50"
    } : isWarning ? {
        bg: "bg-orange-500",
        border: "border-orange-600",
        icon: Clock,
        text: "text-white",
        button: "bg-white text-orange-600 hover:bg-orange-50"
    } : {
        bg: "bg-blue-600",
        border: "border-blue-700",
        icon: Sparkles,
        text: "text-white",
        button: "bg-white text-blue-600 hover:bg-blue-50"
    };

    const Icon = config.icon;

    return (
        <div className={clsx(
            "w-full px-4 py-3 shadow-md relative z-40 transition-colors duration-300",
            config.bg,
            config.text
        )}>
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">

                <div className="flex items-center gap-3 text-center sm:text-left">
                    <div className="p-1.5 bg-white/20 rounded-lg shrink-0 hidden sm:block">
                        <Icon className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="font-bold text-base leading-tight">
                            {daysRemaining <= 0
                                ? "Seu período de teste acabou!"
                                : `Você tem ${daysRemaining} dias de teste no plano ${planName}.`
                            }
                        </p>
                        <p className="opacity-90 text-xs sm:text-sm">
                            {daysRemaining <= 0
                                ? "Faça o upgrade agora para continuar vendendo sem interrupções."
                                : "Aproveite todos os recursos liberados para configurar sua loja."
                            }
                        </p>
                    </div>
                </div>

                <Link
                    href={route('subscription.index')}
                    className={clsx(
                        "whitespace-nowrap px-5 py-2 rounded-lg font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center gap-2 group",
                        config.button
                    )}
                >
                    {daysRemaining <= 0 ? "Reativar Agora" : "Assinar com Desconto"}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
            </div>
        </div>
    );
}
