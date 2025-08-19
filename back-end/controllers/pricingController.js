import PricingModel from "../models/Pricing.js";

// الحصول على بيانات التسعير (عام - بدون مصادقة)
export const getPricing = async (req, res) => {
  try {
    const pricing = await PricingModel.getPricing();

    res.status(200).json({
      success: true,
      message: "تم الحصول على بيانات التسعير بنجاح",
      data: pricing,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء الحصول على بيانات التسعير",
      error: "GET_PRICING_FAILED",
    });
  }
};

// حساب السعر الإجمالي (عام - بدون مصادقة)
export const calculatePrice = async (req, res) => {
  try {
    const {
      frontLogos = 0,
      frontTexts = 0,
      rightSideLogos = 0,
      leftSideLogos = 0,
      quantity = 1,
    } = req.body;

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "الكمية يجب أن تكون 1 أو أكثر",
        error: "INVALID_QUANTITY",
      });
    }

    const totalPrice = await PricingModel.calculateTotalPrice(
      frontLogos,
      frontTexts,
      rightSideLogos,
      leftSideLogos,
      quantity
    );

    const breakdown = await PricingModel.getPricingBreakdown(
      frontLogos,
      frontTexts,
      rightSideLogos,
      leftSideLogos,
      quantity
    );

    res.status(200).json({
      success: true,
      message: "تم حساب السعر بنجاح",
      data: {
        totalPrice,
        breakdown,
        quantity,
        pricePerUnit: Math.round(totalPrice / quantity),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء حساب السعر",
      error: "PRICE_CALCULATION_FAILED",
    });
  }
};
// تحديث بيانات التسعير (يتطلب مصادقة المدير)
export const updatePricing = async (req, res) => {
  try {
    if (!req.admin || req.admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "غير مصرح لك بتحديث بيانات التسعير",
        error: "INSUFFICIENT_PERMISSIONS",
      });
    }

    const updates = req.body;
    const updatedBy = req.admin.username;

    if (!updates || typeof updates !== "object") {
      return res.status(400).json({
        success: false,
        message: "بيانات التحديث مطلوبة",
        error: "MISSING_UPDATE_DATA",
      });
    }

    const requiredFields = ["basePrice", "includedItems", "additionalCosts"];
    const missingFields = requiredFields.filter((field) => !(field in updates));

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `الحقول التالية مطلوبة: ${missingFields.join(", ")}`,
        error: "MISSING_REQUIRED_FIELDS",
      });
    }

    if (
      updates.basePrice &&
      (typeof updates.basePrice !== "number" || updates.basePrice <= 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "السعر الأساسي يجب أن يكون رقم موجب",
        error: "INVALID_BASE_PRICE",
      });
    }

    const updatedPricing = await PricingModel.updatePricing(updates, updatedBy);

    res.status(200).json({
      success: true,
      message: "تم تحديث بيانات التسعير بنجاح",
      data: updatedPricing,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "حدث خطأ أثناء تحديث التسعير",
      error: "UPDATE_PRICING_FAILED",
    });
  }
};
// إعادة تعيين الأسعار إلى القيم الافتراضية (يتطلب مصادقة المدير)
export const resetPricing = async (req, res) => {
  try {
    if (!req.admin || req.admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "غير مصرح لك بإعادة تعيين الأسعار",
        error: "INSUFFICIENT_PERMISSIONS",
      });
    }

    const updatedBy = req.admin.username;
    const resetPricing = await PricingModel.resetToDefaults(updatedBy);

    res.status(200).json({
      success: true,
      message: "تم إعادة تعيين الأسعار إلى القيم الافتراضية بنجاح",
      data: resetPricing,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "حدث خطأ أثناء إعادة تعيين الأسعار",
      error: "RESET_PRICING_FAILED",
    });
  }
};

// الحصول على تاريخ التحديثات (يتطلب مصادقة المدير)
export const getPricingHistory = async (req, res) => {
  try {
    if (!req.admin || req.admin.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "غير مصرح لك بعرض تاريخ التحديثات",
        error: "INSUFFICIENT_PERMISSIONS",
      });
    }

    const pricing = await PricingModel.getPricing();

    res.status(200).json({
      success: true,
      message: "تم الحصول على تاريخ التحديثات بنجاح",
      data: {
        lastUpdated: pricing.lastUpdated,
        updatedBy: pricing.updatedBy,
        currentPricing: pricing,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "حدث خطأ أثناء الحصول على تاريخ التحديثات",
      error: "GET_HISTORY_FAILED",
    });
  }
};
