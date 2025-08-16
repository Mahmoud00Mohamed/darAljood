import mongoose from "mongoose";

const predefinedImageSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  url: {
    type: String,
    required: true,
  },
  publicId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  categoryId: {
    type: String,
    required: true,
    index: true,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 200,
    default: "شعار جاهز للاستخدام",
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  updatedBy: {
    type: String,
    required: true,
    default: "system",
  },
  width: {
    type: Number,
    min: 0,
  },
  height: {
    type: Number,
    min: 0,
  },
  format: {
    type: String,
    lowercase: true,
  },
  size: {
    type: Number,
    min: 0,
  },
});

// إنشاء فهارس للبحث السريع
predefinedImageSchema.index({ name: "text", description: "text" });
predefinedImageSchema.index({ categoryId: 1, createdAt: -1 });

// Middleware لتحديث updatedAt تلقائياً
predefinedImageSchema.pre("save", function(next) {
  this.updatedAt = new Date();
  next();
});

predefinedImageSchema.pre("findOneAndUpdate", function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

export default mongoose.model("PredefinedImage", predefinedImageSchema);