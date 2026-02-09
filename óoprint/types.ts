
export enum AppTab {
  ORDERS = 'orders',
  HISTORY = 'history',
  SETTINGS = 'settings'
}

export enum SettingsTab {
  PRINTER = 'printer',
  COUPON = 'coupon',
  SYSTEM = 'system'
}

export interface Establishment {
  id: string;
  name: string;
  city: string;
  status: 'active' | 'inactive';
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  observations?: string;
  complements?: string[];
}

export interface Order {
  id: string;
  customer: string;
  phone: string;
  address: string;
  items: OrderItem[];
  total: number;
  paymentMethod: string;
  timestamp: string;
  status: 'pending' | 'printed' | 'canceled';
  deliveryFee: number;
  serviceFee?: number;
}

export interface PrintHistoryEntry {
  id: string;
  orderId: string;
  customerName: string;
  timestamp: string;
  printer: string;
  status: 'success' | 'failed';
}

export interface CouponConfig {
  headerText: string;
  footerText: string;
  showLogo: boolean;
  fontSize: 'small' | 'medium' | 'large';
  showCustomerPhone: boolean;
  showObservations: boolean;
  alignment: 'left' | 'center';
  separatorStyle: 'dashed' | 'solid' | 'dotted';
  highlightOrderNumber: boolean;
  showItemPrices: boolean;
  condensedMode: boolean;
  upperCaseOnly: boolean;
  leftMargin: number;
}

export interface PrinterSettings {
  selectedPrinter: string;
  copiesKitchen: number;
  copiesDelivery: number;
  paperWidth: '58mm' | '80mm';
  autoPrint: boolean;
  alertSound: boolean;
  visualAlert: boolean; // Nova: Piscar tela
  pollingInterval: number;
  autoStart: boolean;
  printerModel: 'esc-pos' | 'windows-driver' | 'star-line';
  cutPaper: boolean;
  orderSorting: 'newest' | 'oldest'; // Nova: Ordenação
  hidePrinted: boolean; // Nova: Ocultar impressos
  uiScale: number; // Nova: Escala da UI
}


// ==================== API Settings ====================

/**
 * API configuration for REST API connection
 */
export interface ApiSettings {
  baseUrl: string;
  accessToken: string;
}

/**
 * API Order Response from oDelivery
 */
export interface ApiOrderResponse {
  id: string;
  order_number: number;
  status: string;
  created_at: string;
  total: string; // API returns as string
  customer: {
    name: string;
    phone: string;
  };
  address?: {
    street: string;
    number: string;
    neighborhood: string;
    complement?: string;
    reference?: string;
  };
  items: ApiOrderItem[];
  payment_summary: string;
  delivery_fee: string;
  notes?: string;
  mode?: string; // 'delivery' | 'pickup' | 'table'
  discount?: string;
  subtotal?: string;
}

/**
 * API Order Item
 */
export interface ApiOrderItem {
  product: {
    name: string;
  };
  quantity: number;
  price: string; // API returns as string
  notes?: string;
  complements?: ApiOrderItemComplement[];
}

/**
 * API Order Item Complement
 */
export interface ApiOrderItemComplement {
  name: string;
  price: string; // API returns as string
}

// ==================== Supabase Database Types ====================

/**
 * Perfil do usuário (tabela profiles)
 */
export interface Profile {
  id: string;
  tenant_id: string;
  full_name: string;
  role: 'owner' | 'admin' | 'employee' | 'motoboy';
  created_at?: string;
  updated_at?: string;
}

/**
 * Job de impressão (tabela print_jobs - usada para controle)
 */
export interface PrintJob {
  id: string;
  order_id?: string;
  order_number?: number;
  tenant_id: string;
  status: 'pending' | 'printing' | 'printed' | 'error' | 'cancelled';
  content?: string; // HTML para impressão
  copies?: number;
  priority?: number;
  device_id?: string;
  error_message?: string;
  attempts?: number;
  printed_at?: string;
  created_at: string;
  updated_at: string;

  // Campos de Display (Compatibilidade UI)
  total?: number;
  items?: any[];
  customer?: string;
  phone?: string;
  address?: string;
  deliveryFee?: number;
  serviceFee?: number;
  paymentMethod?: string;
  timestamp?: string;
}

/**
 * Status do bot (tabela bot_status)
 */
export interface BotStatus {
  id?: string;
  device_id: string;
  tenant_id: string;
  company_name?: string;
  last_seen?: string;
  status: 'online' | 'paused' | 'error' | 'offline';
  version?: string;
  printer_name?: string;
  ip_address?: string;
  error?: string;
  metadata?: Record<string, any>;
}

// Interfaces mapeadas das tabelas reais
export interface DBOrder {
  id: string;
  order_number: number;
  status: string;
  mode: 'delivery' | 'pickup' | 'table';
  customer_id?: string;
  address_id?: string;
  subtotal: number;
  discount: number;
  delivery_fee: number;
  total: number;
  payment_method: string;
  change_for?: string; // Troco para
  notes?: string;
  service_fee?: number;
  is_online_payment?: boolean;
  payment_status?: string;
  created_at: string;
  tenant_id: string;
  card_surcharge?: number; // Nova: Acréscimo Maquineta

  // Relacionamentos (preenchidos via select/join)
  customer?: DBCustomer;
  address?: DBAddress;
  items?: DBOrderItem[];
  tenant_data?: {
    name: string;
    logo_url?: string;
    phone?: string;
    address?: string;
  };
}

export interface DBOrderItem {
  id: string;
  order_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  complements_price?: number;
  notes?: string;
  complements?: DBOrderItemComplement[];
}

export interface DBOrderItemComplement {
  id: string;
  order_item_id: string;
  complement_option_id: string; // ou null se for custom
  name: string;
  price: number;
  quantity: number;
}

export interface DBCustomer {
  id: string;
  name: string;
  phone: string;
}

export interface DBAddress {
  id: string;
  street: string;
  number: string;
  neighborhood: string;
  city?: string;
  state?: string; // Nova: UF
  complement?: string;
  reference?: string;
}

declare global {
  interface Window {
    electronAPI?: {
      print: (content: string, options?: any) => Promise<{ success: boolean; error?: string }>;
      getPrinters: () => Promise<any[]>;
      isElectron: boolean;
    };
  }
}

