import React, { createContext, useContext, useState, useEffect } from "react";
import { CloudinaryImageData } from "../services/imageUploadService";
import predefinedImagesService from "../services/predefinedImagesService";
import categoryService, { CategoryData } from "../services/categoryService";
import authService from "../services/authService";
import { useJacket } from "./JacketContext";

export interface PredefinedImage {
  id: string;
  url: string;
  name: string;
  categoryId: string;
  description?: string;
  publicId: string;
  createdAt: string;
  updatedBy: string;
  width?: number;
  height?: number;
  format?: string;
  size?: number;
  category?: {
    id: string;
    name: string;
    color: string;
    icon: string;
  };
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
  categories: CategoryData[];
  loadPredefinedImages: () => Promise<void>;
  addPredefinedImage: (
    file: File,
    name: string,
    categoryId: string,
    description?: string
  ) => Promise<void>;
  deletePredefinedImage: (imageId: string) => Promise<void>;
  updatePredefinedImage: (
    imageId: string,
    updates: { name?: string; categoryId?: string; description?: string }
  ) => Promise<void>;

  // التصنيفات
  loadCategories: () => Promise<void>;
  createCategory: (categoryData: {
    name: string;
    description?: string;
    color?: string;
    icon?: string;
  }) => Promise<void>;
  updateCategory: (
    categoryId: string,
    updates: {
      name?: string;
      description?: string;
      color?: string;
      icon?: string;
    }
  ) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;

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

  // وظائف مزامنة التصميم
  removeImageFromDesign: (imageUrl: string) => void;
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

// Hook منفصل لاستخدام JacketContext داخل ImageLibraryProvider
const useImageDesignSync = () => {
  try {
    const jacketContext = useJacket();
    return jacketContext;
  } catch {
    // إذا لم يكن JacketContext متوفراً، أرجع null
    return null;
  }
};
export const ImageLibraryProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [predefinedImages, setPredefinedImages] = useState<PredefinedImage[]>(
    []
  );
  const [categories, setCategories] = useState<CategoryData[]>([]);
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

  // استخدام hook منفصل للحصول على JacketContext
  const jacketContext = useImageDesignSync();
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

  // وظيفة إزالة الصورة من التصميم
  const removeImageFromDesign = (imageUrl: string) => {
    if (!jacketContext) {
      console.warn(
        "JacketContext not available, cannot remove image from design"
      );
      return;
    }

    try {
      // البحث عن الشعارات التي تستخدم هذه الصورة وحذفها
      const logosToRemove = jacketContext.jacketState.logos.filter(
        (logo) => logo.image === imageUrl
      );

      logosToRemove.forEach((logo) => {
        console.log(
          `Removing logo ${logo.id} from design due to image deletion`
        );
        jacketContext.removeLogo(logo.id);
      });

      if (logosToRemove.length > 0) {
        console.log(
          `Removed ${logosToRemove.length} logos from design after image deletion`
        );
      }
    } catch (error) {
      console.error("Error removing image from design:", error);
    }
  };
  // تحميل الصور الجاهزة من الباك إند
  const loadPredefinedImages = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data =
        await predefinedImagesService.loadPredefinedImagesWithCategories();
      setPredefinedImages(data.images);
      setCategories(data.categories);
    } catch (error) {
      console.error("Error loading predefined images:", error);
      setError(
        error instanceof Error ? error.message : "فشل في تحميل البيانات"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // إضافة شعار جاهز جديد
  const addPredefinedImage = async (
    file: File,
    name: string,
    categoryId: string,
    description?: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const newImage = await predefinedImagesService.addPredefinedImage(
        file,
        name,
        categoryId,
        description
      );
      setPredefinedImages((prev) => [...prev, newImage]);
    } catch (error) {
      console.error("Error adding predefined image:", error);
      setError(
        error instanceof Error ? error.message : "فشل في إضافة الشعار الجاهز"
      );
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // حذف شعار جاهز
  const deletePredefinedImage = async (imageId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // العثور على الصورة المراد حذفها للحصول على URL
      const imageToDelete = predefinedImages.find((img) => img.id === imageId);
      const imageUrl = imageToDelete?.url;

      await predefinedImagesService.deletePredefinedImage(imageId);
      setPredefinedImages((prev) => prev.filter((img) => img.id !== imageId));
      // حذف من الصور المحددة أيضاً
      setSelectedImages((prev) => prev.filter((img) => img.id !== imageId));

      // حذف الصورة من التصميم إذا كانت مستخدمة
      if (imageUrl) {
        removeImageFromDesign(imageUrl);
      }
    } catch (error) {
      console.error("Error deleting predefined image:", error);
      setError(
        error instanceof Error ? error.message : "فشل في حذف الشعار الجاهز"
      );
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // تحديث معلومات شعار جاهز
  const updatePredefinedImage = async (
    imageId: string,
    updates: { name?: string; categoryId?: string; description?: string }
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const updatedImage = await predefinedImagesService.updatePredefinedImage(
        imageId,
        updates
      );
      setPredefinedImages((prev) =>
        prev.map((img) => (img.id === imageId ? updatedImage : img))
      );
      // تحديث في الصور المحددة أيضاً
      setSelectedImages((prev) =>
        prev.map((img) =>
          img.id === imageId ? { ...img, name: updatedImage.name } : img
        )
      );
    } catch (error) {
      console.error("Error updating predefined image:", error);
      setError(
        error instanceof Error ? error.message : "فشل في تحديث الشعار الجاهز"
      );
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // تحميل التصنيفات
  const loadCategories = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error loading categories:", error);
      setError(
        error instanceof Error ? error.message : "فشل في تحميل التصنيفات"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // إنشاء تصنيف جديد
  const createCategory = async (categoryData: {
    name: string;
    description?: string;
    color?: string;
    icon?: string;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = authService.getToken();
      if (!token) throw new Error("رمز المصادقة غير موجود");

      const newCategory = await categoryService.createCategory(
        categoryData,
        token
      );
      setCategories((prev) =>
        [...prev, newCategory].sort((a, b) => a.order - b.order)
      );
    } catch (error) {
      console.error("Error creating category:", error);
      setError(error instanceof Error ? error.message : "فشل في إنشاء التصنيف");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // تحديث تصنيف
  const updateCategory = async (
    categoryId: string,
    updates: {
      name?: string;
      description?: string;
      color?: string;
      icon?: string;
    }
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = authService.getToken();
      if (!token) throw new Error("رمز المصادقة غير موجود");

      const updatedCategory = await categoryService.updateCategory(
        categoryId,
        updates,
        token
      );
      setCategories((prev) =>
        prev.map((cat) => (cat.id === categoryId ? updatedCategory : cat))
      );
    } catch (error) {
      console.error("Error updating category:", error);
      setError(error instanceof Error ? error.message : "فشل في تحديث التصنيف");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // حذف تصنيف
  const deleteCategory = async (categoryId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = authService.getToken();
      if (!token) throw new Error("رمز المصادقة غير موجود");

      // العثور على جميع الصور في هذا التصنيف قبل الحذف
      const imagesInCategory = predefinedImages.filter(
        (img) => img.categoryId === categoryId
      );

      await categoryService.deleteCategory(categoryId, token);
      setCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
      // حذف الصور المرتبطة بهذا التصنيف من الصور المحددة
      setSelectedImages((prev) =>
        prev.filter((img) => {
          const predefinedImg = predefinedImages.find(
            (pImg) => pImg.id === img.id
          );
          return !predefinedImg || predefinedImg.categoryId !== categoryId;
        })
      );

      // حذف جميع الصور في هذا التصنيف من التصميم
      imagesInCategory.forEach((image) => {
        removeImageFromDesign(image.url);
      });
    } catch (error) {
      console.error("Error deleting category:", error);
      setError(error instanceof Error ? error.message : "فشل في حذف التصنيف");
      throw error;
    } finally {
      setIsLoading(false);
    }
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
    // العثور على الصورة المراد حذفها للحصول على URL
    const imageToDelete = userImages.find((img) => img.publicId === publicId);
    const imageUrl = imageToDelete?.url;

    setUserImages((prev) => prev.filter((img) => img.publicId !== publicId));
    // حذف من الصور المحددة أيضاً
    setSelectedImages((prev) => prev.filter((img) => img.id !== publicId));

    // حذف الصورة من التصميم إذا كانت مستخدمة
    if (imageUrl) {
      removeImageFromDesign(imageUrl);
    }
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
    // العثور على الصورة المراد إلغاء تحديدها للحصول على URL
    const imageToUnselect = selectedImages.find((img) => img.id === imageId);
    const imageUrl = imageToUnselect?.url;

    setSelectedImages((prev) => prev.filter((img) => img.id !== imageId));

    // حذف الصورة من التصميم عند إلغاء التحديد
    if (imageUrl) {
      removeImageFromDesign(imageUrl);
    }
  };

  // مسح جميع الصور المحددة
  const clearSelectedImages = () => {
    // حذف جميع الصور المحددة من التصميم
    selectedImages.forEach((image) => {
      removeImageFromDesign(image.url);
    });

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
        categories,
        loadPredefinedImages,
        addPredefinedImage,
        deletePredefinedImage,
        updatePredefinedImage,
        loadCategories,
        createCategory,
        updateCategory,
        deleteCategory,
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
        removeImageFromDesign,
      }}
    >
      {children}
    </ImageLibraryContext.Provider>
  );
};
