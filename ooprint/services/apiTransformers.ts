import {
  DBOrder, DBOrderItem, DBOrderItemComplement, DBCustomer, DBAddress,
  ApiOrderResponse, ApiOrderItem, ApiOrderItemComplement
} from '../types';

/**
 * Converts API order response to internal DBOrder format
 */
export function transformApiOrderToDBOrder(apiOrder: ApiOrderResponse): DBOrder {
  return {
    id: apiOrder.id,
    order_number: apiOrder.order_number,
    status: apiOrder.status,
    mode: (apiOrder.mode as 'delivery' | 'pickup' | 'table') || 'delivery',
    total: parseBrazilianCurrency(apiOrder.total),
    delivery_fee: parseBrazilianCurrency(apiOrder.delivery_fee),
    subtotal: parseBrazilianCurrency(apiOrder.subtotal || '0'),
    discount: parseBrazilianCurrency(apiOrder.discount || '0'),
    payment_method: extractPaymentMethod(apiOrder.payment_summary),
    notes: apiOrder.notes,
    created_at: apiOrder.created_at,
    tenant_id: '', // Will be set by caller if needed
    customer: transformApiCustomer(apiOrder.customer),
    address: apiOrder.address ? transformApiAddress(apiOrder.address) : undefined,
    items: apiOrder.items.map(transformApiOrderItem),
    tenant_data: apiOrder.tenant_data,
    loyalty_points_earned: apiOrder.loyalty_points_earned,
    loyalty_points_used: apiOrder.loyalty_points_used,
    customer_points: apiOrder.customer?.loyalty_points,
  };
}

/**
 * Parse Brazilian currency format to number
 * "1.234,56" → 1234.56
 * "45,00" → 45.00
 */
export function parseBrazilianCurrency(value: string | number): number {
  if (typeof value === 'number') {
    return value;
  }

  if (!value) {
    return 0;
  }

  // Remove dots (thousands separator) and replace comma with dot
  const cleaned = value.replace(/\./g, '').replace(',', '.');
  const parsed = parseFloat(cleaned);

  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Extract payment method from payment summary string
 * "Pix: 45,00" → "pix"
 * "Dinheiro (Troco para 50,00)" → "cash"
 * "Cartão de Crédito" → "credit_card"
 * "Cartão de Débito" → "debit_card"
 */
export function extractPaymentMethod(paymentSummary: string): string {
  const lower = paymentSummary.toLowerCase();

  if (lower.includes('pix')) return 'pix';
  if (lower.includes('crédito') || lower.includes('credit')) return 'credit_card';
  if (lower.includes('débito') || lower.includes('debit')) return 'debit_card';
  if (lower.includes('dinheiro') || lower.includes('cash')) return 'cash';

  return 'other';
}

/**
 * Format payment summary for display
 * "Pix: 45,00" → "Pix: R$ 45,00"
 */
export function formatPaymentSummary(summary: string, total: number): string {
  // If summary already looks good, return as-is
  if (summary.includes('R$')) {
    return summary;
  }

  // Otherwise, format it
  const method = extractPaymentMethod(summary);
  const formatted = total.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  const methodName = {
    pix: 'Pix',
    credit_card: 'Cartão de Crédito',
    debit_card: 'Cartão de Débito',
    cash: 'Dinheiro',
    other: 'Outro',
  }[method];

  return `${methodName}: ${formatted}`;
}

export function transformApiCustomer(customer: any): DBCustomer {
  return {
    id: '', // API doesn't provide customer ID
    name: customer?.name || 'Cliente',
    phone: customer?.phone || '',
  };
}

export function transformApiAddress(address: {
  street: string;
  number: string;
  neighborhood: string;
  complement?: string;
  reference?: string;
}): DBAddress {
  return {
    id: '', // API doesn't provide address ID
    street: address.street,
    number: address.number,
    neighborhood: address.neighborhood,
    complement: address.complement,
    reference: address.reference,
  };
}

export function transformApiOrderItem(item: ApiOrderItem): DBOrderItem {
  return {
    id: '', // API doesn't provide item ID
    order_id: '', // Will be set by caller
    product_name: item.product?.name || item.product_name || 'Produto sem nome',
    quantity: item.quantity,
    unit_price: parseBrazilianCurrency(item.unit_price),
    subtotal: item.quantity * parseBrazilianCurrency(item.unit_price),
    notes: item.notes,
    complements: item.complements?.map(transformApiComplement),
  };
}

export function transformApiComplement(
  complement: any
): DBOrderItemComplement {
  return {
    id: '', // API doesn't provide complement ID
    order_item_id: '', // Will be set by caller
    complement_option_id: '', // API doesn't provide this
    name: complement?.name || 'Adicional',
    price: parseBrazilianCurrency(complement?.price || 0),
    quantity: complement?.quantity || 1,
  };
}

/**
 * Format address for display
 * Returns formatted address string or "RETIRADA NO LOCAL" for pickup orders
 */
export function formatAddressForDisplay(address: DBAddress | undefined): string {
  if (!address || !address.street) {
    return 'RETIRADA NO LOCAL';
  }

  const parts = [address.street];

  if (address.number) {
    parts.push(address.number);
  }

  if (address.complement) {
    parts.push(address.complement);
  }

  if (address.neighborhood) {
    parts.push(address.neighborhood);
  }

  return parts.join(', ');
}

/**
 * Format customer info for display
 */
export function formatCustomerInfo(customer: DBCustomer | undefined): string {
  if (!customer) {
    return 'Cliente desconhecido';
  }

  const parts = [customer.name];

  if (customer.phone) {
    parts.push(`(${customer.phone})`);
  }

  return parts.join(' ');
}
