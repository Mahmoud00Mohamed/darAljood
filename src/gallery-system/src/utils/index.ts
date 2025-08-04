export const optimizeImageUrl = (
  url: string,
  options: {
    width?: number;
    quality?: number;
    blur?: number;
    format?: "webp" | "jpeg" | "png";
  }
) => {
  if (!url.includes("unsplash.com")) {
    return url;
  }

  try {
    const urlObj = new URL(url);
    const params = urlObj.searchParams;

    if (options.width) params.set("w", options.width.toString());
    params.set("q", (options.quality || 75).toString());
    params.set("auto", "format");
    if (options.format) params.set("fm", options.format);
    if (options.blur) params.set("blur", options.blur.toString());

    params.set("fit", "max");

    return urlObj.toString();
  } catch (e) {
    return url;
  }
};
