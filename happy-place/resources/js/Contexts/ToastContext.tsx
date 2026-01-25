import React, { createContext, useState, useCallback, useEffect } from 'react';
import type { Toast, ToastContextType } from '@/types/toast';

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
    children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [settings, setSettings] = useState<any>({});

    const updateSettings = useCallback((newSettings: any) => {
        setSettings(newSettings);
    }, []);

    const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
        // Check if browser notifications are enabled
        if (settings && settings.browser_notifications === false) {
            console.log('Toast suppressed by settings');
            return;
        }

        const id = crypto.randomUUID();
        const newToast: Toast = { ...toast, id };

        setToasts((prev) => {
            const updated = [...prev, newToast];
            // Limitar a 5 toasts
            return updated.slice(-5);
        });

        // Auto-dismiss
        const duration = toast.duration ?? 5000;
        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    }, [settings]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const clearAll = useCallback(() => {
        setToasts([]);
    }, []);

    // Listen for global toast events
    useEffect(() => {
        const handleGlobalToast = (e: CustomEvent) => {
            addToast(e.detail);
        };

        window.addEventListener('global-toast', handleGlobalToast as EventListener);

        return () => {
            window.removeEventListener('global-toast', handleGlobalToast as EventListener);
        };
    }, [addToast]);

    const value: ToastContextType = {
        toasts,
        addToast,
        removeToast,
        clearAll,
        updateSettings,
    };

    return (
        <ToastContext.Provider value={value}>
            {children}
        </ToastContext.Provider>
    );
};
