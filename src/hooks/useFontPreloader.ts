import { useState, useEffect } from "react";
import fontPreloader from "../utils/fontPreloader";

interface UseFontPreloaderReturn {
  isLoading: boolean;
  loadedFonts: string[];
  loadFont: (fontFamily: string) => Promise<void>;
  preloadAll: () => Promise<void>;
  isFontReady: (fontFamily: string) => boolean;
}

/**
 * Hook لإدارة تحميل الخطوط مع حالة التحميل
 */
export const useFontPreloader = (): UseFontPreloaderReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadedFonts, setLoadedFonts] = useState<string[]>([]);

  // تحديث قائمة الخطوط المحملة
  const updateLoadedFonts = () => {
    setLoadedFonts(fontPreloader.getLoadedFonts());
  };

  // تحميل خط معين
  const loadFont = async (fontFamily: string) => {
    setIsLoading(true);
    try {
      await fontPreloader.ensureFontLoaded(fontFamily);
      updateLoadedFonts();
    } catch (error) {
      console.warn(`Failed to load font: ${fontFamily}`, error);
    } finally {
      setIsLoading(false);
    }
  };

  // تحميل جميع الخطوط
  const preloadAll = async () => {
    setIsLoading(true);
    try {
      await fontPreloader.preloadAllFonts();
      updateLoadedFonts();
    } catch (error) {
      console.warn("Failed to preload fonts", error);
    } finally {
      setIsLoading(false);
    }
  };

  // التحقق من جاهزية خط معين
  const isFontReady = (fontFamily: string): boolean => {
    return fontPreloader.isFontLoaded(fontFamily);
  };

  // تحديث قائمة الخطوط عند التحميل الأولي
  useEffect(() => {
    updateLoadedFonts();
  }, []);

  return {
    isLoading,
    loadedFonts,
    loadFont,
    preloadAll,
    isFontReady,
  };
};

export default useFontPreloader;
