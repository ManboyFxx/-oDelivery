import React, { createContext, useState, useCallback, useEffect, useRef } from 'react';
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

    const lastToastRef = useRef<{ title: string; description: string; timestamp: number } | null>(null);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
        // Check if browser notifications are enabled
        if (settings && settings.browser_notifications === false) {
            console.log('Toast suppressed by settings');
            return;
        }

        // Deduplication logic: ignore duplicates within 1.5 seconds
        const now = Date.now();
        const normalize = (str: string) => (str || '').toLowerCase().replace(/[!.?]/g, '').trim();
        
        const currentDesc = normalize(toast.description);
        const lastDesc = lastToastRef.current ? normalize(lastToastRef.current.description) : '';

        if (
            lastToastRef.current &&
            currentDesc === lastDesc &&
            now - lastToastRef.current.timestamp < 1500
        ) {
            console.log('Duplicate toast suppressed (fuzzy match)');
            return;
        }

        const id = crypto.randomUUID();
        const newToast: Toast = { ...toast, id };

        lastToastRef.current = {
            title: toast.title,
            description: toast.description,
            timestamp: now,
        };

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

    }, [settings, removeToast]);


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

    // Compute sound setting from persisted settings (defaults to true)
    const soundEnabled = settings?.sound_enabled !== false;

    const value: ToastContextType = {
        toasts,
        addToast,
        removeToast,
        clearAll,
        updateSettings,
        soundEnabled,
    };

    return (
        <ToastContext.Provider value={value}>
            {children}
        </ToastContext.Provider>
    );
};
