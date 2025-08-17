import mongoose from "mongoose";

const temporaryLinkSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  orderId: {
    type: String,
    required: true,
    index: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  isUsed: {
    type: Boolean,
    default: false,
    index: true,
  },
  usedAt: {
    type: Date,
  },
  createdBy: {
    type: String,
    required: true,
    default: "admin",
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  accessCount: {
    type: Number,
    default: 0,
  },
  lastAccessAt: {
    type: Date,
  },
  userAgent: {
    type: String,
  },
  ipAddress: {
    type: String,
  },
});

// إنشاء فهرس للحذف التلقائي للروابط المنتهية الصلاحية
temporaryLinkSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// إنشاء فهرس مركب للبحث السريع
temporaryLinkSchema.index({ orderId: 1, isUsed: 1 });
temporaryLinkSchema.index({ token: 1, expiresAt: 1 });

// Middleware لتحديث lastAccessAt عند الوصول
temporaryLinkSchema.pre("findOneAndUpdate", function (next) {
  if (this.getUpdate().$inc && this.getUpdate().$inc.accessCount) {
    this.set({ lastAccessAt: new Date() });
  }
  next();
});

export default mongoose.model("TemporaryLink", temporaryLinkSchema);
