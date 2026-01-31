import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { useToast } from './useToast';

/**
 * Hook to automatically display flash messages from Laravel backend
 * Usage: Simply call useFlashToast() in any page component
 */
export const useFlashToast = () => {
    const { toast } = usePage().props as any;
    const { addToast } = useToast();

    useEffect(() => {
        if (toast) {
            addToast(toast);
        }
    }, [toast, addToast]);
};
