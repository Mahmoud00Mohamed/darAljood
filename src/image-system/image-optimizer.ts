import { ResponsiveVariants, ImageMetadata } from "./types";
import { defaultConfig, ImageSystemConfig } from "./config";

export class ImageOptimizer {
  private config: ImageSystemConfig["optimization"];

  constructor(
    config: ImageSystemConfig["optimization"] = defaultConfig.optimization
  ) {
    this.config = config;
  }

  optimizeUrl(
    baseUrl: string,
    size: "small" | "medium" | "large" | "auto" = "auto",
    format?: string
  ): string {
    if (!this.config.enableResponsive) {
      return baseUrl;
    }

    let optimizedUrl = baseUrl;

    // تحديد الحجم المناسب
    const targetSize = this.determineTargetSize(size);

    // تحديد النسق المناسب
    const targetFormat = format || this.selectBestFormat();

    // تطبيق device pixel ratio
    const dpr = this.config.devicePixelRatio ? window.devicePixelRatio || 1 : 1;
    const finalSize = Math.round(targetSize * dpr);

    // بناء URL محسن (يتطلب خدمة تحسين صور)
    optimizedUrl = this.buildOptimizedUrl(baseUrl, finalSize, targetFormat);

    return optimizedUrl;
  }

  generateResponsiveVariants(baseUrl: string): ResponsiveVariants {
    if (!this.config.enableResponsive) {
      return {};
    }

    const variants: ResponsiveVariants = {};
    const bestFormat = this.selectBestFormat();

    variants.small = this.buildOptimizedUrl(
      baseUrl,
      this.config.sizes.small,
      bestFormat
    );
    variants.medium = this.buildOptimizedUrl(
      baseUrl,
      this.config.sizes.medium,
      bestFormat
    );
    variants.large = this.buildOptimizedUrl(
      baseUrl,
      this.config.sizes.large,
      bestFormat
    );

    return variants;
  }

  private determineTargetSize(
    size: "small" | "medium" | "large" | "auto"
  ): number {
    if (size === "auto") {
      // تحديد الحجم بناءً على viewport
      const width = window.innerWidth;
      if (width <= 480) return this.config.sizes.small;
      if (width <= 768) return this.config.sizes.medium;
      return this.config.sizes.large;
    }

    return this.config.sizes[size];
  }

  private selectBestFormat(): string {
    // فحص دعم المتصفح للصيغ الحديثة
    for (const format of this.config.formats) {
      if (this.supportsFormat(format)) {
        return format;
      }
    }

    return "jpg"; // fallback
  }

  private supportsFormat(format: string): boolean {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;

    try {
      const dataUrl = canvas.toDataURL(`image/${format}`);
      return dataUrl.indexOf(`data:image/${format}`) === 0;
    } catch {
      return false;
    }
  }

  private buildOptimizedUrl(
    baseUrl: string,
    size: number,
    format: string
  ): string {
    // هذا مثال، يجب تعديله حسب خدمة تحسين الصور المستخدمة
    // مثل Cloudinary، ImageKit، أو خدمة مخصصة

    const url = new URL(baseUrl);

    // إضافة معاملات التحسين
    url.searchParams.set("w", size.toString());
    url.searchParams.set("f", format);
    url.searchParams.set("q", "auto");

    return url.toString();
  }

  extractMetadata(img: HTMLImageElement): ImageMetadata {
    return {
      width: img.naturalWidth,
      height: img.naturalHeight,
      format: this.guessFormat(img.src),
      source: img.src,
      responsive: this.generateResponsiveVariants(img.src),
    };
  }

  private guessFormat(src: string): string {
    const extension = src.split(".").pop()?.toLowerCase();
    return extension || "unknown";
  }
}
