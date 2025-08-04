import { ImageConfig } from './types';

export const generateCacheKey = (url: string, options?: any): string => {
  const baseKey = btoa(url).replace(/[^a-zA-Z0-9]/g, '');
  const optionsHash = options ? btoa(JSON.stringify(options)).slice(0, 8) : '';
  return `img_${baseKey}_${optionsHash}`;
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const detectWebPSupport = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
};

export const optimizeImageUrl = (url: string, config: ImageConfig, width?: number, height?: number): string => {
  if (!config.enableWebP && !width && !height) {
    return url;
  }
  
  // Simple URL optimization - in real world, this would integrate with image CDN
  const params = new URLSearchParams();
  
  if (width) params.append('w', width.toString());
  if (height) params.append('h', height.toString());
  if (config.enableWebP) params.append('format', 'webp');
  if (config.quality !== 'auto') params.append('q', config.quality);
  
  if (params.toString()) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}${params.toString()}`;
  }
  
  return url;
};

export const createPlaceholderDataUrl = (width: number, height: number, color: string): string => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);
    
    // Add subtle pattern
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for (let i = 0; i < width; i += 20) {
      for (let j = 0; j < height; j += 20) {
        if ((i + j) % 40 === 0) {
          ctx.fillRect(i, j, 10, 10);
        }
      }
    }
  }
  
  return canvas.toDataURL();
};

export const calculateImageSize = (blob: Blob): number => {
  return blob.size;
};

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};
