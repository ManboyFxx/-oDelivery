import { useEffect } from 'react';
import echo from '../echo';

/**
 * Hook para ouvir atualizações de pedidos em tempo real (Pusher WebSocket).
 * 
 * Substitui o polling de 15s. Ouve no canal privado do Tenant específico.
 * 
 * @param tenantId O ID do tenant atual
 * @param onOrderUpdated Callback ao atualizar um pedido existente
 * @param onNewOrder Callback ao chegar novo pedido
 */
export function useOrderBroadcast(
    tenantId: string | null,
    onOrderUpdated?: (order: any) => void,
    onNewOrder?: (order: any) => void
) {
    useEffect(() => {
        if (!tenantId) return;

        console.log(`📡 Conectando ao canal privado: tenant.${tenantId}`);
        const channel = echo.private(`tenant.${tenantId}`);

        if (onOrderUpdated) {
            channel.listen('.order.updated', (e: any) => {
                console.log('🔄 Pedido Atualizado via WebSocket:', e);
                onOrderUpdated(e);
            });
        }

        if (onNewOrder) {
            channel.listen('.order.new', (e: any) => {
                console.log('✨ Novo Pedido via WebSocket:', e);
                onNewOrder(e);
            });
        }

        return () => {
            console.log(`🔌 Desconectando do canal: tenant.${tenantId}`);
            echo.leave(`tenant.${tenantId}`);
        };
    }, [tenantId]);
}
