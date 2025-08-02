import { getConfig } from "./config";

// دوال مساعدة عامة
export function generateKey(
  url: string,
  options?: { resize?: { width?: number; height?: number; quality?: number } }
): string {
  const config = getConfig();
  let key = url;

  if (options?.resize) {
    key += `_${options.resize.width || "auto"}x${
      options.resize.height || "auto"
    }`;
    key += `_q${options.resize.quality || config.quality}`;
  }

  return btoa(key).replace(/[+/=]/g, "");
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function getImageSize(
  dataUrl: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

export function resizeImage(
  dataUrl: string,
  maxWidth?: number,
  maxHeight?: number,
  quality?: number
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;

      let { width, height } = img;

      if (maxWidth && width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      if (maxHeight && height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(img, 0, 0, width, height);

      const resizedDataUrl = canvas.toDataURL(
        "image/jpeg",
        (quality || 80) / 100
      );
      resolve(resizedDataUrl);
    };
    img.src = dataUrl;
  });
}

export function createPlaceholder(
  width: number = 300,
  height: number = 200
): string {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  canvas.width = width;
  canvas.height = height;

  const config = getConfig();

  // رسم الخلفية
  ctx.fillStyle = config.placeholderColor;
  ctx.fillRect(0, 0, width, height);

  // رسم النص إذا كان موجوداً
  if (config.placeholderText) {
    ctx.fillStyle = "#9ca3af";
    ctx.font = "16px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(config.placeholderText, width / 2, height / 2);
  }

  return canvas.toDataURL();
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = window.setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
