import { getConfig } from "./config";
import { RetryPolicy } from "./types";

class FallbackManager {
  private retryPolicies: Map<string, RetryPolicy> = new Map();

  // تطبيق سياسة إعادة المحاولة
  async executeWithRetry<T>(
    key: string,
    operation: () => Promise<T>,
    onRetry?: (attempt: number, error: Error) => void
  ): Promise<T> {
    const config = getConfig();

    let policy = this.retryPolicies.get(key);
    if (!policy) {
      policy = {
        maxRetries: config.maxRetries,
        currentAttempt: 0,
        delay: config.retryDelay,
        backoffMultiplier: config.retryBackoffMultiplier,
      };
      this.retryPolicies.set(key, policy);
    }

    try {
      const result = await operation();
      // نجح التنفيذ، حذف سياسة إعادة المحاولة
      this.retryPolicies.delete(key);
      return result;
    } catch (error) {
      policy.currentAttempt++;

      if (policy.currentAttempt <= policy.maxRetries) {
        // إعلام المستدعي بإعادة المحاولة
        if (onRetry) {
          onRetry(policy.currentAttempt, error as Error);
        }

        // انتظار قبل إعادة المحاولة
        await this.delay(policy.delay);

        // زيادة التأخير للمحاولة التالية
        policy.delay *= policy.backoffMultiplier;

        // إعادة المحاولة
        return this.executeWithRetry(key, operation, onRetry);
      } else {
        // فشل نهائي، حذف السياسة
        this.retryPolicies.delete(key);
        throw error;
      }
    }
  }

  // إنشاء placeholder ذكي
  createSmartPlaceholder(
    width?: number,
    height?: number,
    options?: {
      showText?: boolean;
      customText?: string;
      backgroundColor?: string;
    }
  ): string {
    const config = getConfig();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    const w = width || 300;
    const h = height || 200;

    canvas.width = w;
    canvas.height = h;

    // الخلفية
    ctx.fillStyle = options?.backgroundColor || config.placeholderColor;
    ctx.fillRect(0, 0, w, h);

    // إضافة تدرج للجمالية
    const gradient = ctx.createLinearGradient(0, 0, w, h);
    gradient.addColorStop(0, "rgba(255, 255, 255, 0.1)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0.1)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // النص
    if (options?.showText !== false) {
      const text =
        options?.customText || config.placeholderText || `${w} × ${h}`;
      if (text) {
        ctx.fillStyle = "#9ca3af";
        ctx.font = `${Math.min(w, h) / 20}px system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, w / 2, h / 2);
      }
    }

    return canvas.toDataURL();
  }

  // إنشاء placeholder للأخطاء
  createErrorPlaceholder(
    width?: number,
    height?: number,
    errorMessage?: string
  ): string {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    const w = width || 300;
    const h = height || 200;

    canvas.width = w;
    canvas.height = h;

    // خلفية حمراء فاتحة
    ctx.fillStyle = "#fef2f2";
    ctx.fillRect(0, 0, w, h);

    // حدود حمراء
    ctx.strokeStyle = "#fca5a5";
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, w - 2, h - 2);

    // رمز X
    ctx.strokeStyle = "#ef4444";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";

    const centerX = w / 2;
    const centerY = h / 2;
    const size = Math.min(w, h) / 8;

    ctx.beginPath();
    ctx.moveTo(centerX - size, centerY - size);
    ctx.lineTo(centerX + size, centerY + size);
    ctx.moveTo(centerX + size, centerY - size);
    ctx.lineTo(centerX - size, centerY + size);
    ctx.stroke();

    // رسالة الخطأ
    if (errorMessage) {
      ctx.fillStyle = "#dc2626";
      ctx.font = `${Math.min(w, h) / 25}px system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const maxWidth = w - 20;
      const words = errorMessage.split(" ");
      let line = "";
      let y = centerY + size + 20;

      for (const word of words) {
        const testLine = line + word + " ";
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;

        if (testWidth > maxWidth && line !== "") {
          ctx.fillText(line, centerX, y);
          line = word + " ";
          y += 20;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, centerX, y);
    }

    return canvas.toDataURL();
  }

  // تنظيف سياسات إعادة المحاولة المنتهية
  cleanup(): void {
    // يمكن تنفيذ تنظيف دوري هنا إذا لزم الأمر
    for (const [key, policy] of this.retryPolicies.entries()) {
      // حذف السياسات القديمة (يمكن إضافة timestamp إذا لزم)
      if (policy.currentAttempt > policy.maxRetries) {
        this.retryPolicies.delete(key);
      }
    }
  }

  // الحصول على إحصائيات إعادة المحاولة
  getRetryStats(): { activePolicies: number; totalRetries: number } {
    let totalRetries = 0;
    for (const policy of this.retryPolicies.values()) {
      totalRetries += policy.currentAttempt;
    }

    return {
      activePolicies: this.retryPolicies.size,
      totalRetries,
    };
  }

  // دالة التأخير
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// إنشاء مثيل واحد لإدارة الاسترجاع
export const fallbackManager = new FallbackManager();
