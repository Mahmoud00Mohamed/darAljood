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
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const pxToMm = 0.264583;

  const arrowLength = 10;
  const arrowColor = { r: 101, g: 61, b: 112 };
  const arrowHeadColor = { r: 85, g: 51, b: 94 };
  const arrowOffsetFromText = 3;
  const purpleColor = { r: 101, g: 61, b: 112 };

  const getColorNameInArabic = (colorHex: string): string => {
    const colorMap: { [key: string]: string } = {
      "#161618": "أسود",
      "#1B263B": "كحلي",
      "#5C1A2B": "عنابي",
      "#F5F6F5": "أبيض",
      "#E7D7C1": "بيج",
      "#4A4A4A": "رمادي غامق",
    };
    return colorMap[colorHex] || "ملون";
  };

  const getMaterialNameInArabic = (material: string): string => {
    const materialMap: { [key: string]: string } = {
      cotton: "قطن",
      leather: "جلد",
    };
    return materialMap[material] || material;
  };

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

  const topStripHeight = 40 * pxToMm;
  pdf.setFillColor(0, 0, 0);
  // (101, 61, 112)
  pdf.rect(0, 0, pageWidth, topStripHeight, "F");

  const sizeBgWidthTop = 150 * pxToMm;
  const sizeBgWidthBottom = 80 * pxToMm;
  const sizeBgHeight = 60 * pxToMm;
  pdf.setFillColor(0, 0, 0);
  // (101, 61, 112)
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

  const rectWidth = 8;
  const rectHeight = 5;

  const trackingNumberText = options.orderNumber
    ? `Tracking No. ${options.orderNumber}`
    : "Tracking No. 000000";

  const topOffset = 20;
  const textX = rectWidth + 2;
  const textY = topOffset;

  pdf.setFillColor(purpleColor.r, purpleColor.g, purpleColor.b);
  pdf.rect(0, textY - rectHeight / 2, rectWidth, rectHeight, "F");

  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(12);
  pdf.text(trackingNumberText, textX, textY, { baseline: "middle" });

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
        } else if (i === 2) {
          const labelWidth =
            (pdf.getStringUnitWidth(imagePositions[i].label) *
              pdf.internal.getFontSize()) /
            pdf.internal.scaleFactor;
          pdf.setTextColor(0, 0, 0);
          pdf.setFontSize(10);
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

    const bodyColor =
      options.cartItems[0]?.jacketConfig.colors.body || "#161618";
    const bodyMaterial =
      options.cartItems[0]?.jacketConfig.materials.body || "cotton";

    const colorNameArabic = getColorNameInArabic(bodyColor);
    const materialNameArabic = getMaterialNameInArabic(bodyMaterial);

    const bodyInfoText = `الجسم ${materialNameArabic} لون ${colorNameArabic}`;

    const centerX = pageWidth / 2;
    const centerY = pageHeight / 1.6;

    pdf.setFontSize(12);

    const textParts = [
      { text: colorNameArabic, color: purpleColor },
      { text: " لون ", color: { r: 0, g: 0, b: 0 } },
      { text: materialNameArabic + " ", color: purpleColor },
      { text: "الجسم", color: { r: 0, g: 0, b: 0 } },
    ];

    let currentX =
      centerX -
      (pdf.getStringUnitWidth(bodyInfoText) * pdf.internal.getFontSize()) /
        (2 * pdf.internal.scaleFactor);
    textParts.forEach((part) => {
      pdf.setTextColor(part.color.r, part.color.g, part.color.b);
      pdf.text(part.text, currentX, centerY);
      currentX +=
        (pdf.getStringUnitWidth(part.text) * pdf.internal.getFontSize()) /
        pdf.internal.scaleFactor;
    });

    const arrowStartX = centerX;
    const arrowStartY = centerY + 3;
    const verticalDistance = 50 * pxToMm;
    const bendPointX = arrowStartX;
    const bendPointY = arrowStartY + verticalDistance;

    const angle = 145 * (Math.PI / 180);
    const diagonalLength = 36;

    const arrowEndX = bendPointX + Math.cos(angle) * diagonalLength;
    const arrowEndY = bendPointY + Math.sin(angle) * diagonalLength;

    pdf.setDrawColor(arrowColor.r, arrowColor.g, arrowColor.b);
    pdf.setLineWidth(0.5);
    pdf.line(arrowStartX, arrowStartY, bendPointX, bendPointY);
    pdf.line(bendPointX, bendPointY, arrowEndX, arrowEndY);

    const arrowHeadSize = 5;
    pdf.setFillColor(arrowHeadColor.r, arrowHeadColor.g, arrowHeadColor.b);
    const arrowHeadAdvance = 2;
    const arrowTipX = arrowEndX + Math.cos(angle) * arrowHeadAdvance;
    const arrowTipY = arrowEndY + Math.sin(angle) * arrowHeadAdvance;

    const headAngle1 = angle + Math.PI / 6;
    const headAngle2 = angle - Math.PI / 6;

    const head1X = arrowTipX - Math.cos(headAngle1) * arrowHeadSize;
    const head1Y = arrowTipY - Math.sin(headAngle1) * arrowHeadSize;

    const head2X = arrowTipX - Math.cos(headAngle2) * arrowHeadSize;
    const head2Y = arrowTipY - Math.sin(headAngle2) * arrowHeadSize;

    pdf.triangle(arrowTipX, arrowTipY, head1X, head1Y, head2X, head2Y, "F");
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

  const sleevesColor =
    options.cartItems[0]?.jacketConfig.colors.sleeves || "#1B263B";
  const sleevesMaterial =
    options.cartItems[0]?.jacketConfig.materials.sleeves || "leather";

  const sleevesColorNameArabic = getColorNameInArabic(sleevesColor);
  const sleevesMaterialNameArabic = getMaterialNameInArabic(sleevesMaterial);

  const sleevesInfoText = `الأكمام ${sleevesMaterialNameArabic} لون ${sleevesColorNameArabic}`;

  const sleevesTextX = pageWidth / 2;
  const sleevesTextY = pageHeight - 20;

  pdf.setFontSize(12);

  const sleevesTextParts = [
    { text: sleevesColorNameArabic, color: purpleColor },
    { text: " لون ", color: { r: 0, g: 0, b: 0 } },
    { text: sleevesMaterialNameArabic + " ", color: purpleColor },
    { text: "الأكمام", color: { r: 0, g: 0, b: 0 } },
  ];

  let sleevesCurrentX =
    sleevesTextX -
    (pdf.getStringUnitWidth(sleevesInfoText) * pdf.internal.getFontSize()) /
      (2 * pdf.internal.scaleFactor);
  sleevesTextParts.forEach((part) => {
    pdf.setTextColor(part.color.r, part.color.g, part.color.b);
    pdf.text(part.text, sleevesCurrentX, sleevesTextY);
    sleevesCurrentX +=
      (pdf.getStringUnitWidth(part.text) * pdf.internal.getFontSize()) /
      pdf.internal.scaleFactor;
  });

  const sleevesArrowSettings = {
    verticalPartLength: 15,
    diagonalAngleDegrees: 210,
    diagonalLength: 43,
    arrowHeadSize: 5,
    arrowStartOffset: 5,
  };

  const sleevesArrowStartX = sleevesTextX;
  const sleevesArrowStartY =
    sleevesTextY - sleevesArrowSettings.arrowStartOffset;

  const bendX = sleevesArrowStartX;
  const bendY = sleevesArrowStartY - sleevesArrowSettings.verticalPartLength;

  const angleRad = (sleevesArrowSettings.diagonalAngleDegrees * Math.PI) / 180;
  const sleevesArrowEndX =
    bendX + Math.cos(angleRad) * sleevesArrowSettings.diagonalLength;
  const sleevesArrowEndY =
    bendY + Math.sin(angleRad) * sleevesArrowSettings.diagonalLength;

  pdf.setDrawColor(arrowColor.r, arrowColor.g, arrowColor.b);
  pdf.setLineWidth(0.5);
  pdf.line(sleevesArrowStartX, sleevesArrowStartY, bendX, bendY);
  pdf.line(bendX, bendY, sleevesArrowEndX, sleevesArrowEndY);

  const headSize = sleevesArrowSettings.arrowHeadSize;
  pdf.setFillColor(arrowHeadColor.r, arrowHeadColor.g, arrowHeadColor.b);

  const arrowHeadAdvance = 2;
  const arrowTipX = sleevesArrowEndX + Math.cos(angleRad) * arrowHeadAdvance;
  const arrowTipY = sleevesArrowEndY + Math.sin(angleRad) * arrowHeadAdvance;

  const headAngle1 = angleRad + Math.PI / 6;
  const headAngle2 = angleRad - Math.PI / 6;

  const head1X = arrowTipX - Math.cos(headAngle1) * headSize;
  const head1Y = arrowTipY - Math.sin(headAngle1) * headSize;

  const head2X = arrowTipX - Math.cos(headAngle2) * headSize;
  const head2Y = arrowTipY - Math.sin(headAngle2) * headSize;

  pdf.triangle(arrowTipX, arrowTipY, head1X, head1Y, head2X, head2Y, "F");
  // Footer
  const footerHeight = 25 * pxToMm; // 20px
  pdf.setFillColor(0, 0, 0); // نفس لون الهيدر الجديد
  // (101, 61, 112)
  pdf.rect(0, pageHeight - footerHeight, pageWidth, footerHeight, "F");

  return pdf.output("blob");
};
