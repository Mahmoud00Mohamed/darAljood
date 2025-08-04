import React from "react";
import { Gallery } from "../src";
import type { Photo } from "../src/types";

// مثال على كيفية استخدام نظام المعرض
const ExampleUsage: React.FC = () => {
  const samplePhotos: Photo[] = [
    {
      id: "1",
      src: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      title: "مكتب الاستقبال الرئيسي",
      category: "المكتب",
      description: "منطقة الاستقبال الأنيقة في مقرنا الرئيسي",
      alt: "صورة مكتب الاستقبال",
    },
    {
      id: "2",
      src: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      title: "د. أحمد محمد العلي",
      category: "فريق العمل",
      description: "الشريك المؤسس ورئيس مجلس الإدارة",
      alt: "صورة د. أحمد محمد العلي",
    },
    {
      id: "3",
      src: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      title: "مؤتمر القانون التجاري 2024",
      category: "الفعاليات",
      description: "مشاركتنا في مؤتمر القانون التجاري السنوي",
      alt: "صورة مؤتمر القانون التجاري",
    },
  ];

  const categories = ["الكل", "المكتب", "فريق العمل", "الفعاليات", "الجوائز"];

  const handlePhotoClick = (photo: Photo) => {
    console.log("تم النقر على الصورة:", photo.title);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
        مثال على نظام معرض الصور
      </h1>

      <Gallery
        photos={samplePhotos}
        categories={categories}
        rtl={true}
        onPhotoClick={handlePhotoClick}
        showCategories={true}
        columnsConfig={{
          mobile: 1,
          tablet: 2,
          desktop: 3,
        }}
        className="max-w-6xl mx-auto"
      />
    </div>
  );
};

export default ExampleUsage;
