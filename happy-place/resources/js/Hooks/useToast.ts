import { useContext } from 'react';
import { ToastContext } from '@/Contexts/ToastContext';
import type { ToastVariant, ToastStyleVariant } from '@/types/toast';

export const useToast = () => {
    const context = useContext(ToastContext);

    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }

    // Helper methods for common toast types
    const success = (title: string, description: string, styleVariant?: ToastStyleVariant, duration?: number) =>
        context.addToast({ variant: 'success', title, description, styleVariant, duration });

    const error = (title: string, description: string, styleVariant?: ToastStyleVariant, duration?: number) =>
        context.addToast({ variant: 'error', title, description, styleVariant, duration });

    const warning = (title: string, description: string, styleVariant?: ToastStyleVariant, duration?: number) =>
        context.addToast({ variant: 'warning', title, description, styleVariant, duration });

    const info = (title: string, description: string, styleVariant?: ToastStyleVariant, duration?: number) =>
        context.addToast({ variant: 'info', title, description, styleVariant, duration });

    return {
        ...context,
        success,
        error,
        warning,
        info,
    };
};
