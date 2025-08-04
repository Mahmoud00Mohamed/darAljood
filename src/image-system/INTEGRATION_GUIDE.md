## 🔗 2. طرق الاستيراد والاستخدام

### أ) الاستيراد الأساسي (الأكثر شيوعاً)

```tsx
// في أي ملف React component
import { SmoothImage, preloadImages } from "./image-system";
// أو حسب مكان المجلد
import { SmoothImage, preloadImages } from "../image-system";
import { SmoothImage, preloadImages } from "../../image-system";
```

### ب) الاستيراد المفصل

```tsx
// استيراد مكونات محددة
import { SmoothImage } from "./image-system/smooth-image";
import { loadImage } from "./image-system";
import { ImageLoader } from "./image-system/image-loader";

// أو استيراد الكل
import * as ImageSystem from "./image-system";
```

### ج) استيراد مع alias

```tsx
// في حالة وجود تضارب في الأسماء
import {
  SmoothImage as AdvancedImage,
  loadImage as loadAdvancedImage,
} from "./image-system";
```

## 🗂️ 3. هياكل المشاريع المختلفة

### هيكل مشروع عادي

```
your-project/
├── src/
│   ├── components/
│   │   └── Gallery.tsx
│   ├── image-system/          ← النظام هنا
│   │   ├── index.ts
│   │   ├── smooth-image.tsx
│   │   └── ...
│   ├── App.tsx
│   └── main.tsx
```

```tsx
// في src/components/Gallery.tsx
import { SmoothImage } from "../image-system";

export const Gallery = () => {
  return <SmoothImage src="https://example.com/image.jpg" alt="صورة" />;
};
```

### هيكل مشروع مع مجلدات فرعية

```
your-project/
├── src/
│   ├── features/
│   │   ├── gallery/
│   │   │   └── components/
│   │   │       └── PhotoGrid.tsx
│   │   └── profile/
│   │       └── components/
│   │           └── Avatar.tsx
│   ├── shared/
│   │   └── image-system/      ← النظام هنا
│   │       ├── index.ts
│   │       └── ...
│   └── App.tsx
```

```tsx
// في src/features/gallery/components/PhotoGrid.tsx
import { SmoothImage } from "../../../shared/image-system";

// في src/features/profile/components/Avatar.tsx
import { SmoothImage } from "../../../shared/image-system";
```

### هيكل مشروع Monorepo

```
monorepo/
├── packages/
│   ├── image-system/          ← حزمة مستقلة
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   └── ...
│   │   └── tsconfig.json
│   ├── web-app/
│   │   ├── src/
│   │   │   └── App.tsx
│   │   └── package.json
│   └── mobile-app/
│       └── ...
```

```json
// في packages/image-system/package.json
{
  "name": "@company/image-system",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts"
}

// في packages/web-app/package.json
{
  "dependencies": {
    "@company/image-system": "workspace:*"
  }
}
```

```tsx
// في packages/web-app/src/App.tsx
import { SmoothImage } from "@company/image-system";
```

## ⚙️ 4. إعداد TypeScript والمسارات

### إعداد TypeScript paths (اختياري)

```json
// في tsconfig.json
{
  "compilerOptions": {
    "baseUrl": "./src",
    "paths": {
      "@/image-system/*": ["image-system/*"],
      "@/components/*": ["components/*"],
      "@/utils/*": ["utils/*"]
    }
  }
}
```

```tsx
// الآن يمكن الاستيراد بشكل أبسط
import { SmoothImage } from "@/image-system";
```

### إعداد Vite aliases

```ts
// في vite.config.ts
import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@/image-system": path.resolve(__dirname, "src/image-system"),
    },
  },
});
```

## 🔧 5. التخصيص حسب المشروع

### إنشاء wrapper مخصص

```tsx
// في src/components/ProjectImage.tsx
import React from "react";
import { SmoothImage, SmoothImageProps } from "../image-system";

// wrapper مخصص للمشروع مع إعدادات افتراضية
interface ProjectImageProps extends Omit<SmoothImageProps, "fadeTransition"> {
  variant?: "avatar" | "gallery" | "hero";
}

export const ProjectImage: React.FC<ProjectImageProps> = ({
  variant = "gallery",
  className = "",
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "avatar":
        return "w-12 h-12 rounded-full object-cover";
      case "hero":
        return "w-full h-96 object-cover";
      case "gallery":
      default:
        return "w-full h-64 object-cover rounded-lg";
    }
  };

  return (
    <SmoothImage
      {...props}
      className={`${getVariantStyles()} ${className}`}
      fadeTransition={500}
      priority={variant === "hero" ? "high" : "normal"}
    />
  );
};
```

### إعداد context للمشروع

```tsx
// في src/contexts/ImageContext.tsx
import React, { createContext, useContext, ReactNode } from "react";
import { ImageLoader } from "../image-system";

interface ImageContextType {
  loader: ImageLoader;
  preloadGallery: (images: string[]) => Promise<void>;
}

const ImageContext = createContext<ImageContextType | null>(null);

// إعدادات مخصصة للمشروع
const projectImageLoader = new ImageLoader({
  cache: {
    maxAge: 8 * 60 * 60 * 1000, // 8 ساعات للمشروع
    maxSize: 200,
  },
  display: {
    fadeTransition: 400,
    placeholderColor: "#your-brand-color",
  },
});

export const ImageProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const preloadGallery = async (images: string[]) => {
    for (const image of images) {
      await projectImageLoader.preloadImage(image, { priority: 2 });
    }
  };

  return (
    <ImageContext.Provider
      value={{
        loader: projectImageLoader,
        preloadGallery,
      }}
    >
      {children}
    </ImageContext.Provider>
  );
};

export const useImageSystem = () => {
  const context = useContext(ImageContext);
  if (!context) {
    throw new Error("useImageSystem must be used within ImageProvider");
  }
  return context;
};
```

## 🚨 6. حل المشاكل الشائعة

### مشكلة: "Cannot find module"

```bash
# تأكد من وجود المجلد في المكان الصحيح
ls src/image-system/

# تأكد من وجود index.ts
ls src/image-system/index.ts
```

### مشكلة: TypeScript errors

```json
// تأكد من إعدادات TypeScript في tsconfig.json
{
  "compilerOptions": {
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true
  },
  "include": ["src/**/*"]
}
```

### مشكلة: مسارات نسبية معقدة

```tsx
// بدلاً من
import { SmoothImage } from "../../../shared/image-system";

// استخدم absolute imports أو aliases
import { SmoothImage } from "@/shared/image-system";
```

## 📦 7. تحويل إلى حزمة NPM (للمشاريع الكبيرة)

### إنشاء package.json للنظام

```json
{
  "name": "my-image-system",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "scripts": {
    "build": "tsc",
    "prepublishOnly": "npm run build"
  },
  "peerDependencies": {
    "react": ">=16.8.0",
    "react-dom": ">=16.8.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "typescript": "^4.9.0"
  }
}
```

### نشر كحزمة خاصة

```bash
# نشر على npm registry خاص
npm publish --registry=https://your-private-registry.com

# أو على GitHub Packages
npm publish --registry=https://npm.pkg.github.com
```

## ✅ 8. قائمة التحقق للدمج

- [ ] نسخ مجلد `image-system` إلى المشروع
- [ ] تحديث المسارات في imports
- [ ] اختبار المكونات الأساسية
- [ ] التأكد من عمل الكاش
- [ ] اختبار التحميل المسبق
- [ ] تخصيص الإعدادات حسب المشروع
- [ ] إضافة معالجة الأخطاء
- [ ] اختبار على بيئات مختلفة (dev/production)

## 🔄 9. تحديث النظام

### عند تحديث النظام الأصلي:

```bash
# نسخ احتياطية للتخصيصات
cp src/image-system/config.ts backup-config.ts

# نسخ النسخة الجديدة
cp -r new-image-system/* src/image-system/

# دمج التخصيصات
# راجع الملفات يدوياً أو استخدم أدوات merge
```

### استخدام Git subtree (للمطورين المتقدمين):

```bash
# إضافة النظام كـ subtree
git subtree add --prefix=src/image-system https://github.com/your-repo/image-system.git main

# تحديث النظام
git subtree pull --prefix=src/image-system https://github.com/your-repo/image-system.git main
```

---
