export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = 'Autenticação falhou', response?: any) {
    super(message, 401, response);
    this.name = 'AuthenticationError';
  }
}

export class NetworkError extends ApiError {
  constructor(message: string = 'Erro de conexão', response?: any) {
    super(message, 0, response);
    this.name = 'NetworkError';
  }
}

export class RateLimitError extends ApiError {
  constructor(message: string = 'Limite de requisições excedido', response?: any) {
    super(message, 429, response);
    this.name = 'RateLimitError';
  }
}

export class ServerError extends ApiError {
  constructor(
    message: string = 'Erro no servidor',
    statusCode: number = 500,
    response?: any
  ) {
    super(message, statusCode, response);
    this.name = 'ServerError';
  }
}

export class ValidationError extends ApiError {
  constructor(message: string = 'Dados inválidos', response?: any) {
    super(message, 400, response);
    this.name = 'ValidationError';
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof TypeError) {
    // Network errors from fetch often show as TypeError
    if (error.message.includes('fetch')) {
      return 'Erro de conexão com o servidor. Verifique sua internet.';
    }
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'Erro desconhecido ocorreu';
}

export function isRetryableError(error: unknown): boolean {
  if (error instanceof AuthenticationError) {
    return false; // Don't retry auth errors
  }

  if (error instanceof ApiError) {
    // Retry on 5xx and some specific 4xx errors
    return (
      error.statusCode >= 500 ||
      error.statusCode === 429 || // Too Many Requests
      error.statusCode === 408 // Request Timeout
    );
  }

  if (error instanceof NetworkError) {
    return true; // Always retry network errors
  }

  // Retry on unknown errors (likely network-related)
  return true;
}
