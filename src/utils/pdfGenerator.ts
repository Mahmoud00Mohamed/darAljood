import jsPDF from "jspdf";
import { CartItem } from "../context/CartContext";

export interface PDFGenerationOptions {
  cartItems: CartItem[];
  totalPrice: number;
  customerInfo: {
    name: string;
    phone: string;
  };
  orderNumber?: string;
}

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
  const margin = 15;
  const pxToMm = 0.264583;

  // 🎯 إعدادات التحكم في السهم
  const arrowLength = 10; // طول السهم
  const arrowColor = { r: 128, g: 0, b: 128 }; // لون السهم
  const arrowHeadColor = { r: 90, g: 0, b: 90 }; // لون رأس السهم
  const arrowOffsetFromText = 3; // المسافة بين النص وبداية السهم

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

  // الشريط العلوي
  const topStripHeight = 40 * pxToMm;
  pdf.setFillColor(0, 0, 0);
  pdf.rect(0, 0, pageWidth, topStripHeight, "F");

  // شكل المقاس
  const sizeBgWidthTop = 150 * pxToMm;
  const sizeBgWidthBottom = 80 * pxToMm;
  const sizeBgHeight = 60 * pxToMm;
  pdf.setFillColor(0, 0, 0);
  pdf.triangle(
    (pageWidth - sizeBgWidthTop) / 2,
    topStripHeight,
    (pageWidth + sizeBgWidthTop) / 2,
    topStripHeight,
    (pageWidth - sizeBgWidthBottom) / 2,
    topStripHeight + sizeBgHeight,
    "F"
  );
  pdf.triangle(
    (pageWidth + sizeBgWidthTop) / 2,
    topStripHeight,
    (pageWidth - sizeBgWidthBottom) / 2,
    topStripHeight + sizeBgHeight,
    (pageWidth + sizeBgWidthBottom) / 2,
    topStripHeight + sizeBgHeight,
    "F"
  );

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(18);
  pdf.text("SIZE", pageWidth / 2, topStripHeight + 15 * pxToMm, {
    align: "center",
  });

  const size = options.cartItems[0]?.jacketConfig.size || "M";
  pdf.setFontSize(20);
  pdf.text(size, pageWidth / 2, topStripHeight + 45 * pxToMm, {
    align: "center",
  });

  // مستطيل بنفسجي + Tracking No
  const rectWidth = 8;
  const rectHeight = 5;
  const purpleColor = { r: 128, g: 0, b: 128 };

  const trackingNumberText = options.orderNumber
    ? `Tracking No. ${options.orderNumber}`
    : "Tracking No. 000000";

  const topOffset = 20; // mm
  const textX = rectWidth + 2;
  const textY = topOffset;

  pdf.setFillColor(purpleColor.r, purpleColor.g, purpleColor.b);
  pdf.rect(0, textY - rectHeight / 2, rectWidth, rectHeight, "F");

  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(12);
  pdf.text(trackingNumberText, textX, textY, { baseline: "middle" });

  // إعداد الصور
  const imagesStartY = topStripHeight + sizeBgHeight + 50 * pxToMm;
  const imageSpacing = 5;
  const extraVerticalSpacing = 5;
  const imageWidth = 90;
  const imageHeight = 115;

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

        if (i === 0) {
          pdf.setTextColor(0, 0, 0);
          pdf.setFontSize(10);

          // الكتف الأيسر → الجهة اليمنى
          const leftLabel = "الجهة اليمنى";
          const leftTextX = imagePositions[i].x + 20;
          const leftTextY = imagePositions[i].y - 5;
          const leftArrowYStart = leftTextY + arrowOffsetFromText;
          const leftArrowYEnd = leftArrowYStart + arrowLength;

          pdf.text(leftLabel, leftTextX, leftTextY, { align: "center" });

          pdf.setDrawColor(arrowColor.r, arrowColor.g, arrowColor.b);
          pdf.line(leftTextX, leftArrowYStart, leftTextX, leftArrowYEnd);

          pdf.setFillColor(
            arrowHeadColor.r,
            arrowHeadColor.g,
            arrowHeadColor.b
          );
          pdf.triangle(
            leftTextX - 1.5,
            leftArrowYEnd,
            leftTextX + 1.5,
            leftArrowYEnd,
            leftTextX,
            leftArrowYEnd + 3,
            "F"
          );

          // الكتف الأيمن → الجهة اليسرى
          const rightLabel = "الجهة اليسرى";
          const rightTextX = imagePositions[i].x + imageWidth - 20;
          const rightTextY = imagePositions[i].y - 5;
          const rightArrowYStart = rightTextY + arrowOffsetFromText;
          const rightArrowYEnd = rightArrowYStart + arrowLength;

          pdf.text(rightLabel, rightTextX, rightTextY, { align: "center" });

          pdf.setDrawColor(arrowColor.r, arrowColor.g, arrowColor.b);
          pdf.line(rightTextX, rightArrowYStart, rightTextX, rightArrowYEnd);

          pdf.setFillColor(
            arrowHeadColor.r,
            arrowHeadColor.g,
            arrowHeadColor.b
          );
          pdf.triangle(
            rightTextX - 1.5,
            rightArrowYEnd,
            rightTextX + 1.5,
            rightArrowYEnd,
            rightTextX,
            rightArrowYEnd + 3,
            "F"
          );

          // نص الواجهة الأمامية أسفل الصورة
          const labelWidth =
            (pdf.getStringUnitWidth(imagePositions[i].label) *
              pdf.internal.getFontSize()) /
            pdf.internal.scaleFactor;
          pdf.setTextColor(0, 0, 0);
          pdf.text(
            imagePositions[i].label,
            imagePositions[i].x + (imageWidth - labelWidth) / 2,
            imagePositions[i].y + imageHeight + 5
          );
        } else {
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
        }
      } catch (error) {
        console.error(`Error adding image ${i}:`, error);
      }
    }
  } else {
    pdf.setTextColor(100, 100, 100);
    pdf.setFontSize(12);
    const noImagesText =
      "لم يتم التقاط صور للجاكيت - سيتم التواصل معك لتأكيد التفاصيل";
    const textWidth =
      (pdf.getStringUnitWidth(noImagesText) * pdf.internal.getFontSize()) /
      pdf.internal.scaleFactor;
    pdf.text(noImagesText, (pageWidth - textWidth) / 2, imagesStartY + 50);

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

  return pdf.output("blob");
};
