export function generatePlaceholder(
  width: number,
  height: number,
  color = "#f3f4f6"
): string {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  canvas.width = width;
  canvas.height = height;

  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);

  return canvas.toDataURL();
}

export function createBlurHash(imageData: ImageData): string {
  // Simple blur hash implementation for placeholder
  // In production, you might want to use a proper blurhash library
  const { width, height, data } = imageData;
  const blockSize = 4;
  const blocksX = Math.ceil(width / blockSize);
  const blocksY = Math.ceil(height / blockSize);

  const blocks: number[][] = [];

  for (let y = 0; y < blocksY; y++) {
    for (let x = 0; x < blocksX; x++) {
      let r = 0,
        g = 0,
        b = 0,
        count = 0;

      for (let dy = 0; dy < blockSize; dy++) {
        for (let dx = 0; dx < blockSize; dx++) {
          const px = x * blockSize + dx;
          const py = y * blockSize + dy;

          if (px < width && py < height) {
            const i = (py * width + px) * 4;
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
            count++;
          }
        }
      }

      if (count > 0) {
        blocks.push([r / count, g / count, b / count]);
      }
    }
  }

  return blocks
    .map(
      ([r, g, b]) => `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`
    )
    .join(",");
}

export function getImageDimensions(
  src: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () =>
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = reject;
    img.src = src;
  });
}

export function isImageUrl(url: string): boolean {
  const imageExtensions = /\.(jpg|jpeg|png|gif|webp|avif|svg)$/i;
  return imageExtensions.test(url) || url.includes("image");
}

export function optimizeImageFormat(
  src: string,
  supportWebP = true,
  supportAVIF = false
): string {
  if (!src.startsWith("http")) return src;

  try {
    const url = new URL(src);

    if (supportAVIF && "createImageBitmap" in window) {
      url.searchParams.set("format", "avif");
    } else if (supportWebP) {
      url.searchParams.set("format", "webp");
    }

    return url.toString();
  } catch {
    return src;
  }
}
