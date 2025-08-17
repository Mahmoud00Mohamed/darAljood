import TemporaryLinkModel from "../models/TemporaryLink.js";

/**
 * مهمة تنظيف الروابط المنتهية الصلاحية
 */
export const scheduleTemporaryLinkCleanup = () => {
  // تنظيف كل ساعة
  const cleanupInterval = 60 * 60 * 1000; // ساعة واحدة

  setInterval(async () => {
    try {
      console.log("🧹 بدء تنظيف الروابط المنتهية الصلاحية...");
      const deletedCount = await TemporaryLinkModel.cleanupExpiredLinks();

      if (deletedCount > 0) {
        console.log(`✅ تم حذف ${deletedCount} رابط منتهي الصلاحية`);
      }
    } catch (error) {
      console.error("❌ خطأ في تنظيف الروابط المؤقتة:", error);
    }
  }, cleanupInterval);

  console.log("⏰ تم جدولة تنظيف الروابط المؤقتة كل ساعة");
};

/**
 * تنظيف فوري للروابط المنتهية الصلاحية
 */
export const immediateCleanup = async () => {
  try {
    console.log("🧹 تنظيف فوري للروابط المنتهية الصلاحية...");
    const deletedCount = await TemporaryLinkModel.cleanupExpiredLinks();
    console.log(`✅ تم حذف ${deletedCount} رابط منتهي الصلاحية`);
    return deletedCount;
  } catch (error) {
    console.error("❌ خطأ في التنظيف الفوري:", error);
    return 0;
  }
};
