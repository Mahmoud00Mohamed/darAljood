import PricingSchema from "./schemas/PricingSchema.js";

// البيانات الافتراضية
const DEFAULT_PRICING = {
  id: "pricing_config",
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
  updatedBy: "system",
};

class PricingModel {
  /**
   * تهيئة بيانات التسعير الافتراضية
   */
  async initializeDefaultPricing() {
    try {
      const existingPricing = await PricingSchema.findOne({
        id: "pricing_config",
      });

      if (!existingPricing) {
        const newPricing = new PricingSchema(DEFAULT_PRICING);
        await newPricing.save();
      }
    } catch (error) {
      throw new Error("فشل في تهيئة بيانات التسعير");
    }
  }

  /**
   * قراءة بيانات التسعير
   */
  async getPricing() {
    try {
      const pricing = await PricingSchema.findOne({
        id: "pricing_config",
      }).lean();

      if (!pricing) {
        await this.initializeDefaultPricing();
        const newPricing = await PricingSchema.findOne({
          id: "pricing_config",
        }).lean();
        return {
          ...newPricing,
          _id: undefined,
        };
      }

      return {
        ...pricing,
        _id: undefined,
      };
    } catch (error) {
      return DEFAULT_PRICING;
    }
  }

  /**
   * تحديث بيانات التسعير
   */
  async updatePricing(updates, updatedBy = "admin") {
    try {
      const updatedPricing = await PricingSchema.findOneAndUpdate(
        { id: "pricing_config" },
        {
          ...updates,
          updatedBy,
          lastUpdated: new Date(),
        },
        {
          new: true,
          upsert: true,
          lean: true,
        }
      );

      return {
        ...updatedPricing,
        _id: undefined,
      };
    } catch (error) {
      throw new Error("فشل في تحديث بيانات التسعير");
    }
  }

  /**
   * حساب السعر الإجمالي
   */
  async calculateTotalPrice(
    frontLogos,
    frontTexts,
    rightSideLogos,
    leftSideLogos,
    quantity = 1
  ) {
    try {
      const pricing = await this.getPricing();
      let totalPrice = pricing.basePrice;

      const totalFrontItems = frontLogos + frontTexts;
      if (totalFrontItems > pricing.includedItems.frontItems) {
        const extraFrontItems =
          totalFrontItems - pricing.includedItems.frontItems;
        totalPrice += extraFrontItems * pricing.additionalCosts.frontExtraItem;
      }

      if (rightSideLogos > pricing.includedItems.rightSideLogos) {
        const extraRightLogos =
          rightSideLogos - pricing.includedItems.rightSideLogos;
        totalPrice +=
          extraRightLogos * pricing.additionalCosts.rightSideThirdLogo;
      }

      if (leftSideLogos > pricing.includedItems.leftSideLogos) {
        const extraLeftLogos =
          leftSideLogos - pricing.includedItems.leftSideLogos;
        totalPrice +=
          extraLeftLogos * pricing.additionalCosts.leftSideThirdLogo;
      }

      const finalPrice = totalPrice * quantity;

      return Math.round(finalPrice);
    } catch (error) {
      throw new Error("فشل في حساب السعر");
    }
  }

  /**
   * الحصول على تفاصيل التسعير
   */
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

      finalPrice = totalPrice * quantity;
      breakdown.appliedDiscount = null;

      breakdown.finalPrice = Math.round(finalPrice);

      return breakdown;
    } catch (error) {
      throw new Error("فشل في حساب تفاصيل التسعير");
    }
  }

  /**
   * إعادة تعيين إلى القيم الافتراضية
   */
  async resetToDefaults(updatedBy = "admin") {
    try {
      const resetData = {
        ...DEFAULT_PRICING,
        lastUpdated: new Date(),
        updatedBy,
      };

      const updatedPricing = await PricingSchema.findOneAndUpdate(
        { id: "pricing_config" },
        resetData,
        {
          new: true,
          upsert: true,
          lean: true,
        }
      );

      return {
        ...updatedPricing,
        _id: undefined,
      };
    } catch (error) {
      throw new Error("فشل في إعادة تعيين الأسعار");
    }
  }
}

export default new PricingModel();
