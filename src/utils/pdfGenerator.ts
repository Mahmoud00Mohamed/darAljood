import jsPDF from "jspdf";
import { CartItem } from "../context/CartContext";

export interface PDFGenerationOptions {
  cartItems: CartItem[];
  totalPrice: number;
  customerInfo: {
    name: string;
    phone: string;
  };
}

const getColorName = (colorValue: string): string => {
  const colorMap: { [key: string]: string } = {
    "#141414": "أسود",
    "#1B263B": "كحلي",
    "#F5F6F5": "أبيض",
    "#E7D7C1": "بيج",
    "#4A4A4A": "رمادي غامق",
    "#5C1A2B": "عنابي",
  };

  if (colorValue.includes("_stripes")) {
    const baseColor = colorValue.split("_")[0];
    const baseName = colorMap[baseColor] || "غير محدد";
    return `${baseName} مع خطوط بيضاء`;
  }

  return colorMap[colorValue] || "غير محدد";
};

const getMaterialName = (material: string): string => {
  const materialMap: { [key: string]: string } = {
    leather: "جلد",
    cotton: "قطن",
  };
  return materialMap[material] || material;
};

export const generateOrderPDFWithImages = async (
  options: PDFGenerationOptions,
  jacketImages: string[]
): Promise<Blob> => {
  const pdf = new jsPDF({
    orientation: "p",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;

  let AmiriBold;
  try {
    const response = await fetch("/fonts/Amiri-Bold.ttf");
    const fontBlob = await response.blob();
    const reader = new FileReader();
    AmiriBold = await new Promise<string>((resolve) => {
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(fontBlob);
    });
    pdf.addFileToVFS("Amiri-Bold.ttf", AmiriBold.split(",")[1]);
    pdf.addFont("Amiri-Bold.ttf", "Amiri", "bold");
    pdf.setFont("Amiri", "bold");
  } catch (error) {
    console.error("Error loading Amiri font:", error);
    pdf.setFont("Helvetica");
  }

  // Header with customer info and size
  const headerHeight = 50 / 2.83465; // 50px converted to mm
  pdf.setFillColor(86, 54, 96);
  pdf.rect(0, 0, pageWidth, headerHeight, "F");

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(12);

  // نص دار الجود في أعلى اليسار داخل الهيدر
  const storeInfo = "دار الجود | واتساب: 0536065766";
  pdf.text(storeInfo, margin, headerHeight / 2, {
    baseline: "middle",
  });

  // Customer info on the right side of header
  const customerName = `الاسم: ${options.customerInfo.name}`;
  const customerPhone = `الهاتف: ${options.customerInfo.phone}`;

  // Calculate text width for right alignment
  const nameWidth =
    (pdf.getStringUnitWidth(customerName) * pdf.internal.getFontSize()) /
    pdf.internal.scaleFactor;
  const phoneWidth =
    (pdf.getStringUnitWidth(customerPhone) * pdf.internal.getFontSize()) /
    pdf.internal.scaleFactor;

  // Position customer info on the right side
  pdf.text(customerName, pageWidth - nameWidth - margin, headerHeight / 3, {
    baseline: "middle",
  });
  pdf.text(
    customerPhone,
    pageWidth - phoneWidth - margin,
    (headerHeight * 2) / 3,
    {
      baseline: "middle",
    }
  );

  // Size in the center
  const size = options.cartItems[0]?.jacketConfig.size || "M";
  const sizeText = `${size} :المقاس`; // <-- تم التعديل هنا
  const sizeTextWidth =
    (pdf.getStringUnitWidth(sizeText) * pdf.internal.getFontSize()) /
    pdf.internal.scaleFactor;

  pdf.setFontSize(14);
  pdf.text((pageWidth - sizeTextWidth) / 2, headerHeight / 2, sizeText, {
    baseline: "middle",
  });

  const imagesStartY = headerHeight + 1;
  const footerHeight = 20;

  const imageSpacing = 5;
  const extraVerticalSpacing = 5;

  const imageWidth = 90;
  const imageHeight = 120;

  const imagePositions = [
    { x: margin, y: imagesStartY, label: "الواجهة الأمامية" },
    {
      x: margin + imageWidth + imageSpacing,
      y: imagesStartY,
      label: "الواجهة الخلفية",
    },
    {
      x: margin,
      y: imagesStartY + imageHeight + imageSpacing + extraVerticalSpacing,
      label: "الجهة اليمنى",
    },
    {
      x: margin + imageWidth + imageSpacing,
      y: imagesStartY + imageHeight + imageSpacing + extraVerticalSpacing,
      label: "الجهة اليسرى",
    },
  ];

  // إضافة الصور مع معالجة أفضل للأخطاء
  if (jacketImages && jacketImages.length > 0) {
    for (let i = 0; i < Math.min(jacketImages.length, 4); i++) {
      if (
        !jacketImages[i] ||
        !jacketImages[i].startsWith("data:image/png;base64,")
      ) {
        console.warn(`Skipping invalid image ${i}`);
        continue;
      }

      try {
        pdf.addImage(
          jacketImages[i],
          "PNG",
          imagePositions[i].x,
          imagePositions[i].y,
          imageWidth,
          imageHeight,
          undefined,
          "SLOW"
        );
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(10);
        const labelWidth =
          (pdf.getStringUnitWidth(imagePositions[i].label) *
            pdf.internal.getFontSize()) /
          pdf.internal.scaleFactor;
        pdf.text(
          imagePositions[i].label,
          imagePositions[i].x + (imageWidth - labelWidth) / 2,
          imagePositions[i].y + imageHeight + 5
        );
      } catch (error) {
        console.error(`Error adding image ${i}:`, error);
      }
    }
  } else {
    // إضافة نص بديل إذا لم تكن هناك صور
    pdf.setTextColor(100, 100, 100);
    pdf.setFontSize(12);
    const noImagesText =
      "لم يتم التقاط صور للجاكيت - سيتم التواصل معك لتأكيد التفاصيل";
    const textWidth =
      (pdf.getStringUnitWidth(noImagesText) * pdf.internal.getFontSize()) /
      pdf.internal.scaleFactor;
    pdf.text(noImagesText, (pageWidth - textWidth) / 2, imagesStartY + 50);

    // إضافة مربعات فارغة لتوضيح مواقع الصور
    imagePositions.forEach((pos) => {
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(1);
      pdf.rect(pos.x, pos.y, imageWidth, imageHeight);

      pdf.setTextColor(150, 150, 150);
      pdf.setFontSize(10);
      const labelWidth =
        (pdf.getStringUnitWidth(pos.label) * pdf.internal.getFontSize()) /
        pdf.internal.scaleFactor;
      pdf.text(
        pos.label,
        pos.x + (imageWidth - labelWidth) / 2,
        pos.y + imageHeight / 2
      );
    });
  }

  const footerStartY = pageHeight - footerHeight;
  pdf.setFillColor(86, 54, 96);
  pdf.rect(0, footerStartY, pageWidth, footerHeight, "F");

  if (options.cartItems.length > 0) {
    const jacketConfig = options.cartItems[0].jacketConfig;
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(9);

    const bodyMaterial = getMaterialName(jacketConfig.materials.body);
    const sleevesMaterial = getMaterialName(jacketConfig.materials.sleeves);
    const bodyColor = getColorName(jacketConfig.colors.body);
    const sleevesColor = getColorName(jacketConfig.colors.sleeves);
    const trimColor = getColorName(jacketConfig.colors.trim);
    const detailsText = `الخامات: الجسم ${bodyMaterial} - الأكمام ${sleevesMaterial} | الألوان: الجسم ${bodyColor} - الأكمام ${sleevesColor} - الياقة ${trimColor} | السعر الإجمالي: ${options.totalPrice} ريال`;
    const detailsWidth =
      (pdf.getStringUnitWidth(detailsText) * pdf.internal.getFontSize()) /
      pdf.internal.scaleFactor;
    pdf.text(detailsText, (pageWidth - detailsWidth) / 2, footerStartY + 10);
  }

  pdf.setFontSize(7);
  pdf.setTextColor(255, 255, 255);
  const contactText = "دار الجود | واتساب: 0536065766 | www.daraljoud.com";
  const contactTextWidth =
    (pdf.getStringUnitWidth(contactText) * pdf.internal.getFontSize()) /
    pdf.internal.scaleFactor;
  pdf.text(contactText, (pageWidth - contactTextWidth) / 2, pageHeight - 5);

  return pdf.output("blob");
};
