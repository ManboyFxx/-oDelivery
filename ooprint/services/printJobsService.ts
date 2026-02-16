import { PrintJob, DBOrder } from '../types';
import { generateOrderHtml } from '../utils/receiptGenerator';
import { getRestApiClient } from './restApiClient';
import {
    transformApiOrderToDBOrder,
    formatAddressForDisplay,
    formatCustomerInfo,
} from './apiTransformers';
import { getCouponConfig } from './settingsService';
import { PollingService, getPollingService } from './pollingService';

// Configuração padrão temporária para o gerador (será substituída pela config da UI no futuro)
const DEFAULT_COUPON_CONFIG = {
    headerText: 'ÓODELIVERY',
    footerText: 'Obrigado pela preferência!',
    showLogo: true,
    fontSize: 'medium' as const,
    showCustomerPhone: true,
    showObservations: true,
    alignment: 'left' as const,
    separatorStyle: 'dashed' as const,
    highlightOrderNumber: true,
    showItemPrices: true,
    condensedMode: false,
    upperCaseOnly: true,
    leftMargin: 0
};

/**
 * Busca pedidos pendentes da API REST
 */
export async function fetchPendingJobsFromApi(): Promise<PrintJob[]> {
    try {
        console.log('🕵️ Buscando novos pedidos da API REST...');

        const apiClient = getRestApiClient();
        if (!apiClient.isConfigured()) {
            throw new Error('API client not configured');
        }

        const apiOrders = await apiClient.fetchOrders();

        if (!apiOrders || apiOrders.length === 0) {
            console.log('📋 Nenhum pedido pendente encontrado.');
            return [];
        }

        console.log(`📦 Encontrados ${apiOrders.length} pedidos.`);

        // Transform API response to internal format
        const dbOrders = apiOrders.map(transformApiOrderToDBOrder);

        // Convert to PrintJob format
        const jobs = await Promise.all(
            dbOrders.map((order) => mapOrderToPrintJob(order))
        );

        console.log(`✨ ${jobs.length} pedidos convertidos para PrintJob.`);

        return jobs;
    } catch (err: any) {
        console.error('❌ Falha ao buscar jobs:', err.message);
        throw err;
    }
}

/**
 * Subscribe to jobs via polling service
 */
export function subscribeToJobsViaPolling(
    callback: (jobs: PrintJob[]) => void,
    onError: (error: Error) => void,
    intervalMs: number = 30000
): PollingService {
    console.log('📡 Iniciando polling para novos pedidos...');

    const pollingService = getPollingService();

    pollingService.start(
        intervalMs,
        fetchPendingJobsFromApi,
        callback,
        onError
    );

    return pollingService;
}

/**
 * Processa a impressão e marca como impresso na API
 */
export async function processJob(
    job: PrintJob,
    deviceId: string,
    onPrint: (htmlContent: string) => Promise<void>
): Promise<boolean> {
    try {
        console.log(`🖨️ Processando impressão do Pedido #${job.order_number}...`);

        // 1. Imprimir
        if (job.content) {
            await onPrint(job.content);
        }

        // 2. Marcar como impresso na API
        if (job.order_id) {
            try {
                const apiClient = getRestApiClient();
                await apiClient.markAsPrinted(job.order_id);
                console.log(`✅ Pedido #${job.order_number} marcado como impresso na API`);
            } catch (apiErr: any) {
                console.warn(
                    '⚠️ Erro ao marcar como impresso na API (mas impressão ocorreu):',
                    apiErr.message
                );
                // Continue even if API marking fails - local tracking is acceptable
            }
        }

        return true;
    } catch (error: any) {
        console.error(`❌ Erro ao imprimir pedido #${job.order_number}:`, error.message);
        return false;
    }
}



// Helper: Converter DBOrder para PrintJob
async function mapOrderToPrintJob(dbOrder: DBOrder): Promise<PrintJob> {
    // Get coupon config from local settings
    const couponConfig = getCouponConfig();

    const tenantDetails = {
        name: dbOrder.tenant_data?.name || 'ÓODELIVERY',
        phone: dbOrder.tenant_data?.phone,
        address: dbOrder.tenant_data?.address,
        logoUrl: dbOrder.tenant_data?.logo_url,
        instagram: undefined,
    };

    // Gerar HTML
    const htmlContent = await generateOrderHtml(dbOrder, {
        ...DEFAULT_COUPON_CONFIG,
        ...couponConfig,
    }, tenantDetails);

    // Mapear Itens
    const mappedItems = dbOrder.items?.map(item => {
        // Agrupar complementos por nome para somar quantidades
        const aggregatedComplements = item.complements?.reduce((acc, comp) => {
            const existing = acc.find(c => c.name === comp.name);
            if (existing) {
                existing.quantity += comp.quantity;
            } else {
                acc.push({ ...comp });
            }
            return acc;
        }, [] as typeof item.complements) || [];

        // Mapear complementos para string
        const complementStrings = aggregatedComplements.map(comp => {
            const qtyPrefix = comp.quantity > 1 ? `${comp.quantity}x ` : '';
            return `+ ${qtyPrefix}${comp.name}`;
        });

        return {
            id: item.id,
            name: item.product_name,
            quantity: item.quantity,
            price: item.unit_price,
            observations: item.notes,
            complements: complementStrings
        };
    }) || [];

    // Tradução e Formatação do Pagamento
    let paymentDisplay = dbOrder.payment_method || 'Não Informado';
    const isOnline = dbOrder.is_online_payment || false;

    const paymentMap: Record<string, string> = {
        'credit_card': 'Cartão de Crédito',
        'debit_card': 'Cartão de Débito',
        'cash': 'Dinheiro',
        'pix': 'PIX'
    };

    if (paymentMap[paymentDisplay]) {
        paymentDisplay = paymentMap[paymentDisplay];
    } else {
        paymentDisplay = paymentDisplay.replace(/_/g, ' ').toUpperCase();
    }

    if (isOnline) {
        paymentDisplay += ' (Pago ✅)';
    } else {
        if (dbOrder.payment_method === 'cash') {
            paymentDisplay += dbOrder.change_for ? ` (Troco para ${dbOrder.change_for})` : '';
        } else {
            paymentDisplay += ' (Levar Maquineta 💳)';
        }
    }

    return {
        id: dbOrder.id,
        order_id: dbOrder.id,
        order_number: dbOrder.order_number,
        tenant_id: dbOrder.tenant_id,
        status: dbOrder.status === 'confirmed' || dbOrder.status === 'preparing' || dbOrder.status === 'new' ? 'pending' : 'printed',
        backendStatus: dbOrder.status,
        content: htmlContent,
        copies: 1,
        created_at: dbOrder.created_at,
        updated_at: dbOrder.created_at,

        // Campos de UI
        total: Number(dbOrder.total) || 0,
        deliveryFee: Number(dbOrder.delivery_fee) || 0,
        serviceFee: Number(dbOrder.service_fee) || 0,
        customer: dbOrder.customer?.name || 'Cliente Não Identificado',
        phone: dbOrder.customer?.phone || '',
        address: formatAddressForDisplay(dbOrder.address),
        paymentMethod: paymentDisplay,
        timestamp: new Date(dbOrder.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        items: mappedItems,

        // Enriched Data
        tenant_data: dbOrder.tenant_data,
        loyalty_info: {
            points_earned: dbOrder.loyalty_points_earned || 0,
            points_used: dbOrder.loyalty_points_used || 0,
            customer_total_points: dbOrder.customer_points || 0
        }
    };
}
