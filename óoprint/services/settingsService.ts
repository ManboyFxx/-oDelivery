import { PrinterSettings, CouponConfig } from '../types';

export interface ApiSettings {
  baseUrl: string;
  accessToken: string;
  tenantName?: string;
  tenantId?: string;
  deviceId?: string;
  rememberMe?: boolean;
}

export interface PersistedSettings {
  apiSettings: ApiSettings | null;
  printerSettings: PrinterSettings;
  couponConfig: CouponConfig;
}

const STORAGE_KEY = 'ooprint_settings_v2.4';

const DEFAULT_PRINTER_SETTINGS: PrinterSettings = {
  selectedPrinter: 'default',
  copiesKitchen: 1,
  copiesDelivery: 1,
  paperWidth: '80mm',
  autoPrint: false,
  alertSound: true,
  visualAlert: true,
  pollingInterval: 30000, // 30 seconds
  autoStart: false,
  printerModel: 'esc-pos',
  cutPaper: true,
  orderSorting: 'newest',
  hidePrinted: false,
  uiScale: 1,
};

const DEFAULT_COUPON_CONFIG: CouponConfig = {
  headerText: 'Pedido Impresso',
  footerText: 'Obrigado pela compra!',
  showLogo: true,
  fontSize: 'medium',
  showCustomerPhone: true,
  showObservations: true,
  alignment: 'center',
  separatorStyle: 'dashed',
  highlightOrderNumber: true,
  showItemPrices: true,
  condensedMode: false,
  upperCaseOnly: false,
  leftMargin: 0,
};

export function loadSettings(): PersistedSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return {
        apiSettings: null,
        printerSettings: DEFAULT_PRINTER_SETTINGS,
        couponConfig: DEFAULT_COUPON_CONFIG,
      };
    }

    const parsed = JSON.parse(stored);

    // Merge with defaults to handle new fields added over time
    return {
      apiSettings: parsed.apiSettings ?? null,
      printerSettings: {
        ...DEFAULT_PRINTER_SETTINGS,
        ...parsed.printerSettings,
      },
      couponConfig: {
        ...DEFAULT_COUPON_CONFIG,
        ...parsed.couponConfig,
      },
    };
  } catch (error) {
    console.error('Error loading settings:', error);
    return {
      apiSettings: null,
      printerSettings: DEFAULT_PRINTER_SETTINGS,
      couponConfig: DEFAULT_COUPON_CONFIG,
    };
  }
}

export function saveSettings(settings: PersistedSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}

export function getApiSettings(): ApiSettings | null {
  const settings = loadSettings();
  return settings.apiSettings;
}

export function saveApiSettings(apiSettings: ApiSettings): void {
  const settings = loadSettings();
  settings.apiSettings = apiSettings;
  saveSettings(settings);
}

export function getPrinterSettings(): PrinterSettings {
  const settings = loadSettings();
  return settings.printerSettings;
}

export function savePrinterSettings(printerSettings: PrinterSettings): void {
  const settings = loadSettings();
  settings.printerSettings = printerSettings;
  saveSettings(settings);
}

export function getCouponConfig(): CouponConfig {
  const settings = loadSettings();
  return settings.couponConfig;
}

export function saveCouponConfig(couponConfig: CouponConfig): void {
  const settings = loadSettings();
  settings.couponConfig = couponConfig;
  saveSettings(settings);
}

export function clearAllSettings(): void {
  localStorage.removeItem(STORAGE_KEY);
}
