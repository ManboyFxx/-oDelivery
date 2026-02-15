import React from 'react';
import { Bell, Volume2, ShoppingBag, RefreshCw, AlertTriangle } from 'lucide-react';
import { Switch } from '@headlessui/react';

interface NotificationSettingsConfig {
    browser_notifications: boolean;
    sound_enabled: boolean;
    order_created: boolean;
    order_status_updated: boolean;
    stock_low_warning: boolean;
}

interface NotificationSettingsProps {
    notificationSettings: NotificationSettingsConfig;
    setNotificationSettings: (settings: NotificationSettingsConfig) => void;
    setData: (field: string, value: any) => void;
}

export default function NotificationSettings({
    notificationSettings,
    setNotificationSettings,
    setData
}: NotificationSettingsProps) {

    const updateNotificationSettings = (field: keyof NotificationSettingsConfig, value: boolean) => {
        const updated = { ...notificationSettings, [field]: value };
        setNotificationSettings(updated);
        setData('notification_settings', JSON.stringify(updated));
    };

    return (
        <div className="bg-white dark:bg-premium-card rounded-[32px] border border-gray-100 dark:border-white/5 p-8 shadow-sm">
            <h3 className="text-gray-900 dark:text-gray-200 mb-6 flex items-center gap-2 font-bold">
                <Bell className="h-5 w-5 text-[#ff3d03]" />
                Preferências de Notificação
            </h3>

            <div className="space-y-4">
                <h4 className="font-medium text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/5 pb-2">Geral</h4>

                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium text-gray-800 dark:text-gray-200">Notificações no Navegador</p>
                        <p className="text-sm text-gray-500">Exibir alertas flutuantes no canto da tela (Toasts).</p>
                    </div>
                    <Switch
                        checked={notificationSettings.browser_notifications}
                        onChange={(checked) => updateNotificationSettings('browser_notifications', checked)}
                        className={`${notificationSettings.browser_notifications ? 'bg-[#ff3d03]' : 'bg-gray-300 dark:bg-gray-600'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                    >
                        <span className={`${notificationSettings.browser_notifications ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                    </Switch>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium text-gray-800 dark:text-gray-200 flex items-center gap-2">
                            <Volume2 className="h-4 w-4" />
                            Alertas Sonoros
                        </p>
                        <p className="text-sm text-gray-500">Reproduzir som ao receber novas notificações.</p>
                    </div>
                    <Switch
                        checked={notificationSettings.sound_enabled}
                        onChange={(checked) => updateNotificationSettings('sound_enabled', checked)}
                        className={`${notificationSettings.sound_enabled ? 'bg-[#ff3d03]' : 'bg-gray-300 dark:bg-gray-600'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                    >
                        <span className={`${notificationSettings.sound_enabled ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                    </Switch>
                </div>
            </div>

            <div className="space-y-4 pt-4 mt-4 border-t border-gray-100 dark:border-white/5">
                <h4 className="font-medium text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/5 pb-2">Eventos</h4>

                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium text-gray-800 dark:text-gray-200 flex items-center gap-2">
                            <ShoppingBag className="h-4 w-4" />
                            Novo Pedido
                        </p>
                        <p className="text-sm text-gray-500">Notificar quando um novo pedido for recebido.</p>
                    </div>
                    <Switch
                        checked={notificationSettings.order_created}
                        onChange={(checked) => updateNotificationSettings('order_created', checked)}
                        className={`${notificationSettings.order_created ? 'bg-[#ff3d03]' : 'bg-gray-300 dark:bg-gray-600'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                    >
                        <span className={`${notificationSettings.order_created ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                    </Switch>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium text-gray-800 dark:text-gray-200 flex items-center gap-2">
                            <RefreshCw className="h-4 w-4" />
                            Atualização de Status
                        </p>
                        <p className="text-sm text-gray-500">Notificar quando um pedido mudar de status.</p>
                    </div>
                    <Switch
                        checked={notificationSettings.order_status_updated}
                        onChange={(checked) => updateNotificationSettings('order_status_updated', checked)}
                        className={`${notificationSettings.order_status_updated ? 'bg-[#ff3d03]' : 'bg-gray-300 dark:bg-gray-600'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                    >
                        <span className={`${notificationSettings.order_status_updated ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                    </Switch>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium text-gray-800 dark:text-gray-200 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            Estoque Baixo
                        </p>
                        <p className="text-sm text-gray-500">Alertar quando produtos atingirem nível crítico de estoque.</p>
                    </div>
                    <Switch
                        checked={notificationSettings.stock_low_warning}
                        onChange={(checked) => updateNotificationSettings('stock_low_warning', checked)}
                        className={`${notificationSettings.stock_low_warning ? 'bg-[#ff3d03]' : 'bg-gray-300 dark:bg-gray-600'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                    >
                        <span className={`${notificationSettings.stock_low_warning ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                    </Switch>
                </div>
            </div>
        </div>
    );
}
