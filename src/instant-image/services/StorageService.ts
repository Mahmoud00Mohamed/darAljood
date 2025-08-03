import type { ImageData, CacheConfig } from "../types/config";

export class StorageService {
  private readonly localStorageKey = "instant-image-cache";
  private readonly sessionStorageKey = "instant-image-session";

  constructor(private config: CacheConfig) {}

  async get(src: string): Promise<ImageData | null> {
    // Try session storage first (faster)
    if (this.config.useSessionStorage) {
      const sessionData = this.getFromStorage("session", src);
      if (sessionData && this.isValidStorage(sessionData)) {
        return sessionData;
      }
    }

    // Try localStorage
    if (this.config.useLocalStorage) {
      const localData = this.getFromStorage("local", src);
      if (localData && this.isValidStorage(localData)) {
        return localData;
      }
    }

    return null;
  }

  async set(src: string, data: ImageData): Promise<void> {
    try {
      // Convert blob to base64 for storage
      const base64 = await this.blobToBase64(data.blob);
      const storageData = {
        ...data,
        blob: base64, // Store as base64 string
      };

      // Store in session storage
      if (this.config.useSessionStorage) {
        this.setToStorage("session", src, storageData);
      }

      // Store in localStorage with size check
      if (this.config.useLocalStorage) {
        const size = this.calculateStorageSize(storageData);
        if (size < this.config.maxStorageSize) {
          this.setToStorage("local", src, storageData);
        }
      }
    } catch (error) {
      console.warn("Failed to store image in cache:", error);
    }
  }

  private getFromStorage(
    type: "local" | "session",
    src: string
  ): ImageData | null {
    try {
      const storage = type === "local" ? localStorage : sessionStorage;
      const key =
        type === "local" ? this.localStorageKey : this.sessionStorageKey;
      const cached = storage.getItem(key);

      if (!cached) return null;

      const cache = JSON.parse(cached);
      const item = cache[src];

      if (!item) return null;

      // Convert base64 back to blob
      const blob = this.base64ToBlob(item.blob, item.format);
      return {
        ...item,
        blob,
      };
    } catch (error) {
      console.warn("Failed to retrieve from storage:", error);
      return null;
    }
  }

  private setToStorage(
    type: "local" | "session",
    src: string,
    data: Omit<ImageData, "blob"> & { blob: string }
  ): void {
    try {
      const storage = type === "local" ? localStorage : sessionStorage;
      const key =
        type === "local" ? this.localStorageKey : this.sessionStorageKey;

      let cache: Record<string, unknown> = {};
      try {
        const existing = storage.getItem(key);
        cache = existing ? JSON.parse(existing) : {};
      } catch {
        cache = {};
      }

      (cache as Record<string, typeof data>)[src] = data;
      storage.setItem(key, JSON.stringify(cache));
    } catch (error) {
      console.warn("Failed to store in storage:", error);
    }
  }

  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private base64ToBlob(base64: string, mimeType: string): Blob {
    const byteCharacters = atob(base64.split(",")[1]);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    return new Blob([new Uint8Array(byteNumbers)], { type: mimeType });
  }

  private isValidStorage(data: ImageData): boolean {
    const age = Date.now() - data.timestamp;
    return age < this.config.storageTTL;
  }

  private calculateStorageSize(
    data: Omit<ImageData, "blob"> & { blob: string }
  ): number {
    return new Blob([JSON.stringify(data)]).size;
  }

  cleanup(): void {
    this.cleanupStorage("local");
    this.cleanupStorage("session");
  }

  private cleanupStorage(type: "local" | "session"): void {
    try {
      const storage = type === "local" ? localStorage : sessionStorage;
      const key =
        type === "local" ? this.localStorageKey : this.sessionStorageKey;
      const cached = storage.getItem(key);

      if (!cached) return;

      const cache = JSON.parse(cached);
      const now = Date.now();
      const cleaned = {};

      for (const [src, data] of Object.entries(cache)) {
        const imageData = data as Omit<ImageData, "blob"> & { blob: string };
        if (now - imageData.timestamp < this.config.storageTTL) {
          (cleaned as Record<string, typeof data>)[src] = data;
        }
      }

      storage.setItem(key, JSON.stringify(cleaned));
    } catch (error) {
      console.warn("Failed to cleanup storage:", error);
    }
  }

  getStats() {
    const getStorageStats = (type: "local" | "session") => {
      try {
        const storage = type === "local" ? localStorage : sessionStorage;
        const key =
          type === "local" ? this.localStorageKey : this.sessionStorageKey;
        const cached = storage.getItem(key);

        if (!cached) return { items: 0, size: 0 };

        const cache = JSON.parse(cached);
        const items = Object.keys(cache).length;
        const size = new Blob([cached]).size;

        return { items, size };
      } catch {
        return { items: 0, size: 0 };
      }
    };

    return {
      localStorage: getStorageStats("local"),
      sessionStorage: getStorageStats("session"),
    };
  }

  destroy(): void {
    // Optionally clear all cached data
    try {
      localStorage.removeItem(this.localStorageKey);
      sessionStorage.removeItem(this.sessionStorageKey);
    } catch (error) {
      console.warn("Failed to clear storage on destroy:", error);
    }
  }
}
