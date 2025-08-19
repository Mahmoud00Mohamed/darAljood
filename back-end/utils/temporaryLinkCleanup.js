import TemporaryLinkModel from "../models/TemporaryLink.js";

/**
 * مهمة تنظيف الروابط المنتهية الصلاحية
 */
export const scheduleTemporaryLinkCleanup = () => {
  const cleanupInterval = 60 * 60 * 1000;

  setInterval(async () => {
    try {
      const deletedCount = await TemporaryLinkModel.cleanupExpiredLinks();
    } catch (error) {
      // Error handling without console
    }
  }, cleanupInterval);
};

/**
 * تنظيف فوري للروابط المنتهية الصلاحية
 */
export const immediateCleanup = async () => {
  try {
    const deletedCount = await TemporaryLinkModel.cleanupExpiredLinks();
    return deletedCount;
  } catch (error) {
    return 0;
  }
};
