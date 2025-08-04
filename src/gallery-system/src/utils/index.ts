export const getGridColumns = (columnsConfig?: {
  mobile: number;
  tablet: number;
  desktop: number;
}) => {
  const defaultConfig = { mobile: 1, tablet: 2, desktop: 4 };
  const config = { ...defaultConfig, ...columnsConfig };

  return `grid-cols-${config.mobile} sm:grid-cols-${config.tablet} lg:grid-cols-${config.desktop}`;
};

export const generatePhotoId = () => {
  return `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const optimizeImageUrl = (
  url: string,
  width?: number,
  quality: number = 80
) => {
  // يمكن تخصيص هذه الدالة لخدمات تحسين الصور المختلفة
  if (url.includes("unsplash.com")) {
    const params = new URLSearchParams();
    if (width) params.set("w", width.toString());
    params.set("q", quality.toString());
    params.set("auto", "format");
    params.set("fit", "crop");

    return `${url}?${params.toString()}`;
  }

  return url;
};

export const validatePhoto = (photo: Partial<Photo>): photo is Photo => {
  return !!(
    photo.id &&
    photo.src &&
    photo.title &&
    photo.category &&
    photo.description
  );
};
