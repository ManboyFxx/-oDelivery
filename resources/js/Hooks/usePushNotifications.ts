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
            window.OneSignal.push(() => {
                window.OneSignal.on('subscriptionChange', (isSubscribed: boolean) => {
                    if (isSubscribed) {
                        window.OneSignal.getUserId().then((userId: string) => {
                            syncSubscription(userId);
                        });
                    }
                });

                // Check current status
                window.OneSignal.isPushNotificationsEnabled((isEnabled: boolean) => {
                    if (isEnabled) {
                        window.OneSignal.getUserId().then((userId: string) => {
                            syncSubscription(userId);
                        });
                    }
                });
            });
        }
    }, [user]);

    const syncSubscription = async (playerId: string) => {
        try {
            await axios.post(route('push.subscribe'), {
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
                window.OneSignal.showNativePrompt();
            });
        }
    };

    return { requestPermission };
};
