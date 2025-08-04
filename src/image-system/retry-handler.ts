import { defaultConfig, ImageSystemConfig } from "./config";

export class RetryHandler {
  private attempts = new Map<string, number>();
  private config: ImageSystemConfig["retry"];

  constructor(config: ImageSystemConfig["retry"] = defaultConfig.retry) {
    this.config = config;
  }

  async execute<T>(
    key: string,
    operation: () => Promise<T>,
    onRetry?: (attempt: number, error: Error) => void
  ): Promise<T> {
    const currentAttempt = this.attempts.get(key) || 0;

    try {
      const result = await operation();
      this.attempts.delete(key); // نجح، مسح العداد
      return result;
    } catch (error) {
      const nextAttempt = currentAttempt + 1;

      if (nextAttempt >= this.config.maxAttempts) {
        this.attempts.delete(key);
        throw new Error(
          `فشل بعد ${this.config.maxAttempts} محاولات: ${
            (error as Error).message
          }`
        );
      }

      this.attempts.set(key, nextAttempt);

      if (onRetry) {
        onRetry(nextAttempt, error as Error);
      }

      const delay = this.calculateDelay(nextAttempt - 1);
      await this.wait(delay);

      return this.execute(key, operation, onRetry);
    }
  }

  private calculateDelay(attemptIndex: number): number {
    if (attemptIndex < this.config.delays.length) {
      let delay = this.config.delays[attemptIndex];

      if (this.config.exponentialBackoff) {
        delay *= Math.pow(2, attemptIndex);
      }

      return delay;
    }

    // استخدام آخر قيمة مع التضاعف الأسي
    const lastDelay = this.config.delays[this.config.delays.length - 1];
    return this.config.exponentialBackoff
      ? lastDelay * Math.pow(2, attemptIndex)
      : lastDelay;
  }

  private wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }

  resetAll(): void {
    this.attempts.clear();
  }

  getAttemptCount(key: string): number {
    return this.attempts.get(key) || 0;
  }
}
