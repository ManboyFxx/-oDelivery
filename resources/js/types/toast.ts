export type ToastVariant = 'success' | 'warning' | 'info' | 'error';
export type ToastStyleVariant = 'default' | 'filled';

export interface Toast {
    id: string;
    variant: ToastVariant;
    styleVariant?: ToastStyleVariant;
    title: string;
    description: string;
    duration?: number; // ms, default 5000
}

export interface ToastContextType {
    toasts: Toast[];
    addToast: (toast: Omit<Toast, 'id'>) => void;
    removeToast: (id: string) => void;
    clearAll: () => void;
    updateSettings?: (settings: any) => void;
    soundEnabled: boolean;
}
