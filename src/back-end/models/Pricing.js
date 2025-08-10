import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// مسار ملف البيانات
const DATA_FILE = path.join(__dirname, "../data/pricing.json");

// البيانات الافتراضية
const DEFAULT_PRICING = {
  basePrice: 220,
  includedItems: {
    backLogo: true,
    backText: true,
    rightSideLogos: 2,
    leftSideLogos: 2,
    frontItems: 1,
  },
  additionalCosts: {
    frontExtraItem: 25,
    rightSideThirdLogo: 25,
    leftSideThirdLogo: 25,
  },
  discounts: {
    quantity25: 0.17, // 17% خصم للطلبات 25 قطعة فأكثر
    quantity50: 0.2, // 20% خصم للطلبات 50 قطعة فأكثر
    quantity100: 0.25, // 25% خصم للطلبات 100 قطعة فأكثر
  },
  lastUpdated: new Date().toISOString(),
  updatedBy: "system",
};

class PricingModel {
  constructor() {
    this.ensureDataDirectory();
    this.ensureDataFile();
  }

  // التأكد من وجود مجلد البيانات
  async ensureDataDirectory() {
    const dataDir = path.dirname(DATA_FILE);
    try {
      await fs.access(dataDir);
    } catch {
      await fs.mkdir(dataDir, { recursive: true });
    }
  }

  // التأكد من وجود ملف البيانات
  async ensureDataFile() {
    try {
      await fs.access(DATA_FILE);
    } catch {
      await this.savePricing(DEFAULT_PRICING);
    }
  }

  // قراءة بيانات التسعير
  async getPricing() {
    try {
      const data = await fs.readFile(DATA_FILE, "utf8");
      return JSON.parse(data);
    } catch (error) {
      console.error("Error reading pricing data:", error);
      return DEFAULT_PRICING;
    }
  }

  // حفظ بيانات التسعير
  async savePricing(pricingData) {
    try {
      const dataToSave = {
        ...pricingData,
        lastUpdated: new Date().toISOString(),
      };

      await fs.writeFile(
        DATA_FILE,
        JSON.stringify(dataToSave, null, 2),
        "utf8"
      );
      return dataToSave;
    } catch (error) {
      console.error("Error saving pricing data:", error);
      throw new Error("فشل في حفظ بيانات التسعير");
    }
  }

  // تحديث بيانات التسعير
  async updatePricing(updates, updatedBy = "admin") {
    try {
      const currentPricing = await this.getPricing();
      const updatedPricing = {
        ...currentPricing,
        ...updates,
        lastUpdated: new Date().toISOString(),
        updatedBy,
      };

      return await this.savePricing(updatedPricing);
    } catch (error) {
      console.error("Error updating pricing:", error);
      throw new Error("فشل في تحديث بيانات التسعير");
    }
  }

  // حساب السعر الإجمالي
  calculateTotalPrice(
    frontLogos,
    frontTexts,
    rightSideLogos,
    leftSideLogos,
    quantity = 1
  ) {
    return new Promise(async (resolve, reject) => {
      try {
        const pricing = await this.getPricing();
        let totalPrice = pricing.basePrice;

        // حساب العناصر الأمامية الإضافية
        const totalFrontItems = frontLogos + frontTexts;
        if (totalFrontItems > pricing.includedItems.frontItems) {
          const extraFrontItems =
            totalFrontItems - pricing.includedItems.frontItems;
          totalPrice +=
            extraFrontItems * pricing.additionalCosts.frontExtraItem;
        }

        // حساب الشعارات الإضافية في الجهة اليمنى
        if (rightSideLogos > pricing.includedItems.rightSideLogos) {
          const extraRightLogos =
            rightSideLogos - pricing.includedItems.rightSideLogos;
          totalPrice +=
            extraRightLogos * pricing.additionalCosts.rightSideThirdLogo;
        }

        // حساب الشعارات الإضافية في الجهة اليسرى
        if (leftSideLogos > pricing.includedItems.leftSideLogos) {
          const extraLeftLogos =
            leftSideLogos - pricing.includedItems.leftSideLogos;
          totalPrice +=
            extraLeftLogos * pricing.additionalCosts.leftSideThirdLogo;
        }

        // تطبيق خصومات الكمية
        let finalPrice = totalPrice * quantity;
        if (quantity >= 100 && pricing.discounts.quantity100) {
          finalPrice = finalPrice * (1 - pricing.discounts.quantity100);
        } else if (quantity >= 50 && pricing.discounts.quantity50) {
          finalPrice = finalPrice * (1 - pricing.discounts.quantity50);
        } else if (quantity >= 25 && pricing.discounts.quantity25) {
          finalPrice = finalPrice * (1 - pricing.discounts.quantity25);
        }

        resolve(Math.round(finalPrice));
      } catch (error) {
        reject(error);
      }
    });
  }

  // الحصول على تفاصيل التسعير
  async getPricingBreakdown(
    frontLogos,
    frontTexts,
    rightSideLogos,
    leftSideLogos,
    quantity = 1
  ) {
    try {
      const pricing = await this.getPricing();
      const breakdown = {
        basePrice: pricing.basePrice,
        additionalCosts: [],
        totalPrice: 0,
        appliedDiscount: null,
        finalPrice: 0,
      };

      let totalPrice = pricing.basePrice;

      // حساب التكاليف الإضافية
      const totalFrontItems = frontLogos + frontTexts;
      if (totalFrontItems > pricing.includedItems.frontItems) {
        const extraFrontItems =
          totalFrontItems - pricing.includedItems.frontItems;
        breakdown.additionalCosts.push({
          item: "عناصر أمامية إضافية",
          cost: pricing.additionalCosts.frontExtraItem,
          quantity: extraFrontItems,
        });
        totalPrice += extraFrontItems * pricing.additionalCosts.frontExtraItem;
      }

      if (rightSideLogos > pricing.includedItems.rightSideLogos) {
        const extraRightLogos =
          rightSideLogos - pricing.includedItems.rightSideLogos;
        breakdown.additionalCosts.push({
          item: "شعارات إضافية - جهة يمنى",
          cost: pricing.additionalCosts.rightSideThirdLogo,
          quantity: extraRightLogos,
        });
        totalPrice +=
          extraRightLogos * pricing.additionalCosts.rightSideThirdLogo;
      }

      if (leftSideLogos > pricing.includedItems.leftSideLogos) {
        const extraLeftLogos =
          leftSideLogos - pricing.includedItems.leftSideLogos;
        breakdown.additionalCosts.push({
          item: "شعارات إضافية - جهة يسرى",
          cost: pricing.additionalCosts.leftSideThirdLogo,
          quantity: extraLeftLogos,
        });
        totalPrice +=
          extraLeftLogos * pricing.additionalCosts.leftSideThirdLogo;
      }

      breakdown.totalPrice = totalPrice;
      let finalPrice = totalPrice * quantity;

      // تطبيق خصومات الكمية
      if (quantity >= 100 && pricing.discounts.quantity100) {
        const discount = pricing.discounts.quantity100;
        finalPrice = finalPrice * (1 - discount);
        breakdown.appliedDiscount = {
          type: "quantity100",
          percentage: discount * 100,
          amount: totalPrice * quantity - finalPrice,
        };
      } else if (quantity >= 50 && pricing.discounts.quantity50) {
        const discount = pricing.discounts.quantity50;
        finalPrice = finalPrice * (1 - discount);
        breakdown.appliedDiscount = {
          type: "quantity50",
          percentage: discount * 100,
          amount: totalPrice * quantity - finalPrice,
        };
      } else if (quantity >= 25 && pricing.discounts.quantity25) {
        const discount = pricing.discounts.quantity25;
        finalPrice = finalPrice * (1 - discount);
        breakdown.appliedDiscount = {
          type: "quantity25",
          percentage: discount * 100,
          amount: totalPrice * quantity - finalPrice,
        };
      }

      breakdown.finalPrice = Math.round(finalPrice);

      return breakdown;
    } catch (error) {
      console.error("Error calculating pricing breakdown:", error);
      throw new Error("فشل في حساب تفاصيل التسعير");
    }
  }

  // إعادة تعيين إلى القيم الافتراضية
  async resetToDefaults(updatedBy = "admin") {
    try {
      const defaultData = {
        ...DEFAULT_PRICING,
        lastUpdated: new Date().toISOString(),
        updatedBy,
      };

      return await this.savePricing(defaultData);
    } catch (error) {
      console.error("Error resetting pricing:", error);
      throw new Error("فشل في إعادة تعيين الأسعار");
    }
  }
}

export default new PricingModel();
