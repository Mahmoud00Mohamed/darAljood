import React, { createContext, useContext, useState, useEffect } from "react";
import { CloudinaryImageData } from "../services/imageUploadService";

export interface PredefinedImage {
  id: string;
  url: string;
  name: string;
  category?: string;
  description?: string;
}

export interface SelectedImage {
  id: string;
  url: string;
  name: string;
  source: "predefined" | "user";
  selectedAt: Date;
}

interface ImageLibraryContextType {
  // الصور الجاهزة
  predefinedImages: PredefinedImage[];
  loadPredefinedImages: () => Promise<void>;

  // صور المستخدم
  userImages: CloudinaryImageData[];
  addUserImage: (image: CloudinaryImageData) => void;
  removeUserImage: (publicId: string) => void;

  // الصور المحددة للاستخدام في التصميم
  selectedImages: SelectedImage[];
  selectImage: (
    image: PredefinedImage | CloudinaryImageData,
    source: "predefined" | "user"
  ) => void;
  unselectImage: (imageId: string) => void;
  clearSelectedImages: () => void;
  isImageSelected: (imageId: string) => boolean;

  // حالة التحميل
  isLoading: boolean;
  error: string | null;
}

const ImageLibraryContext = createContext<ImageLibraryContextType | undefined>(
  undefined
);

// eslint-disable-next-line react-refresh/only-export-components
export const useImageLibrary = () => {
  const context = useContext(ImageLibraryContext);
  if (!context) {
    throw new Error("useImageLibrary must be used within ImageLibraryProvider");
  }
  return context;
};

export const ImageLibraryProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [predefinedImages, setPredefinedImages] = useState<PredefinedImage[]>(
    []
  );
  const [userImages, setUserImages] = useState<CloudinaryImageData[]>(() => {
    try {
      const saved = localStorage.getItem("userImages");
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch (error) {
      console.warn("Failed to load user images from localStorage:", error);
    }
    return [];
  });
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>(() => {
    try {
      const saved = localStorage.getItem("selectedImages");
      if (saved) {
        const parsed = JSON.parse(saved);
        const validatedImages = parsed.map(
          (img: SelectedImage & { selectedAt: string }) => ({
            ...img,
            selectedAt: new Date(img.selectedAt),
          })
        );
        return Array.isArray(validatedImages) ? validatedImages : [];
      }
    } catch (error) {
      console.warn("Failed to load selected images from localStorage:", error);
    }
    return [];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // حفظ صور المستخدم في localStorage عند تغييرها
  useEffect(() => {
    try {
      localStorage.setItem("userImages", JSON.stringify(userImages));
    } catch (error) {
      console.warn("Failed to save user images to localStorage:", error);
    }
  }, [userImages]);

  // حفظ الصور المحددة في localStorage عند تغييرها
  useEffect(() => {
    try {
      localStorage.setItem("selectedImages", JSON.stringify(selectedImages));
    } catch (error) {
      console.warn("Failed to save selected images to localStorage:", error);
    }
  }, [selectedImages]);

  // تحميل الصور الجاهزة من الباك إند
  const loadPredefinedImages = async () => {
    setIsLoading(true);
    setError(null);

    // استخدم البيانات المحلية مباشرة
    const fallbackImages: PredefinedImage[] = [
      {
        id: "logo1",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924691/16_ubbdbh.png",
        name: "شعار 1",
        category: "شعارات جاهزة",
        description: "شعار جاهز للاستخدام",
      },
      {
        id: "logo2",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924689/15_l0llk1.png",
        name: "شعار 2",
        category: "شعارات جاهزة",
        description: "شعار جاهز للاستخدام",
      },
      {
        id: "logo3",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924688/14_htk85j.png",
        name: "شعار 3",
        category: "شعارات جاهزة",
        description: "شعار جاهز للاستخدام",
      },
      {
        id: "logo4",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924676/21_swow6t.png",
        name: "شعار 4",
        category: "شعارات جاهزة",
        description: "شعار جاهز للاستخدام",
      },
      {
        id: "logo5",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924675/22_c9rump.png",
        name: "شعار 5",
        category: "شعارات جاهزة",
        description: "شعار جاهز للاستخدام",
      },
      {
        id: "logo6",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924671/24_x6nvyt.png",
        name: "شعار 6",
        category: "شعارات جاهزة",
        description: "شعار جاهز للاستخدام",
      },
      {
        id: "logo7",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924669/20_guvnha.png",
        name: "شعار 7",
        category: "شعارات جاهزة",
        description: "شعار جاهز للاستخدام",
      },
      {
        id: "logo8",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924661/23_rroabu.png",
        name: "شعار 8",
        category: "شعارات جاهزة",
        description: "شعار جاهز للاستخدام",
      },
      {
        id: "logo9",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924658/18_cpbs4b.png",
        name: "شعار 9",
        category: "شعارات جاهزة",
        description: "شعار جاهز للاستخدام",
      },
      {
        id: "logo10",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924657/19_kxggs4.png",
        name: "شعار 10",
        category: "شعارات جاهزة",
        description: "شعار جاهز للاستخدام",
      },
      {
        id: "logo11",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924650/17_k8axov.png",
        name: "شعار 11",
        category: "شعارات جاهزة",
        description: "شعار جاهز للاستخدام",
      },
      {
        id: "logo12",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924644/12_woyybb.png",
        name: "شعار 12",
        category: "شعارات جاهزة",
        description: "شعار جاهز للاستخدام",
      },
      {
        id: "logo13",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924644/13_mvqmgk.png",
        name: "شعار 13",
        category: "شعارات جاهزة",
        description: "شعار جاهز للاستخدام",
      },
      {
        id: "logo14",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924636/11_revnd6.png",
        name: "شعار 14",
        category: "شعارات جاهزة",
        description: "شعار جاهز للاستخدام",
      },
      {
        id: "logo15",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924629/9_ysz5vg.png",
        name: "شعار 15",
        category: "شعارات جاهزة",
        description: "شعار جاهز للاستخدام",
      },
      {
        id: "logo16",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924627/7_ptxh2b.png",
        name: "شعار 16",
        category: "شعارات جاهزة",
        description: "شعار جاهز للاستخدام",
      },
      {
        id: "logo17",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924622/10_yhvn0o.png",
        name: "شعار 17",
        category: "شعارات جاهزة",
        description: "شعار جاهز للاستخدام",
      },
      {
        id: "logo18",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924621/2_vobopy.png",
        name: "شعار 18",
        category: "شعارات جاهزة",
        description: "شعار جاهز للاستخدام",
      },
      {
        id: "logo19",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924621/1_kqcgdh.png",
        name: "شعار 19",
        category: "شعارات جاهزة",
        description: "شعار جاهز للاستخدام",
      },
      {
        id: "logo20",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924621/8_yoay91.png",
        name: "شعار 20",
        category: "شعارات جاهزة",
        description: "شعار جاهز للاستخدام",
      },
      {
        id: "logo21",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924610/6_xfyebx.png",
        name: "شعار 21",
        category: "شعارات جاهزة",
        description: "شعار جاهز للاستخدام",
      },
      {
        id: "logo22",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924609/5_oupz1k.png",
        name: "شعار 22",
        category: "شعارات جاهزة",
        description: "شعار جاهز للاستخدام",
      },
      {
        id: "logo23",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924603/3_k7zsjo.png",
        name: "شعار 23",
        category: "شعارات جاهزة",
        description: "شعار جاهز للاستخدام",
      },
      {
        id: "logo24",
        url: "https://res.cloudinary.com/dnuthlqsb/image/upload/v1749924602/4_v07jhi.png",
        name: "شعار 24",
        category: "شعارات جاهزة",
        description: "شعار جاهز للاستخدام",
      },
    ];

    setPredefinedImages(fallbackImages);
    setIsLoading(false);
  };

  // إضافة صورة مستخدم جديدة
  const addUserImage = (image: CloudinaryImageData) => {
    setUserImages((prev) => {
      const exists = prev.some((img) => img.publicId === image.publicId);
      if (exists) return prev;
      const newImages = [image, ...prev];

      return newImages;
    });
  };

  // حذف صورة مستخدم
  const removeUserImage = (publicId: string) => {
    setUserImages((prev) => prev.filter((img) => img.publicId !== publicId));
    // حذف من الصور المحددة أيضاً
    setSelectedImages((prev) => prev.filter((img) => img.id !== publicId));
  };

  // تحديد صورة للاستخدام في التصميم
  const selectImage = (
    image: PredefinedImage | CloudinaryImageData,
    source: "predefined" | "user"
  ) => {
    // استخدام type guard للتمييز بين النوعين
    const imageId =
      source === "predefined"
        ? (image as PredefinedImage).id
        : (image as CloudinaryImageData).publicId;

    const imageName =
      source === "predefined"
        ? (image as PredefinedImage).name
        : (image as CloudinaryImageData).originalName ||
          (image as CloudinaryImageData).publicId.split("/").pop() ||
          "صورة";

    setSelectedImages((prev) => {
      const exists = prev.some((img) => img.id === imageId);
      if (exists) return prev;

      const newSelectedImage: SelectedImage = {
        id: imageId,
        url: image.url,
        name: imageName,
        source,
        selectedAt: new Date(),
      };

      return [newSelectedImage, ...prev];
    });
  };

  // إلغاء تحديد صورة
  const unselectImage = (imageId: string) => {
    setSelectedImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  // مسح جميع الصور المحددة
  const clearSelectedImages = () => {
    setSelectedImages([]);
  };

  // التحقق من تحديد صورة
  const isImageSelected = (imageId: string) => {
    return selectedImages.some((img) => img.id === imageId);
  };

  // تحميل الصور الجاهزة عند بدء التطبيق
  useEffect(() => {
    loadPredefinedImages();
  }, []);

  return (
    <ImageLibraryContext.Provider
      value={{
        predefinedImages,
        loadPredefinedImages,
        userImages,
        addUserImage,
        removeUserImage,
        selectedImages,
        selectImage,
        unselectImage,
        clearSelectedImages,
        isImageSelected,
        isLoading,
        error,
      }}
    >
      {children}
    </ImageLibraryContext.Provider>
  );
};
