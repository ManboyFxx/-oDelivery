/**
 * Serviço de debug para testar e monitorar a API
 */

export interface ApiLog {
  id: string;
  timestamp: number;
  method: string;
  endpoint: string;
  status?: number;
  statusText?: string;
  error?: string;
  duration: number;
  success: boolean;
}

class DebugService {
  private logs: ApiLog[] = [];
  private maxLogs = 50;

  logRequest(
    method: string,
    endpoint: string,
    status?: number,
    statusText?: string,
    error?: string,
    duration: number = 0
  ): void {
    const log: ApiLog = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      method,
      endpoint,
      status,
      statusText,
      error,
      duration,
      success: !error && status && status < 400,
    };

    this.logs.unshift(log);

    // Manter apenas os últimos N logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Exibir no console também
    const icon = log.success ? '✅' : '❌';
    const statusStr = status ? ` (${status} ${statusText})` : '';
    const errorStr = error ? ` - ${error}` : '';
    const durationStr = ` [${duration}ms]`;

    console.log(
      `${icon} ${method} ${endpoint}${statusStr}${errorStr}${durationStr}`
    );
  }

  getLogs(): ApiLog[] {
    return [...this.logs];
  }

  getRecentErrors(): ApiLog[] {
    return this.logs.filter((log) => !log.success).slice(0, 10);
  }

  clearLogs(): void {
    this.logs = [];
  }

  getStats(): {
    total: number;
    successful: number;
    failed: number;
    successRate: string;
    averageResponseTime: number;
  } {
    const total = this.logs.length;
    const successful = this.logs.filter((log) => log.success).length;
    const failed = total - successful;
    const successRate = total > 0 ? ((successful / total) * 100).toFixed(1) : '0';
    const averageResponseTime =
      total > 0 ? Math.round(this.logs.reduce((acc, log) => acc + log.duration, 0) / total) : 0;

    return {
      total,
      successful,
      failed,
      successRate,
      averageResponseTime,
    };
  }

  exportLogs(): string {
    return JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        stats: this.getStats(),
        logs: this.logs,
      },
      null,
      2
    );
  }
}

// Singleton instance
let debugService: DebugService | null = null;

export function getDebugService(): DebugService {
  if (!debugService) {
    debugService = new DebugService();
  }
  return debugService;
}
