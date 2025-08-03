import { getConfig } from "../config/settings";
import { calculateRetryDelay, wait, logger } from "../utils/helpers";
import { RetryPolicy } from "../types";

export class FallbackHandler {
  private retryAttempts = new Map<string, number>();
  private failedUrls = new Set<string>();

  async handleWithRetry<T>(
    operation: () => Promise<T>,
    url: string,
    customRetryPolicy?: Partial<RetryPolicy>
  ): Promise<T> {
    const config = getConfig();
    const retryPolicy = { ...config.loading.retryPolicy, ...customRetryPolicy };

    const currentAttempts = this.retryAttempts.get(url) || 0;

    if (this.failedUrls.has(url)) {
      throw new Error(`URL permanently failed: ${url}`);
    }

    try {
      const result = await operation();

      // Success - reset retry count
      this.retryAttempts.delete(url);
      this.failedUrls.delete(url);

      return result;
    } catch (error) {
      const nextAttempt = currentAttempts + 1;

      if (nextAttempt >= retryPolicy.maxAttempts) {
        // Mark as permanently failed
        this.failedUrls.add(url);
        this.retryAttempts.delete(url);

        logger.error(
          `Permanently failed after ${retryPolicy.maxAttempts} attempts:`,
          url
        );
        throw error;
      }

      // Calculate delay and retry
      const delay = calculateRetryDelay(
        nextAttempt,
        retryPolicy.baseDelay,
        retryPolicy.maxDelay,
        retryPolicy.exponentialBackoff
      );

      this.retryAttempts.set(url, nextAttempt);

      logger.warn(
        `Retry attempt ${nextAttempt}/${retryPolicy.maxAttempts} for ${url} after ${delay}ms`
      );

      await wait(delay);
      return this.handleWithRetry(operation, url, customRetryPolicy);
    }
  }

  generateFallbackImage(
    width: number,
    height: number,
    errorMessage?: string
  ): string {
    const config = getConfig();
    const placeholder = config.placeholder.default;

    const text = errorMessage || "Failed to load";
    const fontSize = Math.min(width, height) * 0.08;

    return `data:image/svg+xml;base64,${btoa(`
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${
          placeholder.backgroundColor
        }" rx="4"/>
        <g opacity="0.6">
          <path d="M${width / 2 - 10} ${height / 2 - 10} L${width / 2 + 10} ${
      height / 2 + 10
    } M${width / 2 + 10} ${height / 2 - 10} L${width / 2 - 10} ${
      height / 2 + 10
    }" 
            stroke="${
              placeholder.textColor
            }" stroke-width="2" stroke-linecap="round"/>
        </g>
        <text x="50%" y="65%" dominant-baseline="middle" text-anchor="middle" 
          font-family="Arial, sans-serif" font-size="${fontSize}" fill="${
      placeholder.textColor
    }">
          ${text}
        </text>
      </svg>
    `)}`;
  }

  isUrlFailed(url: string): boolean {
    return this.failedUrls.has(url);
  }

  resetUrl(url: string): void {
    this.retryAttempts.delete(url);
    this.failedUrls.delete(url);
    logger.debug("Reset failure state for URL:", url);
  }

  getRetryStats(): { pending: number; failed: number } {
    return {
      pending: this.retryAttempts.size,
      failed: this.failedUrls.size,
    };
  }

  clearFailedUrls(): void {
    this.failedUrls.clear();
    this.retryAttempts.clear();
    logger.info("Cleared all failed URLs");
  }

  async testConnection(url: string, timeout: number = 5000): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        method: "HEAD",
        signal: controller.signal,
        cache: "no-cache",
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Singleton instance
let fallbackHandlerInstance: FallbackHandler | null = null;

export const getFallbackHandler = (): FallbackHandler => {
  if (!fallbackHandlerInstance) {
    fallbackHandlerInstance = new FallbackHandler();
  }
  return fallbackHandlerInstance;
};

export const destroyFallbackHandler = (): void => {
  fallbackHandlerInstance = null;
};
