import { PrintJob } from '../types';

interface PollingMetrics {
  lastChecked: Date | null;
  totalOrders: number;
  consecutiveErrors: number;
  currentInterval: number;
}

class PollingService {
  private intervalId: NodeJS.Timeout | null = null;
  private lastOrderIds: Set<string> = new Set();
  private consecutiveErrors: number = 0;
  private currentInterval: number = 0;
  private initialInterval: number = 0;
  private lastChecked: Date | null = null;
  private totalOrders: number = 0;
  private fetchFn: (() => Promise<PrintJob[]>) | null = null;
  private onNewOrders: ((orders: PrintJob[]) => void) | null = null;
  private onError: ((error: Error) => void) | null = null;

  start(
    intervalMs: number,
    fetchFn: () => Promise<PrintJob[]>,
    onNewOrders: (orders: PrintJob[]) => void,
    onError: (error: Error) => void
  ): void {
    if (this.intervalId !== null) {
      console.warn('[Polling] Service already running, stopping previous instance');
      this.stop();
    }

    // Store functions for use in backoff/reset
    this.fetchFn = fetchFn;
    this.onNewOrders = onNewOrders;
    this.onError = onError;

    this.initialInterval = intervalMs;
    this.currentInterval = intervalMs;

    console.log(`[Polling] Starting with interval: ${intervalMs}ms`);

    // Run immediately on start
    this.pollOnce(fetchFn, onNewOrders, onError);

    // Then run on interval
    this.intervalId = setInterval(
      () => this.pollOnce(fetchFn, onNewOrders, onError),
      this.currentInterval
    );
  }

  stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.fetchFn = null;
      this.onNewOrders = null;
      this.onError = null;
      console.log('[Polling] Stopped');
    }
  }

  async forceRefresh(
    fetchFn: () => Promise<PrintJob[]>,
    onNewOrders: (orders: PrintJob[]) => void,
    onError: (error: Error) => void
  ): Promise<void> {
    console.log('[Polling] Force refresh triggered');
    await this.pollOnce(fetchFn, onNewOrders, onError);
  }

  private async pollOnce(
    fetchFn: () => Promise<PrintJob[]>,
    onNewOrders: (orders: PrintJob[]) => void,
    onError: (error: Error) => void
  ): Promise<void> {
    try {
      this.lastChecked = new Date();

      const orders = await fetchFn();
      this.totalOrders = orders.length;

      const newOrders = this.detectNewOrders(orders);

      if (newOrders.length > 0) {
        console.log(`[Polling] Detected ${newOrders.length} new orders`);
        onNewOrders(newOrders);
      }

      // Reset error counter on success
      if (this.consecutiveErrors > 0) {
        console.log('[Polling] Recovered from errors, resetting interval');
        this.consecutiveErrors = 0;
        this.resetInterval();
      }
    } catch (error) {
      this.consecutiveErrors++;
      const errorObj = error instanceof Error ? error : new Error(String(error));

      console.error(
        `[Polling] Error (attempt ${this.consecutiveErrors}):`,
        errorObj.message
      );

      onError(errorObj);

      // Implement backoff: increase interval after consecutive errors
      if (this.consecutiveErrors >= 3) {
        this.increaseInterval();
      }
    }
  }

  private detectNewOrders(orders: PrintJob[]): PrintJob[] {
    const currentIds = new Set(orders.map((order) => order.id));
    const newOrders = orders.filter((order) => !this.lastOrderIds.has(order.id));

    this.lastOrderIds = currentIds;

    return newOrders;
  }

  private increaseInterval(): void {
    const newInterval = Math.min(this.currentInterval * 2, 120000); // Max 2 minutes

    if (newInterval !== this.currentInterval) {
      console.log(
        `[Polling] Backoff: increasing interval from ${this.currentInterval}ms to ${newInterval}ms`
      );

      this.currentInterval = newInterval;

      // Restart timer with new interval
      if (this.intervalId !== null && this.fetchFn && this.onNewOrders && this.onError) {
        clearInterval(this.intervalId);
        this.intervalId = setInterval(
          () => this.pollOnce(this.fetchFn!, this.onNewOrders!, this.onError!),
          this.currentInterval
        );
      }
    }
  }

  private resetInterval(): void {
    this.currentInterval = this.initialInterval;
    console.log(`[Polling] Resetting interval to ${this.initialInterval}ms`);

    // Restart timer with initial interval
    if (this.intervalId !== null && this.fetchFn && this.onNewOrders && this.onError) {
      clearInterval(this.intervalId);
      this.intervalId = setInterval(
        () => this.pollOnce(this.fetchFn!, this.onNewOrders!, this.onError!),
        this.currentInterval
      );
    }
  }

  getMetrics(): PollingMetrics {
    return {
      lastChecked: this.lastChecked,
      totalOrders: this.totalOrders,
      consecutiveErrors: this.consecutiveErrors,
      currentInterval: this.currentInterval,
    };
  }

  isRunning(): boolean {
    return this.intervalId !== null;
  }
}

// Export singleton instance
let pollingService: PollingService | null = null;

export function getPollingService(): PollingService {
  if (!pollingService) {
    pollingService = new PollingService();
  }
  return pollingService;
}

export function resetPollingService(): void {
  pollingService = null;
}

export { PollingService, PollingMetrics };
