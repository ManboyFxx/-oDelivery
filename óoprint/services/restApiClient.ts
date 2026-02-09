import {
  ApiError,
  AuthenticationError,
  NetworkError,
  RateLimitError,
  ServerError,
  getErrorMessage,
  isRetryableError,
} from '../utils/apiErrors';
import { ApiSettings } from './settingsService';
import { getDebugService } from './debugService';

export interface ApiOrderResponse {
  id: string;
  order_number: number;
  status: string;
  created_at: string;
  total: string; // API returns string
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
  tenant_data?: {
    name: string;
    logo_url?: string;
    phone?: string;
    address?: string;
  };
}

export interface ApiOrderItem {
  product: {
    name: string;
  };
  quantity: number;
  unit_price: string | number; // API returns float (number) or string
  notes?: string;
  complements?: ApiOrderItemComplement[];
}

export interface ApiOrderItemComplement {
  name: string;
  price: string;
}

export interface RestApiConfig {
  baseUrl: string;
  accessToken: string;
}

const REQUEST_TIMEOUT = 15000; // 15 seconds (increased for slower connections)
const MAX_RETRIES = 3;

class RestApiClient {
  private config: RestApiConfig | null = null;

  configure(config: RestApiConfig): void {
    // Validate URL format
    if (!config.baseUrl.startsWith('http://') && !config.baseUrl.startsWith('https://')) {
      throw new Error('Base URL must start with http:// or https://');
    }

    // Remove trailing slash for consistency
    const baseUrl = config.baseUrl.replace(/\/$/, '');

    this.config = {
      baseUrl,
      accessToken: config.accessToken,
    };

    console.log('[API Client] Configured with base URL:', baseUrl);
  }

  async fetchOrders(): Promise<ApiOrderResponse[]> {
    return this.retryWithBackoff(async () => {
      const response = await this.fetch('/api/printer/orders', {
        method: 'GET',
      });

      if (!Array.isArray(response)) {
        throw new Error('Expected orders list but got non-array response');
      }

      return response;
    });
  }

  async fetchProfile(): Promise<any> {
    return this.retryWithBackoff(async () => {
      return this.fetch('/api/printer/profile', {
        method: 'GET',
      });
    });
  }

  async markAsPrinted(orderId: string): Promise<void> {
    return this.retryWithBackoff(async () => {
      await this.fetch(`/api/printer/orders/${orderId}/printed`, {
        method: 'POST',
      });
    });
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const orders = await this.fetchOrders();
      return {
        success: true,
        message: `Conectado com sucesso! (${orders.length} pedidos disponíveis)`,
      };
    } catch (error) {
      const message = getErrorMessage(error);
      return {
        success: false,
        message: `Erro de conexão: ${message}`,
      };
    }
  }

  private async fetch(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    if (!this.config) {
      throw new Error('API client not configured');
    }

    const url = `${this.config.baseUrl}${endpoint}`;
    const debugService = getDebugService();
    const method = options.method || 'GET';
    const startTime = performance.now();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, REQUEST_TIMEOUT);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const duration = Math.round(performance.now() - startTime);

      if (!response.ok) {
        const error = this.createErrorFromResponse(response);
        debugService.logRequest(
          method,
          endpoint,
          response.status,
          response.statusText,
          error.message,
          duration
        );
        throw error;
      }

      // Log successful request
      debugService.logRequest(method, endpoint, response.status, response.statusText, undefined, duration);

      // Handle empty responses (204 No Content)
      if (response.status === 204) {
        return null;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      const duration = Math.round(performance.now() - startTime);

      if (error instanceof ApiError) {
        debugService.logRequest(method, endpoint, undefined, undefined, error.message, duration);
        throw error;
      }

      // Check for abort errors (timeout or explicit abort)
      if (error instanceof DOMException && error.name === 'AbortError') {
        const timeoutError = new NetworkError('⏱️ Requisição expirou (15s). Verifique sua conexão com o servidor.');
        debugService.logRequest(method, endpoint, undefined, 'Timeout', timeoutError.message, duration);
        throw timeoutError;
      }

      if (error instanceof TypeError) {
        // Network error (no internet, CORS, etc)
        const networkError = new NetworkError(`🌐 Erro de conexão: ${error.message}`);
        debugService.logRequest(method, endpoint, undefined, 'NetworkError', networkError.message, duration);
        throw networkError;
      }

      // If it's already a custom error, rethrow it
      if (error instanceof Error) {
        const unknownError = new NetworkError(`❓ Erro desconhecido: ${error.message}`);
        debugService.logRequest(method, endpoint, undefined, 'UnknownError', unknownError.message, duration);
        throw unknownError;
      }

      const unknownError = new NetworkError(`❓ Erro desconhecido: ${String(error)}`);
      debugService.logRequest(method, endpoint, undefined, 'UnknownError', unknownError.message, duration);
      throw unknownError;
    }
  }

  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxAttempts = MAX_RETRIES
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const result = await fn();
        if (attempt > 1) {
          console.log('[API Client] Succeeded on attempt', attempt);
        }
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Don't retry authentication errors
        if (error instanceof AuthenticationError) {
          throw error;
        }

        // Check if error is retryable
        if (!isRetryableError(error)) {
          throw error;
        }

        if (attempt < maxAttempts) {
          const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s
          console.log(
            `[API Client] Attempt ${attempt} failed, retrying in ${delay}ms...`,
            getErrorMessage(error)
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('Request failed after retries');
  }

  private createErrorFromResponse(response: Response): ApiError {
    const status = response.status;

    if (status === 401) {
      return new AuthenticationError('🔐 Token de acesso inválido ou expirado. Faça login novamente.');
    }

    if (status === 429) {
      return new RateLimitError('⏱️ Limite de requisições excedido. Aguarde alguns momentos e tente novamente.');
    }

    if (status === 503) {
      return new ServerError(
        '🔧 Servidor em manutenção. Tente novamente em alguns minutos.',
        status
      );
    }

    if (status >= 500) {
      return new ServerError(
        `❌ Erro no servidor (${status}). O administrador foi notificado. Tente novamente em alguns momentos.`,
        status
      );
    }

    if (status === 404) {
      return new ApiError(
        `🔍 Endpoint não encontrado (${status}). Verifique a URL da API.`,
        status
      );
    }

    if (status >= 400) {
      return new ApiError(
        `⚠️ Erro na requisição (${status}). Verifique os dados enviados.`,
        status
      );
    }

    return new ApiError(`Erro desconhecido (${status})`, status);
  }

  isConfigured(): boolean {
    return this.config !== null;
  }

  getConfig(): RestApiConfig | null {
    return this.config;
  }
}

// Singleton instance
let apiClient: RestApiClient | null = null;

export function getRestApiClient(): RestApiClient {
  if (!apiClient) {
    apiClient = new RestApiClient();
  }
  return apiClient;
}

export function resetApiClient(): void {
  apiClient = null;
}
