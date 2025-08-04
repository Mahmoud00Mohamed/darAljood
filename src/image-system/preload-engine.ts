import { PreloadOptions } from "./types";
import { defaultConfig, ImageSystemConfig } from "./config";

interface PreloadTask {
  url: string;
  priority: number;
  options: PreloadOptions;
  promise: Promise<string>;
  resolve: (value: string) => void;
  reject: (reason: Error) => void;
}

export class PreloadEngine {
  private queue: PreloadTask[] = [];
  private running = new Set<string>();
  private completed = new Set<string>();
  private config: ImageSystemConfig["preload"];

  constructor(config: ImageSystemConfig["preload"] = defaultConfig.preload) {
    this.config = config;
  }

  predictAndPreload(keysOrUrls: string[], options: PreloadOptions = {}): void {
    if (!this.config.enabled) return;

    keysOrUrls.forEach((url) => {
      this.markAsNeeded(url, options);
    });
  }

  markAsNeeded(
    keyOrUrl: string,
    options: PreloadOptions = {}
  ): Promise<string> {
    // إذا تم تحميلها مسبقاً
    if (this.completed.has(keyOrUrl)) {
      return Promise.resolve(keyOrUrl);
    }

    // إذا كانت قيد التحميل
    const existingTask = this.queue.find((task) => task.url === keyOrUrl);
    if (existingTask) {
      return existingTask.promise;
    }

    // إنشاء مهمة جديدة
    let resolve: (value: string) => void;
    let reject: (reason: Error) => void;

    const promise = new Promise<string>((res, rej) => {
      resolve = res;
      reject = rej;
    });

    const task: PreloadTask = {
      url: keyOrUrl,
      priority: options.priority || this.config.priority.predicted,
      options,
      promise,
      resolve: resolve!,
      reject: reject!,
    };

    this.queue.push(task);
    this.sortQueue();
    this.processQueue();

    return promise;
  }

  private sortQueue(): void {
    this.queue.sort((a, b) => a.priority - b.priority);
  }

  private async processQueue(): Promise<void> {
    if (this.running.size >= this.config.maxConcurrent) {
      return;
    }

    const task = this.queue.shift();
    if (!task) return;

    this.running.add(task.url);

    try {
      const result = await this.loadImage(task.url);
      task.resolve(result);
      this.completed.add(task.url);
    } catch (error) {
      console.warn("خطأ في تحميل الصورة المسبق:", error);
      task.reject(error as Error);
    } finally {
      this.running.delete(task.url);
      // معالجة المهمة التالية
      if (this.queue.length > 0) {
        this.processQueue();
      }
    }
  }

  private async loadImage(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        // تحويل إلى canvas للحصول على البيانات
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("فشل في إنشاء canvas context"));
          return;
        }

        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);

        try {
          const dataUrl = canvas.toDataURL();
          resolve(dataUrl);
        } catch (error) {
          reject(new Error("فشل في تحويل الصورة إلى data URL"));
        }
      };

      img.onerror = () => {
        reject(new Error(`فشل في تحميل الصورة: ${url}`));
      };

      img.crossOrigin = "anonymous";
      img.src = url;
    });
  }

  getQueueStatus(): {
    queued: number;
    running: number;
    completed: number;
  } {
    return {
      queued: this.queue.length,
      running: this.running.size,
      completed: this.completed.size,
    };
  }

  clearCompleted(): void {
    this.completed.clear();
  }

  cancelAll(): void {
    this.queue.forEach((task) => {
      task.reject(new Error("تم إلغاء التحميل"));
    });
    this.queue = [];
    this.running.clear();
  }
}
