import { useEffect } from 'react';
import axios from 'axios';

declare global {
    interface Window {
        OneSignal: any;
    }
}

export const usePushNotifications = (user: any) => {
    useEffect(() => {
        if (typeof window !== 'undefined' && window.OneSignal && user) {
            window.OneSignal.push(async () => {
                // OneSignal v16 uses a different approach for subscription changes
                window.OneSignal.User.PushSubscription.addEventListener('change', (event: any) => {
                    if (event.current.token) {
                        syncSubscription(window.OneSignal.User.PushSubscription.id);
                    }
                });

                // Check current status
                if (window.OneSignal.User.PushSubscription.id) {
                    syncSubscription(window.OneSignal.User.PushSubscription.id);
                }
            });
        }
    }, [user]);

    const syncSubscription = async (playerId: string) => {
        if (!playerId) return;
        try {
            await axios.post('/push/subscribe', {
                player_id: playerId
            });
            console.log('✅ Push subscription synced with server');
        } catch (error) {
            console.error('❌ Failed to sync push subscription', error);
        }
    };

    const requestPermission = () => {
        if (window.OneSignal) {
            window.OneSignal.push(() => {
                window.OneSignal.Notifications.requestPermission();
            });
        }
    };

    return { requestPermission };
};
