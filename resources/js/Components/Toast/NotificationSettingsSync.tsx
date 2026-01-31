import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { useToast } from '@/Hooks/useToast';

export function NotificationSettingsSync() {
    const { tenant } = usePage<any>().props;
    const { updateSettings } = useToast();

    useEffect(() => {
        if (tenant?.notification_settings && updateSettings) {
            updateSettings(tenant.notification_settings);
        }
    }, [tenant, updateSettings]);

    return null;
}
