import { ImageData } from './types';
import { getConfig } from './config';
import { delay } from './utils';

class RecoverySystem {
  async fetchWithRetry(url: string, options: RequestInit = {}): Promise<ImageData> {
    const config = getConfig();
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= config.retryAttempts; attempt++) {
      try {
        const response = await fetch(url, {
          ...options,
          cache: 'force-cache' // Prefer cached versions
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const blob = await response.blob();
        
        if (!blob.type.startsWith('image/')) {
          throw new Error('Response is not an image');
        }

        const imageData: ImageData = {
          blob,
          url,
          timestamp: Date.now(),
          size: blob.size,
          format: blob.type
        };

        return imageData;

      } catch (error) {
        lastError = error as Error;
        console.warn(`Image fetch attempt ${attempt}/${config.retryAttempts} failed:`, error);

        if (attempt < config.retryAttempts) {
          const delayMs = config.retryDelayMs * Math.pow(2, attempt - 1); // Exponential backoff
          await delay(delayMs);
        }
      }
    }

    throw lastError || new Error('Failed to fetch image after all retry attempts');
  }

  async loadWithFallback(url: string, fallbackUrl?: string): Promise<ImageData> {
    try {
      return await this.fetchWithRetry(url);
    } catch (primaryError) {
      if (fallbackUrl) {
        try {
          console.warn(`Primary image failed, trying fallback: ${fallbackUrl}`);
          return await this.fetchWithRetry(fallbackUrl);
        } catch (fallbackError) {
          console.error('Both primary and fallback images failed:', {
            primary: primaryError,
            fallback: fallbackError
          });
          throw fallbackError;
        }
      }
      throw primaryError;
    }
  }

  createErrorPlaceholder(width: number = 400, height: number = 300): ImageData {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Error state styling
      ctx.fillStyle = '#fee2e2'; // red-100
      ctx.fillRect(0, 0, width, height);
      
      ctx.fillStyle = '#dc2626'; // red-600
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Image failed to load', width / 2, height / 2);
    }

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve({
            blob,
            url: 'error-placeholder',
            timestamp: Date.now(),
            size: blob.size,
            format: blob.type
          });
        }
      });
    }) as any; // Simplified for synchronous use
  }

  validateImageData(imageData: ImageData): boolean {
    return (
      imageData &&
      imageData.blob &&
      imageData.blob.size > 0 &&
      imageData.blob.type.startsWith('image/') &&
      imageData.timestamp &&
      imageData.url
    );
  }
}

export const recovery = new RecoverySystem();
