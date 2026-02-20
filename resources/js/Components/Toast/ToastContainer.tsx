import { AnimatePresence } from 'framer-motion';
import { AlertToast } from './AlertToast';
import { useToast } from '@/Hooks/useToast';
import { cn } from '@/lib/utils';

export interface ToastContainerProps {
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
    maxToasts?: number;
}

const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
};

export function ToastContainer({ position = 'top-right', maxToasts = 5 }: ToastContainerProps) {
    const { toasts, removeToast } = useToast();

    // Limit toasts displayed
    const displayedToasts = toasts.slice(-maxToasts);

    return (
        <div
            className={cn(
                'fixed z-[9999] flex flex-col gap-3 pointer-events-none p-4 rounded-3xl transition-all duration-500',
                positionClasses[position],
                displayedToasts.length > 0 && 'bg-white/5 dark:bg-black/10 backdrop-blur-md border border-gray-200/20 dark:border-white/5 shadow-2xl shadow-black/5'
            )}
            aria-live="polite"
            aria-atomic="true"
        >
            <AnimatePresence mode="popLayout">
                {displayedToasts.map((toast) => (
                    <div key={toast.id} className="pointer-events-auto">
                        <AlertToast
                            variant={toast.variant}
                            styleVariant={toast.styleVariant}
                            title={toast.title}
                            description={toast.description}
                            onClose={() => removeToast(toast.id)}
                        />
                    </div>
                ))}
            </AnimatePresence>
        </div>
    );
}
